import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, FounderAvatar, Section } from "@/components/foundora/ui-bits";
import { fetchInboxMessages, fetchMyMatches } from "@/lib/matching";
import { unreadByMatch, useReadState } from "@/lib/notifications";

export const Route = createFileRoute("/app/chat/")({
  head: () => ({
    meta: [
      { title: "Conversations — Foundora" },
      {
        name: "description",
        content: "All your anonymous Foundora conversations with matched founders in one place.",
      },
      { property: "og:title", content: "Conversations — Foundora" },
      {
        property: "og:description",
        content: "Pick up an anonymous conversation with a founder you matched with.",
      },
    ],
  }),
  component: ChatListPage,
});

function ChatListPage() {
  const { user } = Route.useRouteContext();
  const readState = useReadState(user.id);

  const matches = useQuery({ queryKey: ["matches", user.id], queryFn: fetchMyMatches });
  const inbox = useQuery({
    queryKey: ["inbox-messages", user.id],
    queryFn: fetchInboxMessages,
    refetchInterval: 15000,
  });

  const messages = inbox.data ?? [];
  const unread = unreadByMatch(
    messages.filter((m) => m.sender_id !== user.id),
    readState,
  );

  const rows = (matches.data ?? [])
    .map((m) => ({
      match: m,
      last: messages.find((msg) => msg.match_id === m.match_id) ?? null,
      unread: unread[m.match_id] ?? 0,
    }))
    .sort((a, b) => {
      const at = a.last ? new Date(a.last.created_at).getTime() : 0;
      const bt = b.last ? new Date(b.last.created_at).getTime() : 0;
      return bt - at;
    });

  return (
    <Section
      className="pt-8"
      title="Conversations"
      description="Chats stay anonymous until you both choose to reveal identities."
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/app/matches">View matches</Link>
        </Button>
      }
    >
      {matches.isLoading && <p className="text-sm text-muted-foreground">Loading conversations…</p>}

      {!matches.isLoading && rows.length === 0 && (
        <EmptyState
          icon={<MessagesSquare className="size-8" />}
          title="No conversations yet"
          description="Chat unlocks as soon as you and another founder are interested in each other."
          action={
            <Button asChild>
              <Link to="/app/discover">Discover founders</Link>
            </Button>
          }
        />
      )}

      <div className="grid gap-3">
        {rows.map(({ match, last, unread: count }) => (
          <Link
            key={match.match_id}
            to="/app/chat/$matchId"
            params={{ matchId: match.match_id }}
            className="block"
          >
            <Card className="border-border shadow-soft transition-shadow hover:shadow-card">
              <CardContent className="flex items-center gap-4 p-4">
                <FounderAvatar path={match.avatar_url} name={match.anonymous_name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{match.anonymous_name}</p>
                    {count > 0 && (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {last
                      ? `${last.sender_id === user.id ? "You: " : ""}${last.content}`
                      : "Say hello — no messages yet."}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-primary">Open</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}
