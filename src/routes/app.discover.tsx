import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Compass, Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  EmptyState,
  FounderAvatar,
  PrivacyBadge,
  Section,
  Tag,
  TrustBadges,
} from "@/components/foundora/ui-bits";
import { sendInterest } from "@/lib/matching";
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
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const [passed, setPassed] = useState<string[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const {
    data: founders,
    isLoading,
    error,
    refetch,
  } = useQuery({ queryKey: ["discovery", user.id], queryFn: fetchDiscoveryFounders });

  const interest = useMutation({
    mutationFn: (discoveryId: string) => sendInterest(discoveryId),
    onMutate: (id) => setPendingId(id),
    onSettled: () => setPendingId(null),
    onSuccess: (res) => {
      if (res.matched) toast.success("It's a match! 🎉 Open Matches to start chatting.");
      else toast.message("Interest sent");
      void queryClient.invalidateQueries({ queryKey: ["discovery", user.id] });
      void queryClient.invalidateQueries({ queryKey: ["matches", user.id] });
      void queryClient.invalidateQueries({ queryKey: ["incoming-interests", user.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send interest."),
  });

  const visible = (founders ?? []).filter((f) => !passed.includes(f.discovery_id));

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

      {!isLoading && !error && visible.length === 0 && (
        <EmptyState
          icon={<Compass className="size-8" />}
          title="No other founders to show"
          description="You're early. As more founders complete their profiles, they'll appear here anonymously."
          action={
            <Button asChild>
              <Link to="/app/profile">Review your profile</Link>
            </Button>
          }
        />
      )}

      {!isLoading && !error && visible.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((f) => {
            const sent = f.interest_sent || f.is_matched;
            const busy = pendingId === f.discovery_id;
            return (
              <Card
                key={f.discovery_id}
                className="flex flex-col border-border shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <CardContent className="flex flex-1 flex-col gap-4 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <FounderAvatar path={f.avatar_url} name={f.anonymous_name} />
                      <h3 className="text-lg font-semibold">{f.anonymous_name}</h3>
                    </div>
                    <PrivacyBadge />
                  </div>

                  <TrustBadges flags={f} />

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

                  <div className="mt-auto flex gap-2 pt-3">
                    {f.is_matched ? (
                      <Button asChild className="w-full" variant="outline">
                        <Link to="/app/matches">It's a match — open chat</Link>
                      </Button>
                    ) : sent ? (
                      <Button className="w-full" variant="outline" disabled>
                        <Check className="size-4" /> Interest sent
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled={busy}
                          onClick={() => setPassed((p) => [...p, f.discovery_id])}
                        >
                          Pass
                        </Button>
                        <Button
                          className="flex-1"
                          disabled={busy || interest.isPending}
                          onClick={() => interest.mutate(f.discovery_id)}
                        >
                          {busy ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Heart className="size-4" />
                          )}
                          Interested
                        </Button>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Identities and startup ideas stay private until you both match.
                  </p>
                </CardContent>
              </Card>
            );
          })}
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
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
