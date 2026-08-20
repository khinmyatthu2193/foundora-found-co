import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Hammer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { EmptyState, Section, Tag } from "@/components/foundora/ui-bits";
import { fetchMyMatches } from "@/lib/matching";

export const Route = createFileRoute("/app/workspace")({
  head: () => ({
    meta: [
      { title: "Startup workspace — Foundora" },
      {
        name: "description",
        content:
          "A simple shared workspace for your Foundora match: roles, MVP goal, 30-day plan and tasks.",
      },
      { property: "og:title", content: "Startup workspace — Foundora" },
      {
        property: "og:description",
        content: "Turn a mutual match into your first 30 days of work.",
      },
    ],
  }),
  component: Workspace,
});

const DEFAULT_TASKS = [
  { id: "1", text: "Interview 5 potential users", done: false },
  { id: "2", text: "Draft clickable prototype", done: false },
  { id: "3", text: "Agree on weekly working rhythm", done: false },
  { id: "4", text: "Ship first MVP workflow", done: false },
];

function Workspace() {
  const { user } = Route.useRouteContext();
  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches", user.id],
    queryFn: fetchMyMatches,
  });

  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [newTask, setNewTask] = useState("");

  const active = matches?.[0];

  if (isLoading) {
    return (
      <Section className="pt-8">
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </Section>
    );
  }

  if (!active) {
    return (
      <Section className="pt-8">
        <EmptyState
          icon={<Hammer className="size-8" />}
          title="No active workspace yet"
          description="Once you and another founder match, your shared workspace appears here."
          action={
            <Button asChild>
              <Link to="/app/matches">Go to matches</Link>
            </Button>
          }
        />
      </Section>
    );
  }

  const partner = active.anonymous_name;

  return (
    <Section
      className="pt-8"
      title="Shared workspace"
      description={`A shared workspace with ${partner}.`}
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/app/chat/$matchId" params={{ matchId: active.match_id }}>
            Open conversation
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border shadow-soft lg:col-span-2">
          <CardContent className="space-y-6 p-6">
            <Block
              title="Project overview"
              text="Use your first conversations to agree on the problem you both want to solve."
            />
            <Block
              title="MVP goal"
              text="One workflow end to end: the smallest thing a first user would find genuinely useful."
            />
            <div>
              <Head>Founder roles</Head>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <RoleCard name="You" role="Define your focus together" tags={["Product"]} />
                <RoleCard
                  name={partner}
                  role="Complementary strengths"
                  tags={active.skills.slice(0, 2)}
                />
              </div>
            </div>
            <div>
              <Head>First 30-day plan</Head>
              <ol className="mt-2 space-y-2 text-sm">
                <li>Week 1 — 10 user interviews and problem validation</li>
                <li>Week 2 — clickable prototype and scope lock</li>
                <li>Week 3 — working MVP of the core workflow</li>
                <li>Week 4 — pilot with first users and collect feedback</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <Head>Task list</Head>
              <div className="mt-3 space-y-3">
                {tasks.map((t) => (
                  <label key={t.id} className="flex items-start gap-3 text-sm">
                    <Checkbox
                      checked={t.done}
                      onCheckedChange={(v) =>
                        setTasks((ts) =>
                          ts.map((x) => (x.id === t.id ? { ...x, done: Boolean(v) } : x)),
                        )
                      }
                    />
                    <span className={t.done ? "text-muted-foreground line-through" : ""}>
                      {t.text}
                    </span>
                  </label>
                ))}
              </div>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTask.trim()) return;
                  setTasks((ts) => [
                    ...ts,
                    { id: crypto.randomUUID(), text: newTask.trim(), done: false },
                  ]);
                  setNewTask("");
                }}
              >
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a task"
                />
                <Button type="submit" variant="outline">
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <Head>Match summary</Head>
              <p className="mt-2 text-sm text-muted-foreground">
                You and {partner} both expressed interest. Identities stay private until you decide
                otherwise.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag tone="primary">{active.available_hours} hrs/week</Tag>
                {active.commitment_level && <Tag>{active.commitment_level}</Tag>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{children}</p>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <Head>{title}</Head>
      <p className="mt-1.5 text-sm">{text}</p>
    </div>
  );
}

function RoleCard({ name, role, tags }: { name: string; role: string; tags: string[] }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">{role}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
    </div>
  );
}
