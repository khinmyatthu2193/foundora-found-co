import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Compass, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PrivacyBadge, Section, Tag } from "@/components/foundora/ui-bits";
import { MOCK_FOUNDERS, useFoundora } from "@/lib/foundora";

export const Route = createFileRoute("/app/discover")({
  head: () => ({
    meta: [
      { title: "Discover founders anonymously — Foundora" },
      {
        name: "description",
        content:
          "Browse founders by skills, industries, availability and working style — without exposing anyone's identity.",
      },
      { property: "og:title", content: "Discover founders anonymously — Foundora" },
      {
        property: "og:description",
        content: "Interest becomes a match only when both founders choose each other.",
      },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const { state, pass, interested } = useFoundora();

  const remaining = MOCK_FOUNDERS.filter(
    (f) => !state.passed.includes(f.id) && !state.interested.includes(f.id),
  );

  const handleInterested = (id: string) => {
    const f = MOCK_FOUNDERS.find((x) => x.id === id)!;
    interested(id);
    if (f.instantMatch) {
      toast.success("It's a match!", {
        description: `${f.anonName} was already interested in you. You can start chatting.`,
        icon: <PartyPopper className="size-4" />,
      });
    } else {
      toast("Interest sent", {
        description: "You'll be matched if they're interested too.",
        icon: <Check className="size-4" />,
      });
    }
  };

  return (
    <Section
      className="pt-8"
      title="Discover founders"
      description="Everyone here is anonymous. Names, ideas and emails stay hidden."
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/app/matches">View matches</Link>
        </Button>
      }
    >
      {remaining.length === 0 ? (
        <EmptyState
          icon={<Compass className="size-8" />}
          title="You've reviewed everyone for now"
          description="New founders join Foundora regularly. Check your matches in the meantime."
          action={
            <Button asChild>
              <Link to="/app/matches">Go to matches</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {remaining.map((f) => (
            <Card
              key={f.id}
              className="flex flex-col border-border shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <CardContent className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{f.anonName}</h3>
                  <PrivacyBadge />
                </div>
                <p className="text-sm text-muted-foreground">{f.blurb}</p>

                <div>
                  <Label>Skills</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {f.skills.map((s) => (
                      <Tag key={s} tone="primary">
                        {s}
                      </Tag>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Industries</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {f.industries.map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Meta label="Available" value={`${f.hours} hrs/week`} />
                  <Meta label="Experience" value={f.experience} />
                  <Meta label="Looking for" value={f.lookingFor} />
                  <Meta label="Working style" value={f.workingStyle} />
                  <Meta label="Commitment" value={f.commitment} />
                </div>

                <div>
                  <Label>Wants a partner who is</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {f.traits.map((s) => (
                      <Tag key={s} tone="muted">
                        {s}
                      </Tag>
                    ))}
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" onClick={() => pass(f.id)}>
                    Pass
                  </Button>
                  <Button onClick={() => handleInterested(f.id)}>Interested</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {state.interested.length > 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Interest sent to {state.interested.length} founder
          {state.interested.length > 1 ? "s" : ""}. Matches appear once they're interested too.
        </p>
      )}
    </Section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{children}</p>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
