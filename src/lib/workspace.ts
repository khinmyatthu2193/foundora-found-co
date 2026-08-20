import { supabase } from "@/integrations/supabase/client";

/**
 * Collaboration decision ("start building together") and the shared founder
 * workspace it creates. Every read and write is scoped by RLS / SECURITY
 * DEFINER RPCs to the two founders of the match — no PII is ever exposed.
 */

export type CollaborationState = {
  collaboration_id: string;
  status: string;
  my_status: string;
  partner_status: string;
  workspace_id: string | null;
};

export type WorkspaceRow = {
  id: string;
  collaboration_id: string;
  project_name: string;
  problem: string;
  target_users: string;
  solution: string;
  stage: string;
  goals: Record<string, boolean>;
  updated_at: string;
};

export type WorkspaceSummary = {
  workspace_id: string;
  collaboration_id: string;
  match_id: string;
  partner_name: string;
  partner_avatar: string | null;
  project_name: string;
  stage: string;
  updated_at: string;
};

export type WorkspaceRole = {
  user_is_me: boolean;
  anonymous_name: string;
  avatar_url: string | null;
  role: string;
};

export const FOUNDER_ROLES = [
  "Technical",
  "Product",
  "Design",
  "Marketing",
  "Business",
  "Operations",
] as const;

export const STAGES = ["idea", "validating", "building", "launched"] as const;

export const GOALS: { key: string; label: string }[] = [
  { key: "validate", label: "Validate idea" },
  { key: "research", label: "Research users" },
  { key: "mvp", label: "Build MVP" },
  { key: "launch", label: "Launch" },
];

const WORKSPACE_COLUMNS =
  "id, collaboration_id, project_name, problem, target_users, solution, stage, goals, updated_at";

export function collaborationQueryKey(userId: string, matchId: string) {
  return ["collaboration", userId, matchId] as const;
}

export function workspaceListQueryKey(userId: string) {
  return ["workspaces", userId] as const;
}

export function workspaceQueryKey(userId: string, workspaceId: string) {
  return ["workspace", userId, workspaceId] as const;
}

export function workspaceRolesQueryKey(userId: string, workspaceId: string) {
  return ["workspace-roles", userId, workspaceId] as const;
}

export async function fetchCollaboration(matchId: string): Promise<CollaborationState | null> {
  const { data, error } = await supabase.rpc("collaboration_state", { p_match_id: matchId });
  if (error) throw new Error("Could not load your collaboration status.");
  return ((data as CollaborationState[] | null) ?? [])[0] ?? null;
}

export async function setCollaborationDecision(
  matchId: string,
  accept: boolean,
): Promise<CollaborationState | null> {
  const { data, error } = await supabase.rpc("set_collaboration_decision", {
    p_match_id: matchId,
    p_accept: accept,
  });
  if (error) throw new Error("Could not save your decision. Please try again.");
  return ((data as CollaborationState[] | null) ?? [])[0] ?? null;
}

export async function fetchMyWorkspaces(): Promise<WorkspaceSummary[]> {
  const { data, error } = await supabase.rpc("my_workspaces");
  if (error) throw new Error("Could not load your workspaces.");
  return (data ?? []) as WorkspaceSummary[];
}

export async function fetchWorkspace(workspaceId: string): Promise<WorkspaceRow | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select(WORKSPACE_COLUMNS)
    .eq("id", workspaceId)
    .maybeSingle();
  if (error) throw new Error("Could not load this workspace.");
  if (!data) return null;
  return {
    ...(data as Omit<WorkspaceRow, "goals"> & { goals: unknown }),
    goals: (data.goals ?? {}) as Record<string, boolean>,
  };
}

export async function saveWorkspace(
  workspaceId: string,
  patch: Partial<Pick<WorkspaceRow, "project_name" | "problem" | "target_users" | "solution" | "stage" | "goals">>,
): Promise<WorkspaceRow> {
  const { data, error } = await supabase
    .from("workspaces")
    .update(patch)
    .eq("id", workspaceId)
    .select(WORKSPACE_COLUMNS)
    .single();
  if (error) throw new Error("Could not save the workspace. Please try again.");
  return {
    ...(data as Omit<WorkspaceRow, "goals"> & { goals: unknown }),
    goals: (data.goals ?? {}) as Record<string, boolean>,
  };
}

export async function fetchWorkspaceRoles(workspaceId: string): Promise<WorkspaceRole[]> {
  const { data, error } = await supabase.rpc("workspace_roles", { p_workspace_id: workspaceId });
  if (error) throw new Error("Could not load founder roles.");
  return (data ?? []) as WorkspaceRole[];
}

export async function setMyWorkspaceRole(workspaceId: string, role: string): Promise<void> {
  const { error } = await supabase.rpc("set_my_workspace_role", {
    p_workspace_id: workspaceId,
    p_role: role,
  });
  if (error) throw new Error("Could not save your role. Please try again.");
}

/** A workspace is ready for an AI proposal once the core fields are filled in. */
export function workspaceIsReady(w: WorkspaceRow | null | undefined): boolean {
  if (!w) return false;
  return Boolean(
    w.project_name.trim() && w.problem.trim() && w.target_users.trim() && w.solution.trim(),
  );
}
