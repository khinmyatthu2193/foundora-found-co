import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuildDecisionCard } from "@/components/foundora/build-decision-card";
import { CompatibilityCard } from "@/components/foundora/compatibility-card";
import { GuidedConversation } from "@/components/foundora/guided-conversation";
import { ProjectDirectionCard } from "@/components/foundora/project-direction-card";
import { ProposalCard } from "@/components/foundora/proposal-card";
import {
  EmptyState,
  FounderAvatar,
  PlanBadge,
  PrivacyBadge,
  Section,
  Tag,
} from "@/components/foundora/ui-bits";
import { fetchMyPlan, planQueryKey } from "@/lib/premium";
import { fetchMatchHeader, fetchMessages, sendMessage } from "@/lib/matching";
import { useMarkRead } from "@/lib/notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/chat/$matchId")({
  head: () => ({
    meta: [
      { title: "Anonymous conversation — Foundora" },
      {
        name: "description",
        content: "Chat anonymously with your Foundora match after a mutual interest match.",
      },
      { property: "og:title", content: "Anonymous conversation — Foundora" },
      {
        property: "og:description",
        content: "Chat is available only after both founders match.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { matchId } = useParams({ from: "/app/chat/$matchId" });
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const { markChatRead } = useMarkRead(user.id);

  const plan = useQuery({
    queryKey: planQueryKey(user.id),
    queryFn: () => fetchMyPlan(user.id),
  });

  const header = useQuery({
    queryKey: ["match-header", user.id, matchId],
    queryFn: () => fetchMatchHeader(matchId),
  });

  const messages = useQuery({
    queryKey: ["messages", user.id, matchId],
    queryFn: () => fetchMessages(matchId),
    enabled: Boolean(header.data),
    refetchInterval: 5000,
  });

  const send = useMutation({
    mutationFn: (text: string) => sendMessage(matchId, text),
    onSuccess: () => {
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: ["messages", user.id, matchId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Message not sent."),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.data?.length]);

  // Viewing the conversation marks everything in it as read.
  const latestAt = messages.data?.[messages.data.length - 1]?.created_at;
  useEffect(() => {
    if (!header.data) return;
    void markChatRead(matchId, latestAt ? new Date(latestAt).getTime() : Date.now());
  }, [header.data, latestAt, matchId, markChatRead]);


  if (header.isLoading) {
    return (
      <Section className="pt-8">
        <p className="text-sm text-muted-foreground">Opening conversation…</p>
      </Section>
    );
  }

  if (!header.data) {
    return (
      <Section className="pt-8">
        <EmptyState
          title="Conversation not available"
          description="Chat unlocks only after you and another founder match with each other."
          action={
            <Button asChild>
              <Link to="/app/matches">Back to matches</Link>
            </Button>
          }
        />
      </Section>
    );
  }

  const other = header.data;

  return (
    <Section className="pt-8">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FounderAvatar path={other.avatar_url} name={other.anonymous_name} />
            <div>
              <h1 className="text-xl font-semibold md:text-2xl">{other.anonymous_name}</h1>
              <p className="text-sm text-muted-foreground">Anonymous conversation</p>
              <PlanBadge premium={other.is_premium} size="sm" className="mt-1" />
            </div>
          </div>
          <PrivacyBadge />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {other.skills.slice(0, 5).map((s) => (
            <Tag key={s} tone="primary">
              {s}
            </Tag>
          ))}
          {other.commitment_level && <Tag>{other.commitment_level}</Tag>}
        </div>
      </div>

      <CompatibilityCard
        className="mt-4"
        userId={user.id}
        matchId={matchId}
        premium={plan.data === "premium"}
        otherName={other.anonymous_name}
      />

      <GuidedConversation
        className="mt-4"
        userId={user.id}
        matchId={matchId}
        premium={plan.data === "premium"}
      />

      <BuildDecisionCard
        className="mt-4"
        userId={user.id}
        matchId={matchId}
        partnerName={other.anonymous_name}
      />

      <ProjectDirectionCard className="mt-4" userId={user.id} matchId={matchId} />

      <ProposalCard
        className="mt-4"
        userId={user.id}
        matchId={matchId}
        premium={plan.data === "premium"}
      />


      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex max-h-[55vh] min-h-64 flex-col gap-3 overflow-y-auto p-5">
          {messages.isLoading && (
            <p className="text-sm text-muted-foreground">Loading messages…</p>
          )}
          {!messages.isLoading && (messages.data?.length ?? 0) === 0 && (
            <p className="m-auto max-w-sm text-center text-sm text-muted-foreground">
              You matched. Say hello and explore what you could build together — identities stay
              private.
            </p>
          )}
          {messages.data?.map((msg, i) => {
            const mine = msg.sender_id === user.id;
            const prev = messages.data?.[i - 1];
            const showDate = !prev || !isSameDay(prev.created_at, msg.created_at);
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="my-3 flex items-center gap-3">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {formatDayLabel(msg.created_at)}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                      mine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-[11px] tabular-nums",
                        mine ? "text-primary-foreground/70 text-right" : "text-muted-foreground",
                      )}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form
          className="flex items-center gap-2 border-t border-border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim() || send.isPending) return;
            send.mutate(draft);
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message…"
            aria-label="Message"
          />
          <Button type="submit" disabled={!draft.trim() || send.isPending}>
            {send.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Send
          </Button>
        </form>
      </div>
    </Section>
  );
}
