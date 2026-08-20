import { supabase } from "@/integrations/supabase/client";

export type MatchSummary = {
  match_id: string;
  created_at: string;
  anonymous_name: string;
  skills: string[];
  industry_interests: string[];
  commitment_level: string | null;
  available_hours: number;
};

export type IncomingInterest = {
  discovery_id: string;
  anonymous_name: string;
  skills: string[];
  industry_interests: string[];
  created_at: string;
  interest_sent: boolean;
};

export type MatchHeader = {
  match_id: string;
  anonymous_name: string;
  skills: string[];
  commitment_level: string | null;
};

export type ChatMessageRow = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Your session expired. Please log in again.");
  return data.user.id;
}

/** Sends interest to an anonymous founder. The other person's account id never leaves the database. */
export async function sendInterest(discoveryId: string): Promise<{ matched: boolean }> {
  await requireUserId();
  const { data, error } = await supabase.rpc("send_interest", { p_discovery_id: discoveryId });
  if (error) throw new Error("Could not send your interest. Please try again.");
  const row = (data as { matched: boolean }[] | null)?.[0];
  return { matched: Boolean(row?.matched) };
}

export async function fetchMyMatches(): Promise<MatchSummary[]> {
  const { data, error } = await supabase.rpc("my_matches");
  if (error) throw new Error("Could not load your matches. Please try again.");
  return (data ?? []) as MatchSummary[];
}

export async function fetchIncomingInterests(): Promise<IncomingInterest[]> {
  const { data, error } = await supabase.rpc("incoming_interests");
  if (error) throw new Error("Could not load incoming interest. Please try again.");
  return (data ?? []) as IncomingInterest[];
}

export async function fetchMatchHeader(matchId: string): Promise<MatchHeader | null> {
  const { data, error } = await supabase.rpc("match_header", { p_match_id: matchId });
  if (error) throw new Error("Could not open this conversation.");
  return ((data as MatchHeader[] | null) ?? [])[0] ?? null;
}

export async function fetchMessages(matchId: string): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, match_id, sender_id, content, created_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });
  if (error) throw new Error("Could not load this conversation.");
  return (data ?? []) as ChatMessageRow[];
}

export async function sendMessage(matchId: string, content: string): Promise<ChatMessageRow> {
  const userId = await requireUserId();
  const text = content.trim();
  if (!text) throw new Error("Write a message first.");
  const { data, error } = await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: userId, content: text })
    .select("id, match_id, sender_id, content, created_at")
    .single();
  if (error) throw new Error("Your message could not be sent. Please try again.");
  return data as ChatMessageRow;
}
