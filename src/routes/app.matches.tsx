import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PrivacyBadge, Section, Tag } from "@/components/foundora/ui-bits";
import { founderById, useFoundora } from "@/lib/foundora";

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
  const { state } = useFoundora();
  const matches = state.matches.map(founderById).filter(Boolean);

  return (
    <Section
      className="pt-8"
      title="Matches"
      description="Both of you expressed interest. Conversations stay anonymous until you agree otherwise."
    >
      {matches.length === 0 ? (
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
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((f) => (
            <Card key={f!.id} className="border-border shadow-soft transition-shadow hover:shadow-card">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{f!.anonName}</h3>
                  <PrivacyBadge />
                </div>
                <div className="flex flex-wrap gap-2">
                  {f!.skills.slice(0, 3).map((s) => (
                    <Tag key={s} tone="primary">
                      {s}
                    </Tag>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {f!.industries.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Commitment: <span className="font-medium text-foreground">{f!.commitment}</span>
                </p>
                <div className="rounded-lg border border-border p-3 text-sm">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    AI compatibility insight
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Preview available inside the conversation.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link to="/app/chat/$matchId" params={{ matchId: f!.id }}>
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
