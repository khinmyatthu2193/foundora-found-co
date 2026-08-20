CREATE TABLE public.shared_project_directions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL UNIQUE REFERENCES public.matches(id) ON DELETE CASCADE,
  project_title text NOT NULL DEFAULT '',
  problem text NOT NULL DEFAULT '',
  target_users text NOT NULL DEFAULT '',
  solution text NOT NULL DEFAULT '',
  why_now text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.shared_project_directions TO authenticated;
GRANT ALL ON public.shared_project_directions TO service_role;
ALTER TABLE public.shared_project_directions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match members read their project direction"
  ON public.shared_project_directions FOR SELECT TO authenticated
  USING (public.is_match_member(match_id, auth.uid()));
CREATE POLICY "Match members create their project direction"
  ON public.shared_project_directions FOR INSERT TO authenticated
  WITH CHECK (public.is_match_member(match_id, auth.uid()));
CREATE POLICY "Match members update their project direction"
  ON public.shared_project_directions FOR UPDATE TO authenticated
  USING (public.is_match_member(match_id, auth.uid()))
  WITH CHECK (public.is_match_member(match_id, auth.uid()));

CREATE TRIGGER update_shared_project_directions_updated_at
  BEFORE UPDATE ON public.shared_project_directions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.startup_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL UNIQUE REFERENCES public.matches(id) ON DELETE CASCADE,
  proposal_json jsonb NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.startup_proposals TO authenticated;
GRANT ALL ON public.startup_proposals TO service_role;
ALTER TABLE public.startup_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match members read their proposal"
  ON public.startup_proposals FOR SELECT TO authenticated
  USING (public.is_match_member(match_id, auth.uid()));
CREATE POLICY "Match members create their proposal"
  ON public.startup_proposals FOR INSERT TO authenticated
  WITH CHECK (public.is_match_member(match_id, auth.uid()) AND created_by = auth.uid());
CREATE POLICY "Match members refresh their proposal"
  ON public.startup_proposals FOR UPDATE TO authenticated
  USING (public.is_match_member(match_id, auth.uid()))
  WITH CHECK (public.is_match_member(match_id, auth.uid()));

CREATE TRIGGER update_startup_proposals_updated_at
  BEFORE UPDATE ON public.startup_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();