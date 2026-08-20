import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Hammer, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProposalCard } from "@/components/foundora/proposal-card";
import { EmptyState, FounderAvatar, Section, Tag } from "@/components/foundora/ui-bits";
import { fetchMyPlan, planQueryKey } from "@/lib/premium";
import {
  FOUNDER_ROLES,
  GOALS,
  STAGES,
  fetchMyWorkspaces,
  fetchWorkspace,
  fetchWorkspaceRoles,
  saveWorkspace,
  setMyWorkspaceRole,
  workspaceIsReady,
  workspaceListQueryKey,
  workspaceQueryKey,
  workspaceRolesQueryKey,
  type WorkspaceRow,
  type WorkspaceSummary,
} from "@/lib/workspace";

export const Route = createFileRoute("/app/workspace")({
  head: () => ({
    meta: [
      { title: "Startup workspace — Foundora" },
      {
        name: "description",
        content:
          "A shared workspace for founders building together: project overview, roles, goals and the AI startup proposal.",
      },
      { property: "og:title", content: "Startup workspace — Foundora" },
      {
        property: "og:description",
        content: "Turn a mutual match into your first 30 days of work.",
      },
    ],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const { user } = Route.useRouteContext();

  const list = useQuery({
    queryKey: workspaceListQueryKey(user.id),
    queryFn: fetchMyWorkspaces,
  });

  if (list.isLoading) {
    return (
      <Section className="pt-8">
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </Section>
    );
  }

  const active = list.data?.[0];

  if (!active) {
    return (
      <Section className="pt-8">
        <EmptyState
          icon={<Hammer className="size-8" />}
          title="No workspace yet"
          description="Complete your match conversation first, then both founders confirm “Start building together” to open a shared workspace."
          action={
            <Button asChild>
              <Link to="/app/matches">Go to matches</Link>
            </Button>
          }
        />
      </Section>
    );
  }

  return <WorkspaceDetail userId={user.id} summary={active} />;
}

function WorkspaceDetail({ userId, summary }: { userId: string; summary: WorkspaceSummary }) {
  const queryClient = useQueryClient();
  const workspaceId = summary.workspace_id;

  const plan = useQuery({
    queryKey: planQueryKey(userId),
    queryFn: () => fetchMyPlan(userId),
  });

  const workspace = useQuery({
    queryKey: workspaceQueryKey(userId, workspaceId),
    queryFn: () => fetchWorkspace(workspaceId),
  });

  const roles = useQuery({
    queryKey: workspaceRolesQueryKey(userId, workspaceId),
    queryFn: () => fetchWorkspaceRoles(workspaceId),
  });

  const [draft, setDraft] = useState<Partial<WorkspaceRow>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (dirty || !workspace.data) return;
    const w = workspace.data;
    setDraft({
      project_name: w.project_name,
      problem: w.problem,
      target_users: w.target_users,
      solution: w.solution,
      stage: w.stage,
    });
  }, [workspace.data, dirty]);

  const save = useMutation({
    mutationFn: () =>
      saveWorkspace(workspaceId, {
        project_name: draft.project_name ?? "",
        problem: draft.problem ?? "",
        target_users: draft.target_users ?? "",
        solution: draft.solution ?? "",
        stage: draft.stage ?? "idea",
      }),
    onSuccess: (row) => {
      setDirty(false);
      queryClient.setQueryData(workspaceQueryKey(userId, workspaceId), row);
      void queryClient.invalidateQueries({ queryKey: workspaceListQueryKey(userId) });
      toast.success("Workspace saved for both founders");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  const toggleGoal = useMutation({
    mutationFn: (key: string) => {
      const goals = { ...(workspace.data?.goals ?? {}) };
      goals[key] = !goals[key];
      return saveWorkspace(workspaceId, { goals });
    },
    onSuccess: (row) => queryClient.setQueryData(workspaceQueryKey(userId, workspaceId), row),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the goal."),
  });

  const chooseRole = useMutation({
    mutationFn: (role: string) => setMyWorkspaceRole(workspaceId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceRolesQueryKey(userId, workspaceId),
      });
      toast.success("Role updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save your role."),
  });

  const set = (key: keyof WorkspaceRow, value: string) => {
    setDirty(true);
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const myRole = roles.data?.find((r) => r.user_is_me)?.role ?? "";
  const ready = workspaceIsReady(workspace.data);
  const empty = workspace.data && !workspace.data.project_name.trim() && !workspace.data.problem.trim();

  return (
    <Section
      className="pt-8"
      title="Shared workspace"
      description={`Building together with ${summary.partner_name}.`}
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/app/chat/$matchId" params={{ matchId: summary.match_id }}>
            Open conversation
          </Link>
        </Button>
      }
    >
      {empty && (
        <p className="mb-4 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Start defining your startup direction.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border shadow-soft lg:col-span-2">
          <CardContent className="p-6">
            <Head>Project overview</Head>
            <form
              className="mt-3 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!save.isPending) save.mutate();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="ws-name">Startup / project name</Label>
                <Input
                  id="ws-name"
                  value={draft.project_name ?? ""}
                  onChange={(e) => set("project_name", e.target.value)}
                  placeholder="Working name for what you're building"
                />
              </div>
              <Field
                id="ws-problem"
                label="Problem statement"
                value={draft.problem ?? ""}
                onChange={(v) => set("problem", v)}
                placeholder="What pain are you attacking?"
              />
              <Field
                id="ws-users"
                label="Target users"
                value={draft.target_users ?? ""}
                onChange={(v) => set("target_users", v)}
                placeholder="Who feels this problem most?"
              />
              <Field
                id="ws-solution"
                label="Solution idea"
                value={draft.solution ?? ""}
                onChange={(v) => set("solution", v)}
                placeholder="What will you build first?"
              />
              <div className="space-y-1.5">
                <Label>Current stage</Label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((s) => (
                    <Button
                      key={s}
                      type="button"
                      size="sm"
                      variant={(draft.stage ?? "idea") === s ? "default" : "outline"}
                      onClick={() => set("stage", s)}
                      className="capitalize"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save workspace
                </Button>
                {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <Head>Founder roles</Head>
              <div className="mt-3 space-y-3">
                {roles.data?.map((r) => (
                  <div
                    key={r.anonymous_name + String(r.user_is_me)}
                    className="flex items-center gap-3 rounded-xl border border-border p-3"
                  >
                    <FounderAvatar path={r.avatar_url} name={r.anonymous_name} />
                    <div>
                      <p className="text-sm font-medium">
                        {r.user_is_me ? "You" : r.anonymous_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {r.role ? `${r.role} Founder` : "No role chosen yet"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5">
                <Label>Your role</Label>
                <div className="flex flex-wrap gap-2">
                  {FOUNDER_ROLES.map((r) => (
                    <Button
                      key={r}
                      type="button"
                      size="sm"
                      variant={myRole === r ? "default" : "outline"}
                      disabled={chooseRole.isPending}
                      onClick={() => chooseRole.mutate(r)}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <Head>Goals</Head>
              <div className="mt-3 space-y-3">
                {GOALS.map((g) => {
                  const done = Boolean(workspace.data?.goals?.[g.key]);
                  return (
                    <label key={g.key} className="flex items-start gap-3 text-sm">
                      <Checkbox
                        checked={done}
                        disabled={toggleGoal.isPending}
                        onCheckedChange={() => toggleGoal.mutate(g.key)}
                      />
                      <span className={done ? "text-muted-foreground line-through" : ""}>
                        {g.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag tone="primary">Stage: {workspace.data?.stage ?? "idea"}</Tag>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProposalCard
        className="mt-4"
        userId={userId}
        matchId={summary.match_id}
        premium={plan.data === "premium"}
        readyOverride={ready}
        notReadyText="Fill in project name, problem, target users and solution first."
      />
    </Section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{children}</p>
  );
}
