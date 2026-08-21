import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo, PrivacyBadge, Tag } from "@/components/foundora/ui-bits";
import { DEMO_CONVERSATION, DEMO_FOUNDERS } from "@/lib/demo";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Foundora demo mode — explore the founder experience" },
      {
        name: "description",
        content:
          "Explore Foundora with sample founders: anonymous discovery, mutual matching and private chat, without an account.",
      },
      { property: "og:title", content: "Foundora demo mode" },
      {
        property: "og:description",
        content: "A guided preview of anonymous discovery, matching and chat inside Foundora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const [matched, setMatched] = useState<string[]>([]);
  const [active, setActive] = useState<string>(DEMO_FOUNDERS[0]!.id);
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<Record<string, string[]>>({});

  const activeFounder = DEMO_FOUNDERS.find((f) => f.id === active)!;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="size-4" /> Back to home
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
          <ShieldCheck className="size-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Demo mode enabled</p>
            <p className="text-xs text-muted-foreground">
              These are sample founders for demonstration only. Real accounts and real data are not
              shown here.
            </p>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-semibold md:text-3xl">Explore Foundora with demo founders</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Send interest to see how mutual matching works, then open the demo conversation.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {DEMO_FOUNDERS.map((f) => {
            const isMatched = matched.includes(f.id);
            return (
              <Card key={f.id} className="flex flex-col border-border shadow-soft">
                <CardContent className="flex flex-1 flex-col gap-4 p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold">{f.anonymous_name}</h2>
                      <p className="text-xs font-medium text-primary">Demo account</p>
                    </div>
                    <PrivacyBadge />
                  </div>
                  <p className="text-sm text-muted-foreground">{f.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.skills.map((s) => (
                      <Tag key={s} tone="primary">
                        {s}
                      </Tag>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {f.industry_interests.map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <Meta label="Experience" value={f.experience_level} />
                    <Meta label="Looking for" value={f.looking_for} />
                    <Meta label="Working style" value={f.working_style} />
                    <Meta label="Commitment" value={f.commitment_level} />
                  </dl>
                  <div className="mt-auto pt-2">
                    {isMatched ? (
                      <Button className="w-full" variant="outline" onClick={() => setActive(f.id)}>
                        Open demo chat
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setMatched((m) => [...m, f.id]);
                          setActive(f.id);
                          toast.success("It's a match! 🎉 (demo)");
                        }}
                      >
                        <Heart className="size-4" /> Interested
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Demo chat with {activeFounder.anonymous_name}</h2>
              <span className="text-xs text-muted-foreground">Mock messages only</span>
            </div>

            <div className="mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto scroll-smooth">
              {[
                ...(DEMO_CONVERSATION[active] ?? []).map((m) => ({ ...m })),
                ...(extra[active] ?? []).map((text, i) => ({
                  id: `extra-${i}`,
                  from: "me" as const,
                  text,
                  time: "Now",
                })),
              ].map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    m.from === "me"
                      ? "self-end bg-primary text-primary-foreground"
                      : "self-start bg-muted text-foreground"
                  }`}
                >
                  <p>{m.text}</p>
                  <p className="mt-1 text-[11px] opacity-70">{m.time}</p>
                </div>
              ))}
            </div>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                setExtra((x) => ({ ...x, [active]: [...(x[active] ?? []), draft.trim()] }));
                setDraft("");
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a demo message…"
              />
              <Button type="submit">
                <Send className="size-4" /> Send
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/signup">Create a real account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
