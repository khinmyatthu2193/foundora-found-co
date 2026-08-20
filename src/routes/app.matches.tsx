import { formatAvailability } from "@/lib/foundora";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Heart, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  EmptyState,
  FounderAvatar,
  PlanBadge,
  PrivacyBadge,
  Section,
  Tag,
  TrustBadges,
} from "@/components/foundora/ui-bits";
import { fetchIncomingInterests, fetchMyMatches, respondToInterest } from "@/lib/matching";
import { useMarkRead } from "@/lib/notifications";

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
  const { markMatchesSeen } = useMarkRead(user.id);

  const matches = useQuery({
    queryKey: ["matches", user.id],
    queryFn: fetchMyMatches,
  });
  const incoming = useQuery({
    queryKey: ["incoming-interests", user.id],
    queryFn: fetchIncomingInterests,
  });

  const respond = useMutation({
    mutationFn: (vars: { discoveryId: string; accept: boolean }) =>
      respondToInterest(vars.discoveryId, vars.accept),
    onSuccess: (res, vars) => {
      if (!vars.accept) toast.message("Interest declined");
      else
        toast[res.matched ? "success" : "message"](
          res.matched ? "It's a match! 🎉" : "Interest accepted",
        );
      void queryClient.invalidateQueries({ queryKey: ["matches", user.id] });
      void queryClient.invalidateQueries({ queryKey: ["incoming-interests", user.id] });
      void queryClient.invalidateQueries({ queryKey: ["discovery", user.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send interest."),
  });

  const pending = (incoming.data ?? []).filter((i) => !i.interest_sent && i.status === "pending");

  // Opening this page clears the "interest received" and "new match" badges.
  useEffect(() => {
    if (incoming.isLoading || matches.isLoading) return;
    void markMatchesSeen();
  }, [incoming.isLoading, incoming.dataUpdatedAt, matches.isLoading, matches.dataUpdatedAt, markMatchesSeen]);

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
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <FounderAvatar path={i.avatar_url} name={i.anonymous_name} />
                      <div>
                        <h3 className="text-lg font-semibold">{i.anonymous_name}</h3>
                        <PlanBadge premium={i.is_premium} size="sm" className="mt-1" />
                      </div>
                    </div>
                    <PrivacyBadge />
                  </div>
                  <TrustBadges flags={i} />
                  <div className="flex flex-wrap gap-2">
                    {i.skills.slice(0, 4).map((s) => (
                      <Tag key={s} tone="primary">
                        {s}
                      </Tag>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {i.anonymous_name} is interested in building with you.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={respond.isPending}
                      onClick={() => respond.mutate({ discoveryId: i.discovery_id, accept: false })}
                    >
                      Decline
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={respond.isPending}
                      onClick={() => respond.mutate({ discoveryId: i.discovery_id, accept: true })}
                    >
                      Accept
                    </Button>
                  </div>
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
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <FounderAvatar path={m.avatar_url} name={m.anonymous_name} />
                    <div>
                      <h3 className="text-lg font-semibold">{m.anonymous_name}</h3>
                      <PlanBadge premium={m.is_premium} size="sm" className="mt-1" />
                    </div>
                  </div>
                  <PrivacyBadge />
                </div>
                <TrustBadges flags={m} />
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
                  <span className="font-medium text-foreground">{formatAvailability(m.available_hours)}</span>
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
