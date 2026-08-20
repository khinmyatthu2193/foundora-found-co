import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PrivacyBadge, Section, Tag } from "@/components/foundora/ui-bits";
import { fetchDiscoveryFounders } from "@/lib/profile";

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
  const {
    data: founders,
    isLoading,
    error,
    refetch,
  } = useQuery({ queryKey: ["discovery"], queryFn: fetchDiscoveryFounders });

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
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="border-border shadow-soft">
              <CardContent className="space-y-3 p-6">
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-20 w-full animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <Card className="border-border shadow-soft">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Could not load founders."}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (founders?.length ?? 0) === 0 && (
        <EmptyState
          icon={<Compass className="size-8" />}
          title="No other founders yet"
          description="You're early. As more founders complete their profiles, they'll appear here anonymously."
          action={
            <Button asChild>
              <Link to="/app/profile">Review your profile</Link>
            </Button>
          }
        />
      )}

      {!isLoading && !error && (founders?.length ?? 0) > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {founders!.map((f) => (
            <Card
              key={f.discovery_id}
              className="flex flex-col border-border shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <CardContent className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{f.anonymous_name}</h3>
                  <PrivacyBadge />
                </div>

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
                    {f.industry_interests.map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Meta label="Available" value={`${f.available_hours} hrs/week`} />
                  <Meta label="Experience" value={f.experience_level ?? "—"} />
                  <Meta label="Looking for" value={f.looking_for ?? "—"} />
                  <Meta label="Working style" value={f.working_style ?? "—"} />
                  <Meta label="Commitment" value={f.commitment_level ?? "—"} />
                </div>

                <div>
                  <Label>Wants a partner who is</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {f.desired_partner_traits.map((s) => (
                      <Tag key={s} tone="muted">
                        {s}
                      </Tag>
                    ))}
                  </div>
                </div>

                <p className="mt-auto pt-2 text-xs text-muted-foreground">
                  Identities and startup ideas stay private. Matching arrives in the next phase.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
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
