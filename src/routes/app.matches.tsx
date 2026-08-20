import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PrivacyBadge, Section, Tag } from "@/components/foundora/ui-bits";
import { fetchIncomingInterests, fetchMyMatches, sendInterest } from "@/lib/matching";

export const Route = createFileRoute("/app/matches")({
  head: () => ({
    meta: [
      { title: "Your matches — Foundora" },
      {
        name: "description",
        content: "Mutual matches on Foundora, where both founders chose each other.",
      },
      { property: "og:title", content: "Your matches — Foundora" },
      {
        property: "og:description",
        content: "Open an anonymous chat with founders who matched with you.",
      },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const matches = useQuery({
    queryKey: ["matches", user.id],
    queryFn: fetchMyMatches,
  });
  const incoming = useQuery({
    queryKey: ["incoming-interests", user.id],
    queryFn: fetchIncomingInterests,
  });

  const interestBack = useMutation({
    mutationFn: (discoveryId: string) => sendInterest(discoveryId),
    onSuccess: (res) => {
      toast[res.matched ? "success" : "message"](
        res.matched ? "It's a match! 🎉" : "Interest sent",
      );
      void queryClient.invalidateQueries({ queryKey: ["matches", user.id] });
      void queryClient.invalidateQueries({ queryKey: ["incoming-interests", user.id] });
      void queryClient.invalidateQueries({ queryKey: ["discovery", user.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send interest."),
  });

  const pending = (incoming.data ?? []).filter((i) => !i.interest_sent);

  return (
    <Section
      className="pt-8"
      title="Matches"
      description="Both of you expressed interest. Conversations stay anonymous."
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/app/discover">Discover founders</Link>
        </Button>
      }
    >
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            <Heart className="size-4" /> Interest received
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pending.map((i) => (
              <Card key={i.discovery_id} className="border-border shadow-soft">
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">{i.anonymous_name}</h3>
                    <PrivacyBadge />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {i.skills.slice(0, 4).map((s) => (
                      <Tag key={s} tone="primary">
                        {s}
                      </Tag>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This founder is interested in building with you.
                  </p>
                  <Button
                    className="w-full"
                    disabled={interestBack.isPending}
                    onClick={() => interestBack.mutate(i.discovery_id)}
                  >
                    Interested back
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {matches.isLoading && <p className="text-sm text-muted-foreground">Loading your matches…</p>}

      {matches.error && (
        <p className="text-sm text-destructive">
          {matches.error instanceof Error ? matches.error.message : "Could not load matches."}
        </p>
      )}

      {!matches.isLoading && !matches.error && (matches.data?.length ?? 0) === 0 && (
        <EmptyState
          icon={<Users className="size-8" />}
          title="No matches yet. Keep discovering founders."
          description="When someone you're interested in is interested back, they'll appear here."
          action={
            <Button asChild>
              <Link to="/app/discover">Discover founders</Link>
            </Button>
          }
        />
      )}

      {(matches.data?.length ?? 0) > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.data!.map((m) => (
            <Card
              key={m.match_id}
              className="border-border shadow-soft transition-shadow hover:shadow-card"
            >
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{m.anonymous_name}</h3>
                  <PrivacyBadge />
                </div>
                <div className="flex flex-wrap gap-2">
                  {m.skills.slice(0, 3).map((s) => (
                    <Tag key={s} tone="primary">
                      {s}
                    </Tag>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {m.industry_interests.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Commitment:{" "}
                  <span className="font-medium text-foreground">{m.commitment_level ?? "—"}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Available:{" "}
                  <span className="font-medium text-foreground">{m.available_hours} hrs/week</span>
                </p>
                <Button asChild className="w-full">
                  <Link to="/app/chat/$matchId" params={{ matchId: m.match_id }}>
                    Open chat
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
