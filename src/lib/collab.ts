import { supabase } from "@/integrations/supabase/client";

/**
 * Shared collaboration data for a mutual match: the project direction both
 * founders edit together, and the AI startup proposal generated from it.
 * RLS keeps every read and write scoped to the two matched founders.
 */

export type ProjectDirection = {
  id: string;
  match_id: string;
  project_title: string;
  problem: string;
  target_users: string;
  solution: string;
  why_now: string;
  notes: string;
  updated_at: string;
};

export type DirectionDraft = Pick<
  ProjectDirection,
  "project_title" | "problem" | "target_users" | "solution" | "why_now" | "notes"
>;

export const EMPTY_DIRECTION: DirectionDraft = {
  project_title: "",
  problem: "",
  target_users: "",
  solution: "",
  why_now: "",
  notes: "",
};

export type StartupProposal = {
  concept_summary: string;
  problem: string;
  target_users: string;
  solution: string;
  founder_roles: string[];
  mvp_scope: string[];
  plan_30_days: string[];
  key_risks: string[];
};

export type ProposalRow = {
  id: string;
  match_id: string;
  proposal_json: StartupProposal;
  created_at: string;
  updated_at: string;
};

const DIRECTION_COLUMNS =
  "id, match_id, project_title, problem, target_users, solution, why_now, notes, updated_at";

export function directionQueryKey(userId: string, matchId: string) {
  return ["project-direction", userId, matchId] as const;
}

export function proposalQueryKey(userId: string, matchId: string) {
  return ["startup-proposal", userId, matchId] as const;
}

export async function fetchProjectDirection(
  matchId: string,
): Promise<ProjectDirection | null> {
  const { data, error } = await supabase
    .from("shared_project_directions")
    .select(DIRECTION_COLUMNS)
    .eq("match_id", matchId)
    .maybeSingle();
  if (error) throw new Error("Could not load the shared project direction.");
  return (data as ProjectDirection | null) ?? null;
}

export async function saveProjectDirection(
  matchId: string,
  draft: DirectionDraft,
): Promise<ProjectDirection> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Your session expired. Please log in again.");

  const { data, error } = await supabase
    .from("shared_project_directions")
    .upsert(
      { match_id: matchId, updated_by: auth.user.id, ...draft },
      { onConflict: "match_id" },
    )
    .select(DIRECTION_COLUMNS)
    .single();
  if (error) throw new Error("Could not save the project direction. Please try again.");
  return data as ProjectDirection;
}

export async function fetchStartupProposal(matchId: string): Promise<ProposalRow | null> {
  const { data, error } = await supabase
    .from("startup_proposals")
    .select("id, match_id, proposal_json, created_at, updated_at")
    .eq("match_id", matchId)
    .maybeSingle();
  if (error) throw new Error("Could not load the startup proposal.");
  return (data as ProposalRow | null) ?? null;
}

/** A direction is "ready" once the core fields are filled in. */
export function directionIsReady(d: DirectionDraft | null | undefined): boolean {
  if (!d) return false;
  return Boolean(
    d.project_title.trim() && d.problem.trim() && d.target_users.trim() && d.solution.trim(),
  );
}
