import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  Eye,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EmptyState,
  JourneyProgress,
  PrivacyBadge,
  PrivateField,
  Section,
  Tag,
} from "@/components/foundora/ui-bits";
import {
  GUIDED_PROMPTS,
  founderById,
  useFoundora,
  type ProjectDirection,
} from "@/lib/foundora";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/chat/$matchId")({
  head: () => ({
    meta: [
      { title: "Anonymous conversation — Foundora" },
      {
        name: "description",
        content:
          "Chat anonymously with your Foundora match, explore AI compatibility insight and shape a shared project direction.",
      },
      { property: "og:title", content: "Anonymous conversation — Foundora" },
      {
        property: "og:description",
        content: "Identity is revealed only when both founders agree.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { matchId } = useParams({ from: "/app/chat/$matchId" });
  const founder = founderById(matchId);
  const { getMatch, updateMatch } = useFoundora();
  const m = getMatch(matchId);
  const navigate = useNavigate();

  const [draft, setDraft] = useState("");
  const [loadingCompat, setLoadingCompat] = useState(false);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [direction, setDirection] = useState<ProjectDirection>(m.direction);

  if (!founder) {
    return (
      <Section className="pt-8">
        <EmptyState
          title="Conversation not found"
          description="This match no longer exists."
          action={
            <Button asChild>
              <Link to="/app/matches">Back to matches</Link>
            </Button>
          }
        />
      </Section>
    );
  }

  const revealed = m.revealMe && m.revealThem;
  const bothAccepted = m.acceptMe && m.acceptThem;
  const step = bothAccepted ? 3 : revealed ? 2 : m.messages.length > 0 ? 1 : 0;

  const send = () => {
    if (!draft.trim()) return;
    const mine = { id: crypto.randomUUID(), from: "me" as const, text: draft.trim(), at: Date.now() };
    updateMatch(matchId, { messages: [...m.messages, mine] });
    setDraft("");
    setTimeout(() => {
      updateMatch(matchId, {
        messages: [
          ...getMatch(matchId).messages,
          {
            id: crypto.randomUUID(),
            from: "them" as const,
            text: "Good point — I've been thinking about that too. What does your week usually look like?",
            at: Date.now(),
          },
        ],
      });
    }, 900);
  };

  const generateCompatibility = () => {
    setLoadingCompat(true);
    setTimeout(() => {
      setLoadingCompat(false);
      updateMatch(matchId, { compatibility: true });
    }, 1200);
  };

  const generateProposal = () => {
    setLoadingProposal(true);
    setTimeout(() => {
      setLoadingProposal(false);
      updateMatch(matchId, { proposal: true });
    }, 1400);
  };

  return (
    <Section className="pt-8">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold md:text-2xl">
              {revealed ? founder.realName : founder.anonName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {revealed ? `Previously ${founder.anonName}` : "Anonymous conversation"}
            </p>
          </div>
          <PrivacyBadge label={revealed ? "Identity revealed" : "Identity protected"} />
        </div>
        <div className="mt-4">
          <JourneyProgress steps={["Matched", "Chatting", "Reveal", "Build"]} current={step} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Chat */}
        <Card className="border-border shadow-soft">
          <CardContent className="flex h-[540px] flex-col p-0">
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {m.messages.length === 0 && (
                <p className="mt-10 text-center text-sm text-muted-foreground">
                  Say hello. Real names and contact details stay hidden.
                </p>
              )}
              {m.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.from === "me" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.from === "me"
                        ? "bg-primary text-primary-foreground"
                        : "surface-panel",
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-4">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Write a message…"
              />
              <Button onClick={send} aria-label="Send message">
                <Send className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Reveal */}
          <Card className="border-border shadow-soft">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-primary" />
                <h2 className="font-semibold">Mutual identity reveal</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Identity is revealed only when both founders agree.
              </p>

              {!m.revealMe && (
                <>
                  <PrivateField>Identity protected</PrivateField>
                  <Button className="w-full" onClick={() => updateMatch(matchId, { revealMe: true })}>
                    Request identity reveal
                  </Button>
                </>
              )}

              {m.revealMe && !m.revealThem && (
                <>
                  <p className="rounded-lg surface-panel px-3 py-2 text-sm">
                    Reveal requested — waiting for your match.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      updateMatch(matchId, { revealThem: true });
                      toast.success("Identity revealed", {
                        description: "Both founders agreed to reveal identities.",
                      });
                    }}
                  >
                    Demo: simulate partner consent
                  </Button>
                </>
              )}

              {revealed && (
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    Identity revealed
                  </p>
                  <p className="mt-1 text-lg font-semibold">{founder.realName}</p>
                  <p className="text-sm text-muted-foreground">
                    Contact details are never shared by Foundora.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI compatibility */}
          <Collapsible defaultOpen>
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-left">
                  <span className="flex items-center gap-2 font-semibold">
                    <Sparkles className="size-4 text-primary" /> AI Founder Compatibility
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  {!m.compatibility ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Explore where you complement each other and where friction may appear.
                      </p>
                      <Button onClick={generateCompatibility} disabled={loadingCompat}>
                        {loadingCompat && <Loader2 className="size-4 animate-spin" />}
                        Generate compatibility
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-semibold text-primary">82%</span>
                        <span className="text-sm text-muted-foreground">
                          AI Compatibility Insight
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          Strengths
                        </p>
                        <ul className="mt-1.5 space-y-1 text-sm">
                          <li>• Complementary skill sets</li>
                          <li>• Similar commitment</li>
                          <li>• Shared interest in AI</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          Potential friction
                        </p>
                        <ul className="mt-1.5 space-y-1 text-sm">
                          <li>• Different working styles</li>
                          <li>• Availability needs discussion</li>
                        </ul>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        These are advisory signals, not a verdict. Use them as conversation starters.
                      </p>
                    </div>
                  )}
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>

          {/* Guided conversation */}
          <Card className="border-border shadow-soft">
            <CardContent className="space-y-3 p-6">
              <h2 className="font-semibold">Guided conversation</h2>
              <p className="text-sm text-muted-foreground">
                Tap a prompt to drop it into the chat box.
              </p>
              <div className="flex flex-wrap gap-2">
                {GUIDED_PROMPTS.map((p) => (
                  <button key={p} type="button" onClick={() => setDraft(p)}>
                    <Tag className="cursor-pointer transition-colors hover:bg-primary/15">{p}</Tag>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Build together */}
      <Card className="mt-6 border-border shadow-soft">
        <CardContent className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold">Build Together</h2>
            <p className="text-sm text-muted-foreground">
              Capture your shared project direction before generating a proposal.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ptitle">Project title</Label>
              <Input
                id="ptitle"
                value={direction.title}
                onChange={(e) => setDirection({ ...direction, title: e.target.value })}
                placeholder="e.g. Clinic Copilot"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pusers">Target users</Label>
              <Input
                id="pusers"
                value={direction.users}
                onChange={(e) => setDirection({ ...direction, users: e.target.value })}
                placeholder="Who is this for?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pproblem">Problem to solve</Label>
              <Textarea
                id="pproblem"
                rows={3}
                value={direction.problem}
                onChange={(e) => setDirection({ ...direction, problem: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="psolution">Rough solution</Label>
              <Textarea
                id="psolution"
                rows={3}
                value={direction.solution}
                onChange={(e) => setDirection({ ...direction, solution: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="pnotes">Notes</Label>
              <Textarea
                id="pnotes"
                rows={2}
                value={direction.notes}
                onChange={(e) => setDirection({ ...direction, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                updateMatch(matchId, { direction });
                toast.success("Project direction saved");
              }}
            >
              Save project direction
            </Button>
            <Button variant="outline" onClick={generateProposal} disabled={loadingProposal}>
              {loadingProposal && <Loader2 className="size-4 animate-spin" />}
              Generate AI Proposal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Proposal */}
      {m.proposal && (
        <Card className="mt-6 border-border shadow-card">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">AI project proposal</h2>
              <Tag tone="primary">Draft</Tag>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Block title="Project name" text={direction.title || "Clinic Copilot"} />
              <Block
                title="Problem"
                text={
                  direction.problem ||
                  "Small clinics lose hours each week to manual scheduling and follow-up admin."
                }
              />
              <Block
                title="Proposed solution"
                text={
                  direction.solution ||
                  "A lightweight assistant that drafts follow-ups, organises appointments and surfaces daily priorities."
                }
              />
              <Block
                title="Target users"
                text={direction.users || "Independent clinics with 2–10 staff."}
              />
              <Block
                title="Founder roles"
                text="You: product and interface. Your match: data, integrations and delivery. Growth shared."
              />
              <Block
                title="First MVP"
                text="One clinic workflow end to end: appointment intake, automated follow-up draft, simple daily view."
              />
              <Block
                title="First 30-day plan"
                text="Week 1 interviews · Week 2 clickable prototype · Week 3 working MVP · Week 4 pilot with two clinics."
              />
              <Block
                title="Key risks / questions"
                text="Compliance requirements, differing weekly availability, and who owns customer conversations."
              />
            </div>

            <div className="space-y-3 border-t border-border pt-5">
              {!m.acceptMe && (
                <Button onClick={() => updateMatch(matchId, { acceptMe: true })}>
                  Accept Proposal
                </Button>
              )}
              {m.acceptMe && !m.acceptThem && (
                <div className="space-y-3">
                  <p className="rounded-lg surface-panel px-3 py-2 text-sm">
                    Accepted by you — waiting for your match.
                  </p>
                  <Button variant="outline" onClick={() => updateMatch(matchId, { acceptThem: true })}>
                    Demo: simulate partner acceptance
                  </Button>
                </div>
              )}
              {bothAccepted && (
                <div className="space-y-3">
                  <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                    Proposal accepted by both founders
                  </p>
                  <Button onClick={() => navigate({ to: "/app/workspace" })}>
                    Go to Workspace <ArrowRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Section>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
      <p className="mt-1 text-sm">{text}</p>
    </div>
  );
}
