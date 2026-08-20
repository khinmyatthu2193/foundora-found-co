import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Per-user "read" tracking for navigation badges, stored in Supabase
 * (public.notification_reads) so counts survive refresh and follow the
 * account across devices. Supabase stays the single source of truth for
 * interests, matches and messages; this only records when the user last
 * opened Matches / each conversation.
 */

export type ReadState = { matchesSeenAt: number; chats: Record<string, number> };

const EMPTY: ReadState = { matchesSeenAt: 0, chats: {} };

export const readStateQueryKey = (userId: string) => ["read-state", userId] as const;

function toMillis(value: unknown): number {
  if (typeof value !== "string") return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Your session expired. Please log in again.");
  return data.user.id;
}

export async function fetchReadState(): Promise<ReadState> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("notification_reads")
    .select("matches_seen_at, chats")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return EMPTY;
  if (!data) return EMPTY;

  const chatsRaw = (data.chats ?? {}) as Record<string, unknown>;
  const chats: Record<string, number> = {};
  for (const [matchId, at] of Object.entries(chatsRaw)) chats[matchId] = toMillis(at);

  return { matchesSeenAt: toMillis(data.matches_seen_at), chats };
}

async function saveReadState(next: ReadState) {
  const userId = await requireUserId();
  const chats: Record<string, string> = {};
  for (const [matchId, at] of Object.entries(next.chats)) chats[matchId] = new Date(at).toISOString();

  const { error } = await supabase.from("notification_reads").upsert(
    {
      user_id: userId,
      matches_seen_at: new Date(next.matchesSeenAt).toISOString(),
      chats,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error("Could not update your notifications.");
}

/** Current read state for the signed-in founder. */
export function useReadState(userId: string): ReadState {
  const { data } = useQuery({
    queryKey: readStateQueryKey(userId),
    queryFn: fetchReadState,
    staleTime: 10_000,
  });
  return data ?? EMPTY;
}

/** Mutators that persist read state and refresh the badge queries. */
export function useMarkRead(userId: string) {
  const queryClient = useQueryClient();

  const persist = useCallback(
    async (update: (current: ReadState) => ReadState | null) => {
      const current =
        queryClient.getQueryData<ReadState>(readStateQueryKey(userId)) ??
        (await queryClient.fetchQuery({
          queryKey: readStateQueryKey(userId),
          queryFn: fetchReadState,
        }));
      const next = update(current ?? EMPTY);
      if (!next) return;
      queryClient.setQueryData(readStateQueryKey(userId), next);
      try {
        await saveReadState(next);
      } catch {
        void queryClient.invalidateQueries({ queryKey: readStateQueryKey(userId) });
      }
    },
    [queryClient, userId],
  );

  const markMatchesSeen = useCallback(
    (at: number = Date.now()) =>
      persist((current) =>
        current.matchesSeenAt >= at ? null : { ...current, matchesSeenAt: at },
      ),
    [persist],
  );

  const markChatRead = useCallback(
    (matchId: string, at: number = Date.now()) =>
      persist((current) =>
        (current.chats[matchId] ?? 0) >= at
          ? null
          : { ...current, chats: { ...current.chats, [matchId]: at } },
      ),
    [persist],
  );

  return { markMatchesSeen, markChatRead };
}

/** Unread counts per match id, given the other founders' messages. */
export function unreadByMatch(
  messages: { match_id: string; created_at: string }[],
  state: ReadState,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of messages) {
    const readAt = state.chats[m.match_id] ?? 0;
    if (new Date(m.created_at).getTime() > readAt) out[m.match_id] = (out[m.match_id] ?? 0) + 1;
  }
  return out;
}
