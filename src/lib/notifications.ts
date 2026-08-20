import { useMemo, useSyncExternalStore } from "react";

/**
 * Lightweight per-user "read" tracking for navigation badges.
 * Supabase stays the source of truth for interests/messages; this only
 * remembers when *this* browser last opened Matches / a conversation.
 */

export type ReadState = { matchesSeenAt: number; chats: Record<string, number> };

const EMPTY: ReadState = { matchesSeenAt: 0, chats: {} };
const KEY = (userId: string) => `foundora.read.${userId}`;

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", listener);
  };
}

function readRaw(userId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY(userId));
  } catch {
    return null;
  }
}

function parse(raw: string | null): ReadState {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<ReadState>;
    return {
      matchesSeenAt: Number(parsed.matchesSeenAt) || 0,
      chats: parsed.chats && typeof parsed.chats === "object" ? parsed.chats : {},
    };
  } catch {
    return EMPTY;
  }
}

function write(userId: string, next: ReadState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY(userId), JSON.stringify(next));
  } catch {
    /* ignore */
  }
  emit();
}

export function getReadState(userId: string): ReadState {
  return parse(readRaw(userId));
}

export function useReadState(userId: string): ReadState {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(userId),
    () => null,
  );
  return useMemo(() => parse(raw), [raw]);
}

export function markMatchesSeen(userId: string, at: number = Date.now()) {
  const current = getReadState(userId);
  if (current.matchesSeenAt >= at) return;
  write(userId, { ...current, matchesSeenAt: at });
}

export function markChatRead(userId: string, matchId: string, at: number = Date.now()) {
  const current = getReadState(userId);
  if ((current.chats[matchId] ?? 0) >= at) return;
  write(userId, { ...current, chats: { ...current.chats, [matchId]: at } });
}

export function clearReadState(userId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY(userId));
  } catch {
    /* ignore */
  }
  emit();
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
