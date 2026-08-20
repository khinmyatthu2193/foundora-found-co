-- INTERESTS
CREATE TABLE public.interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT interests_no_self CHECK (sender_id <> receiver_id),
  CONSTRAINT interests_status_check CHECK (status IN ('pending','accepted','rejected')),
  CONSTRAINT interests_unique UNIQUE (sender_id, receiver_id)
);
GRANT SELECT, INSERT, UPDATE ON public.interests TO authenticated;
GRANT ALL ON public.interests TO service_role;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users create their own interests" ON public.interests FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users view interests they take part in" ON public.interests FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users update their own sent interests" ON public.interests FOR UPDATE TO authenticated USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);
CREATE TRIGGER update_interests_updated_at BEFORE UPDATE ON public.interests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MATCHES
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT matches_no_self CHECK (user_a <> user_b),
  CONSTRAINT matches_ordered CHECK (user_a < user_b),
  CONSTRAINT matches_unique UNIQUE (user_a, user_b)
);
GRANT SELECT ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their own matches" ON public.matches FOR SELECT TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);

-- MESSAGES
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_match_member(_match_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = _match_id AND (m.user_a = _user_id OR m.user_b = _user_id)
  );
$$;

CREATE POLICY "Match members read messages" ON public.messages FOR SELECT TO authenticated
  USING (public.is_match_member(match_id, auth.uid()));
CREATE POLICY "Match members send their own messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.is_match_member(match_id, auth.uid()));

-- AUTO MATCH ON MUTUAL INTEREST
CREATE OR REPLACE FUNCTION public.create_match_on_mutual_interest()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.interests i
    WHERE i.sender_id = NEW.receiver_id AND i.receiver_id = NEW.sender_id
      AND i.status <> 'rejected'
  ) THEN
    INSERT INTO public.matches (user_a, user_b)
    VALUES (least(NEW.sender_id, NEW.receiver_id), greatest(NEW.sender_id, NEW.receiver_id))
    ON CONFLICT (user_a, user_b) DO NOTHING;

    UPDATE public.interests
       SET status = 'accepted'
     WHERE (sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id)
        OR (sender_id = NEW.receiver_id AND receiver_id = NEW.sender_id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER interests_mutual_match AFTER INSERT ON public.interests
FOR EACH ROW EXECUTE FUNCTION public.create_match_on_mutual_interest();

-- DISCOVERY: include interest state, keep UUIDs hidden
DROP FUNCTION IF EXISTS public.discover_founders();
CREATE FUNCTION public.discover_founders()
RETURNS TABLE(discovery_id text, anonymous_name text, skills text[], industry_interests text[], available_hours integer, experience_level text, looking_for text, working_style text, commitment_level text, desired_partner_traits text[], interest_sent boolean, is_matched boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    md5(p.id::text || 'foundora-discovery') AS discovery_id,
    p.anonymous_name, p.skills, p.industry_interests, p.available_hours,
    p.experience_level, p.looking_for, p.working_style, p.commitment_level,
    p.desired_partner_traits,
    EXISTS (SELECT 1 FROM public.interests i WHERE i.sender_id = auth.uid() AND i.receiver_id = p.id) AS interest_sent,
    EXISTS (SELECT 1 FROM public.matches m WHERE (m.user_a = auth.uid() AND m.user_b = p.id) OR (m.user_b = auth.uid() AND m.user_a = p.id)) AS is_matched
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND coalesce(p.anonymous_name, '') <> ''
    AND array_length(p.skills, 1) > 0
    AND array_length(p.industry_interests, 1) > 0
  ORDER BY p.updated_at DESC
  LIMIT 200;
$$;

-- SEND INTEREST BY OPAQUE DISCOVERY ID
CREATE OR REPLACE FUNCTION public.send_interest(p_discovery_id text)
RETURNS TABLE(matched boolean) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_receiver uuid;
  v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT p.id INTO v_receiver FROM public.profiles p
   WHERE md5(p.id::text || 'foundora-discovery') = p_discovery_id;
  IF v_receiver IS NULL THEN RAISE EXCEPTION 'Founder not found'; END IF;
  IF v_receiver = v_me THEN RAISE EXCEPTION 'You cannot send interest to yourself'; END IF;

  INSERT INTO public.interests (sender_id, receiver_id)
  VALUES (v_me, v_receiver)
  ON CONFLICT (sender_id, receiver_id) DO NOTHING;

  RETURN QUERY SELECT EXISTS (
    SELECT 1 FROM public.matches m
    WHERE (m.user_a = v_me AND m.user_b = v_receiver) OR (m.user_b = v_me AND m.user_a = v_receiver)
  );
END;
$$;

-- MY MATCHES with the other founder's anonymous profile
CREATE OR REPLACE FUNCTION public.my_matches()
RETURNS TABLE(match_id uuid, created_at timestamptz, anonymous_name text, skills text[], industry_interests text[], commitment_level text, available_hours integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.id, m.created_at, p.anonymous_name, p.skills, p.industry_interests, p.commitment_level, p.available_hours
  FROM public.matches m
  JOIN public.profiles p ON p.id = CASE WHEN m.user_a = auth.uid() THEN m.user_b ELSE m.user_a END
  WHERE auth.uid() IS NOT NULL AND (m.user_a = auth.uid() OR m.user_b = auth.uid())
  ORDER BY m.created_at DESC;
$$;

-- INCOMING INTERESTS (anonymous)
CREATE OR REPLACE FUNCTION public.incoming_interests()
RETURNS TABLE(discovery_id text, anonymous_name text, skills text[], industry_interests text[], created_at timestamptz, interest_sent boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT md5(p.id::text || 'foundora-discovery'), p.anonymous_name, p.skills, p.industry_interests, i.created_at,
    EXISTS (SELECT 1 FROM public.interests o WHERE o.sender_id = auth.uid() AND o.receiver_id = i.sender_id)
  FROM public.interests i
  JOIN public.profiles p ON p.id = i.sender_id
  WHERE auth.uid() IS NOT NULL AND i.receiver_id = auth.uid()
  ORDER BY i.created_at DESC;
$$;

-- CHAT HEADER (messages themselves are guarded by RLS)
CREATE OR REPLACE FUNCTION public.match_header(p_match_id uuid)
RETURNS TABLE(match_id uuid, anonymous_name text, skills text[], commitment_level text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.id, p.anonymous_name, p.skills, p.commitment_level
  FROM public.matches m
  JOIN public.profiles p ON p.id = CASE WHEN m.user_a = auth.uid() THEN m.user_b ELSE m.user_a END
  WHERE m.id = p_match_id AND auth.uid() IS NOT NULL AND (m.user_a = auth.uid() OR m.user_b = auth.uid());
$$;