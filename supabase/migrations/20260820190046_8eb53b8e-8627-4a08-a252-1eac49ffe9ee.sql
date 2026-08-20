CREATE OR REPLACE FUNCTION public.set_collaboration_decision(p_match_id uuid, p_accept boolean)
 RETURNS TABLE(collaboration_id uuid, status text, my_status text, partner_status text, workspace_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  me uuid := auth.uid();
  m public.matches;
  c public.founder_collaborations;
  v_collab_id uuid;
  v_workspace_id uuid;
  new_status text := CASE WHEN p_accept THEN 'accepted' ELSE 'exploring' END;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO m FROM public.matches mm WHERE mm.id = p_match_id;
  IF m.id IS NULL OR me NOT IN (m.user_a, m.user_b) THEN
    RAISE EXCEPTION 'You are not part of this match';
  END IF;

  INSERT INTO public.founder_collaborations (match_id, founder_a_id, founder_b_id)
  VALUES (p_match_id, m.user_a, m.user_b)
  ON CONFLICT (match_id) DO NOTHING;

  SELECT * INTO c FROM public.founder_collaborations fc WHERE fc.match_id = p_match_id;
  v_collab_id := c.id;

  IF c.founder_a_id = me THEN
    UPDATE public.founder_collaborations fc
       SET founder_a_status = new_status
     WHERE fc.id = v_collab_id;
  ELSE
    UPDATE public.founder_collaborations fc
       SET founder_b_status = new_status
     WHERE fc.id = v_collab_id;
  END IF;

  SELECT * INTO c FROM public.founder_collaborations fc WHERE fc.id = v_collab_id;

  IF c.founder_a_status = 'accepted' AND c.founder_b_status = 'accepted' THEN
    UPDATE public.founder_collaborations fc
       SET status = 'building_together'
     WHERE fc.id = v_collab_id;

    SELECT w.id INTO v_workspace_id
      FROM public.workspaces w
     WHERE w.collaboration_id = v_collab_id;

    IF v_workspace_id IS NULL THEN
      INSERT INTO public.workspaces (collaboration_id)
      VALUES (v_collab_id)
      RETURNING id INTO v_workspace_id;
    END IF;

    INSERT INTO public.workspace_members (workspace_id, user_id)
    VALUES (v_workspace_id, c.founder_a_id), (v_workspace_id, c.founder_b_id)
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  ELSE
    UPDATE public.founder_collaborations fc
       SET status = 'pending'
     WHERE fc.id = v_collab_id;
  END IF;

  RETURN QUERY SELECT * FROM public.collaboration_state(p_match_id);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.set_collaboration_decision(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_collaboration_decision(uuid, boolean) TO authenticated;