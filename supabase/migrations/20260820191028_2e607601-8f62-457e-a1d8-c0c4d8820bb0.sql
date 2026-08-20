CREATE OR REPLACE FUNCTION public.set_collaboration_decision(
  p_match_id uuid,
  p_accept boolean
)
RETURNS TABLE(
  collaboration_id uuid,
  status text,
  my_status text,
  partner_status text,
  workspace_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_match public.matches%ROWTYPE;
  v_collaboration public.founder_collaborations%ROWTYPE;
  v_collaboration_id uuid;
  v_workspace_id uuid;
  v_decision_status text := CASE WHEN p_accept THEN 'accepted' ELSE 'exploring' END;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT mt.*
    INTO v_match
    FROM public.matches AS mt
   WHERE mt.id = p_match_id;

  IF v_match.id IS NULL
     OR (v_user_id <> v_match.user_a AND v_user_id <> v_match.user_b) THEN
    RAISE EXCEPTION 'You are not part of this match';
  END IF;

  INSERT INTO public.founder_collaborations AS fc (
    match_id,
    founder_a_id,
    founder_b_id
  )
  VALUES (
    p_match_id,
    v_match.user_a,
    v_match.user_b
  )
  ON CONFLICT DO NOTHING;

  SELECT fc.*
    INTO v_collaboration
    FROM public.founder_collaborations AS fc
   WHERE fc.match_id = p_match_id;

  IF v_collaboration.id IS NULL THEN
    RAISE EXCEPTION 'Could not create or load collaboration';
  END IF;

  v_collaboration_id := v_collaboration.id;

  IF v_collaboration.founder_a_id = v_user_id THEN
    UPDATE public.founder_collaborations AS fc
       SET founder_a_status = v_decision_status
     WHERE fc.id = v_collaboration_id;
  ELSIF v_collaboration.founder_b_id = v_user_id THEN
    UPDATE public.founder_collaborations AS fc
       SET founder_b_status = v_decision_status
     WHERE fc.id = v_collaboration_id;
  ELSE
    RAISE EXCEPTION 'You are not part of this collaboration';
  END IF;

  SELECT fc.*
    INTO v_collaboration
    FROM public.founder_collaborations AS fc
   WHERE fc.id = v_collaboration_id;

  IF v_collaboration.founder_a_status = 'accepted'
     AND v_collaboration.founder_b_status = 'accepted' THEN
    UPDATE public.founder_collaborations AS fc
       SET status = 'building_together'
     WHERE fc.id = v_collaboration_id;

    SELECT ws.id
      INTO v_workspace_id
      FROM public.workspaces AS ws
     WHERE ws.collaboration_id = v_collaboration_id;

    IF v_workspace_id IS NULL THEN
      INSERT INTO public.workspaces AS ws (collaboration_id)
      VALUES (v_collaboration_id)
      RETURNING ws.id INTO v_workspace_id;
    END IF;

    INSERT INTO public.workspace_members AS wm (workspace_id, user_id)
    VALUES
      (v_workspace_id, v_collaboration.founder_a_id),
      (v_workspace_id, v_collaboration.founder_b_id)
    ON CONFLICT DO NOTHING;
  ELSE
    UPDATE public.founder_collaborations AS fc
       SET status = 'pending'
     WHERE fc.id = v_collaboration_id;
  END IF;

  RETURN QUERY
  SELECT cs.collaboration_id,
         cs.status,
         cs.my_status,
         cs.partner_status,
         cs.workspace_id
    FROM public.collaboration_state(p_match_id) AS cs;
END;
$function$;

REVOKE ALL ON FUNCTION public.set_collaboration_decision(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_collaboration_decision(uuid, boolean) TO authenticated, service_role;