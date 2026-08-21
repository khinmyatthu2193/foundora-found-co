ALTER TABLE public.startup_proposals ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

UPDATE public.startup_proposals sp
SET workspace_id = w.id
FROM public.workspaces w
JOIN public.founder_collaborations c ON c.id = w.collaboration_id
WHERE c.match_id = sp.match_id AND sp.workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS startup_proposals_workspace_id_idx ON public.startup_proposals(workspace_id);

CREATE POLICY "Workspace members read the proposal"
ON public.startup_proposals FOR SELECT TO authenticated
USING (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id, auth.uid()));