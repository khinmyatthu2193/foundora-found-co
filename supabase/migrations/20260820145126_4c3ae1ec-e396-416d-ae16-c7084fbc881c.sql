-- 1. Profile columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS website_url text;

-- 2. Friendly unique anonymous names
CREATE OR REPLACE FUNCTION public.generate_anonymous_name()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bases text[] := ARRAY['Nova','Luna','Aria','Kai','Mira','Atlas','Eden','Orion','Sage','Iris','Juno','Rune','Vega','Zephyr','Lyra','Onyx','Pixel','Ember','Aspen','Cove','Wren','Flint','Halo','Indigo','Koda','Marlo','Nomad','Quill','Rio','Sol'];
  suffixes text[] := ARRAY['','Fox','Lark','Wave','Pine','Stone','Bloom','Drift','Peak','Reef','Spark'];
  prefixes text[] := ARRAY['','Bright','Swift','Calm','Bold','Quiet','Clever'];
  candidate text;
  i int := 0;
BEGIN
  LOOP
    i := i + 1;
    candidate :=
      prefixes[1 + floor(random() * array_length(prefixes, 1))::int] ||
      bases[1 + floor(random() * array_length(bases, 1))::int] ||
      suffixes[1 + floor(random() * array_length(suffixes, 1))::int];

    IF i > 40 THEN
      candidate := candidate || (100 + floor(random() * 899))::text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE lower(p.anonymous_name) = lower(candidate)
    ) THEN
      RETURN candidate;
    END IF;

    IF i > 80 THEN
      RETURN 'Founder' || substr(md5(random()::text), 1, 6);
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_anonymous_name() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_anonymous_name() TO authenticated;

-- 3. Backfill placeholder / empty names, then enforce uniqueness
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT id FROM public.profiles
    WHERE coalesce(anonymous_name, '') = '' OR anonymous_name ILIKE 'Founder #%'
  LOOP
    UPDATE public.profiles SET anonymous_name = public.generate_anonymous_name() WHERE id = r.id;
  END LOOP;

  -- de-duplicate any remaining collisions
  FOR r IN
    SELECT id FROM (
      SELECT id, row_number() OVER (PARTITION BY lower(anonymous_name) ORDER BY created_at) rn
      FROM public.profiles
    ) s WHERE rn > 1
  LOOP
    UPDATE public.profiles SET anonymous_name = public.generate_anonymous_name() WHERE id = r.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_anonymous_name_unique
  ON public.profiles (lower(anonymous_name));

-- 4. Email verification lookup for the current user
CREATE OR REPLACE FUNCTION public.my_email_verified()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL
  );
$$;

REVOKE ALL ON FUNCTION public.my_email_verified() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_email_verified() TO authenticated;

-- 5. Name regeneration for the signed-in user
CREATE OR REPLACE FUNCTION public.regenerate_my_anonymous_name()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_name text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  v_name := public.generate_anonymous_name();
  UPDATE public.profiles SET anonymous_name = v_name WHERE id = auth.uid();
  RETURN v_name;
END;
$$;

REVOKE ALL ON FUNCTION public.regenerate_my_anonymous_name() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.regenerate_my_anonymous_name() TO authenticated;

-- 6. Suggest a name before a profile exists
CREATE OR REPLACE FUNCTION public.suggest_anonymous_name()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  RETURN public.generate_anonymous_name();
END;
$$;

REVOKE ALL ON FUNCTION public.suggest_anonymous_name() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.suggest_anonymous_name() TO authenticated;

-- 7. Discovery with avatar + trust badges (no email / real name / idea / uuid)
DROP FUNCTION IF EXISTS public.discover_founders();
CREATE FUNCTION public.discover_founders()
RETURNS TABLE(
  discovery_id text, anonymous_name text, avatar_url text, skills text[],
  industry_interests text[], available_hours integer, experience_level text,
  looking_for text, working_style text, commitment_level text,
  desired_partner_traits text[], has_linkedin boolean, has_github boolean,
  has_portfolio boolean, email_verified boolean, interest_sent boolean, is_matched boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    md5(p.id::text || 'foundora-discovery'),
    p.anonymous_name, p.avatar_url, p.skills, p.industry_interests, p.available_hours,
    p.experience_level, p.looking_for, p.working_style, p.commitment_level,
    p.desired_partner_traits,
    coalesce(p.linkedin_url, '') <> '',
    coalesce(p.github_url, '') <> '',
    coalesce(p.portfolio_url, '') <> '' OR coalesce(p.website_url, '') <> '',
    EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id AND u.email_confirmed_at IS NOT NULL),
    EXISTS (SELECT 1 FROM public.interests i WHERE i.sender_id = auth.uid() AND i.receiver_id = p.id),
    EXISTS (SELECT 1 FROM public.matches m WHERE (m.user_a = auth.uid() AND m.user_b = p.id) OR (m.user_b = auth.uid() AND m.user_a = p.id))
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND coalesce(p.anonymous_name, '') <> ''
    AND array_length(p.skills, 1) > 0
    AND array_length(p.industry_interests, 1) > 0
    AND NOT EXISTS (
      SELECT 1 FROM public.interests d
      WHERE d.sender_id = auth.uid() AND d.receiver_id = p.id AND d.status = 'rejected'
    )
  ORDER BY p.updated_at DESC
  LIMIT 200;
$$;

REVOKE ALL ON FUNCTION public.discover_founders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.discover_founders() TO authenticated;

-- 8. Incoming interests with avatar + badges, pending only handled client-side
DROP FUNCTION IF EXISTS public.incoming_interests();
CREATE FUNCTION public.incoming_interests()
RETURNS TABLE(
  discovery_id text, anonymous_name text, avatar_url text, skills text[],
  industry_interests text[], experience_level text, available_hours integer,
  has_linkedin boolean, has_github boolean, has_portfolio boolean, email_verified boolean,
  status text, created_at timestamptz, interest_sent boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    md5(p.id::text || 'foundora-discovery'), p.anonymous_name, p.avatar_url, p.skills,
    p.industry_interests, p.experience_level, p.available_hours,
    coalesce(p.linkedin_url, '') <> '',
    coalesce(p.github_url, '') <> '',
    coalesce(p.portfolio_url, '') <> '' OR coalesce(p.website_url, '') <> '',
    EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id AND u.email_confirmed_at IS NOT NULL),
    i.status, i.created_at,
    EXISTS (SELECT 1 FROM public.interests o WHERE o.sender_id = auth.uid() AND o.receiver_id = i.sender_id)
  FROM public.interests i
  JOIN public.profiles p ON p.id = i.sender_id
  WHERE auth.uid() IS NOT NULL AND i.receiver_id = auth.uid() AND i.status <> 'rejected'
  ORDER BY i.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.incoming_interests() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.incoming_interests() TO authenticated;

-- 9. Accept / decline an interest received
CREATE OR REPLACE FUNCTION public.respond_to_interest(p_discovery_id text, p_accept boolean)
RETURNS TABLE(matched boolean)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_sender uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT p.id INTO v_sender FROM public.profiles p
   WHERE md5(p.id::text || 'foundora-discovery') = p_discovery_id;
  IF v_sender IS NULL THEN RAISE EXCEPTION 'Founder not found'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.interests i WHERE i.sender_id = v_sender AND i.receiver_id = v_me
  ) THEN
    RAISE EXCEPTION 'No interest to respond to';
  END IF;

  IF p_accept THEN
    INSERT INTO public.interests (sender_id, receiver_id)
    VALUES (v_me, v_sender)
    ON CONFLICT (sender_id, receiver_id) DO NOTHING;
  ELSE
    UPDATE public.interests SET status = 'rejected', updated_at = now()
     WHERE sender_id = v_sender AND receiver_id = v_me;
  END IF;

  RETURN QUERY SELECT EXISTS (
    SELECT 1 FROM public.matches m
    WHERE (m.user_a = v_me AND m.user_b = v_sender) OR (m.user_b = v_me AND m.user_a = v_sender)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.respond_to_interest(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.respond_to_interest(text, boolean) TO authenticated;

-- 10. Matches + chat header with avatar
DROP FUNCTION IF EXISTS public.my_matches();
CREATE FUNCTION public.my_matches()
RETURNS TABLE(
  match_id uuid, created_at timestamptz, anonymous_name text, avatar_url text,
  skills text[], industry_interests text[], commitment_level text, available_hours integer,
  has_linkedin boolean, has_github boolean, has_portfolio boolean, email_verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.id, m.created_at, p.anonymous_name, p.avatar_url, p.skills, p.industry_interests,
         p.commitment_level, p.available_hours,
         coalesce(p.linkedin_url, '') <> '',
         coalesce(p.github_url, '') <> '',
         coalesce(p.portfolio_url, '') <> '' OR coalesce(p.website_url, '') <> '',
         EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id AND u.email_confirmed_at IS NOT NULL)
  FROM public.matches m
  JOIN public.profiles p ON p.id = CASE WHEN m.user_a = auth.uid() THEN m.user_b ELSE m.user_a END
  WHERE auth.uid() IS NOT NULL AND (m.user_a = auth.uid() OR m.user_b = auth.uid())
  ORDER BY m.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.my_matches() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_matches() TO authenticated;

DROP FUNCTION IF EXISTS public.match_header(uuid);
CREATE FUNCTION public.match_header(p_match_id uuid)
RETURNS TABLE(match_id uuid, anonymous_name text, avatar_url text, skills text[], commitment_level text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.id, p.anonymous_name, p.avatar_url, p.skills, p.commitment_level
  FROM public.matches m
  JOIN public.profiles p ON p.id = CASE WHEN m.user_a = auth.uid() THEN m.user_b ELSE m.user_a END
  WHERE m.id = p_match_id AND auth.uid() IS NOT NULL AND (m.user_a = auth.uid() OR m.user_b = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.match_header(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_header(uuid) TO authenticated;

-- 11. Avatar storage policies (bucket created separately)
CREATE POLICY "Avatar images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update their own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete their own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);