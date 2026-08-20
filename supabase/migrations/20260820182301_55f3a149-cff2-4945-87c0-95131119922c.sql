-- Collaboration decision -------------------------------------------------
CREATE TABLE public.founder_collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL UNIQUE REFERENCES public.matches(id) ON DELETE CASCADE,
  founder_a_id uuid NOT NULL,
  founder_b_id uuid NOT NULL,
  founder_a_status text NOT NULL DEFAULT 'pending',
  founder_b_status text NOT NULL DEFAULT 'pending',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.founder_collaborations TO authenticated;
GRANT ALL ON public.founder_collaborations TO service_role;
ALTER TABLE public.founder_collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match members read their collaboration"
  ON public.founder_collaborations FOR SELECT TO authenticated
  USING (public.is_match_member(match_id, auth.uid()));

CREATE TRIGGER update_founder_collaborations_updated_at
  BEFORE UPDATE ON public.founder_collaborations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Workspace ---------------------------------------------------------------
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id uuid NOT NULL UNIQUE REFERENCES public.founder_collaborations(id) ON DELETE CASCADE,
  project_name text NOT NULL DEFAULT '',
  problem text NOT NULL DEFAULT '',
  target_users text NOT NULL DEFAULT '',
  solution text NOT NULL DEFAULT '',
  stage text NOT NULL DEFAULT 'idea',
  goals jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE OR REPLACE FUNCTION public.is_collab_member(_collaboration_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.founder_collaborations c
    WHERE c.id = _collaboration_id
      AND _user_id IN (c.founder_a_id, c.founder_b_id)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspaces w
    JOIN public.founder_collaborations c ON c.id = w.collaboration_id
    WHERE w.id = _workspace_id
      AND _user_id IN (c.founder_a_id, c.founder_b_id)
  )
$$;

GRANT SELECT, UPDATE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members read their workspace"
  ON public.workspaces FOR SELECT TO authenticated
  USING (public.is_collab_member(collaboration_id, auth.uid()));

CREATE POLICY "Workspace members update their workspace"
  ON public.workspaces FOR UPDATE TO authenticated
  USING (public.is_collab_member(collaboration_id, auth.uid()))
  WITH CHECK (public.is_collab_member(collaboration_id, auth.uid()));

GRANT SELECT, UPDATE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members read roles"
  ON public.workspace_members FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Founders update their own role"
  ON public.workspace_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (user_id = auth.uid() AND public.is_workspace_member(workspace_id, auth.uid()));

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Decision RPCs -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.collaboration_state(p_match_id uuid)
RETURNS TABLE (
  collaboration_id uuid,
  status text,
  my_status text,
  partner_status text,
  workspace_id uuid
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me uuid := auth.uid();
BEGIN
  IF me IS NULL OR NOT public.is_match_member(p_match_id, me) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT c.id,
         c.status,
         CASE WHEN c.founder_a_id = me THEN c.founder_a_status ELSE c.founder_b_status END,
         CASE WHEN c.founder_a_id = me THEN c.founder_b_status ELSE c.founder_a_status END,
         w.id
  FROM public.founder_collaborations c
  LEFT JOIN public.workspaces w ON w.collaboration_id = c.id
  WHERE c.match_id = p_match_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_collaboration_decision(p_match_id uuid, p_accept boolean)
RETURNS TABLE (
  collaboration_id uuid,
  status text,
  my_status text,
  partner_status text,
  workspace_id uuid
) LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me uuid := auth.uid();
  m public.matches;
  c public.founder_collaborations;
  w_id uuid;
  new_status text := CASE WHEN p_accept THEN 'accepted' ELSE 'exploring' END;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO m FROM public.matches WHERE id = p_match_id;
  IF m.id IS NULL OR me NOT IN (m.user_a, m.user_b) THEN
    RAISE EXCEPTION 'You are not part of this match';
  END IF;

  INSERT INTO public.founder_collaborations (match_id, founder_a_id, founder_b_id)
  VALUES (p_match_id, m.user_a, m.user_b)
  ON CONFLICT (match_id) DO NOTHING;

  SELECT * INTO c FROM public.founder_collaborations WHERE match_id = p_match_id;

  IF c.founder_a_id = me THEN
    UPDATE public.founder_collaborations SET founder_a_status = new_status WHERE id = c.id;
  ELSE
    UPDATE public.founder_collaborations SET founder_b_status = new_status WHERE id = c.id;
  END IF;

  SELECT * INTO c FROM public.founder_collaborations WHERE id = c.id;

  IF c.founder_a_status = 'accepted' AND c.founder_b_status = 'accepted' THEN
    UPDATE public.founder_collaborations SET status = 'building_together' WHERE id = c.id;

    SELECT id INTO w_id FROM public.workspaces WHERE collaboration_id = c.id;
    IF w_id IS NULL THEN
      INSERT INTO public.workspaces (collaboration_id) VALUES (c.id) RETURNING id INTO w_id;
      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES (w_id, c.founder_a_id), (w_id, c.founder_b_id)
      ON CONFLICT DO NOTHING;
    END IF;
  ELSE
    UPDATE public.founder_collaborations SET status = 'pending' WHERE id = c.id;
  END IF;

  RETURN QUERY SELECT * FROM public.collaboration_state(p_match_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.my_workspaces()
RETURNS TABLE (
  workspace_id uuid,
  collaboration_id uuid,
  match_id uuid,
  partner_name text,
  partner_avatar text,
  project_name text,
  stage text,
  updated_at timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT w.id,
         c.id,
         c.match_id,
         p.anonymous_name,
         p.avatar_url,
         w.project_name,
         w.stage,
         w.updated_at
  FROM public.workspaces w
  JOIN public.founder_collaborations c ON c.id = w.collaboration_id
  JOIN public.profiles p
    ON p.id = CASE WHEN c.founder_a_id = auth.uid() THEN c.founder_b_id ELSE c.founder_a_id END
  WHERE auth.uid() IN (c.founder_a_id, c.founder_b_id)
  ORDER BY w.updated_at DESC
$$;

CREATE OR REPLACE FUNCTION public.workspace_roles(p_workspace_id uuid)
RETURNS TABLE (user_is_me boolean, anonymous_name text, avatar_url text, role text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (m.user_id = auth.uid()), p.anonymous_name, p.avatar_url, m.role
  FROM public.workspace_members m
  JOIN public.profiles p ON p.id = m.user_id
  WHERE m.workspace_id = p_workspace_id
    AND public.is_workspace_member(p_workspace_id, auth.uid())
  ORDER BY (m.user_id = auth.uid()) DESC
$$;

CREATE OR REPLACE FUNCTION public.set_my_workspace_role(p_workspace_id uuid, p_role text)
RETURNS text LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_workspace_member(p_workspace_id, auth.uid()) THEN
    RAISE EXCEPTION 'You are not part of this workspace';
  END IF;
  UPDATE public.workspace_members
    SET role = COALESCE(p_role, '')
    WHERE workspace_id = p_workspace_id AND user_id = auth.uid();
  RETURN p_role;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_collab_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.collaboration_state(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_collaboration_decision(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_workspaces() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.workspace_roles(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_my_workspace_role(uuid, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.collaboration_state(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_collaboration_decision(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_workspaces() TO authenticated;
GRANT EXECUTE ON FUNCTION public.workspace_roles(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_my_workspace_role(uuid, text) TO authenticated;