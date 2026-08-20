import { supabase } from "@/integrations/supabase/client";

export type CompatibilityReport = {
  id: string;
  match_id: string;
  score: number;
  strengths: string[];
  challenges: string[];
  discussion_topics: string[];
  created_at: string;
};

export function compatibilityQueryKey(userId: string, matchId: string) {
  return ["compatibility", userId, matchId] as const;
}

/** Reads the saved report for a match. RLS limits this to the two matched founders. */
export async function fetchCompatibilityReport(
  matchId: string,
): Promise<CompatibilityReport | null> {
  const { data, error } = await supabase
    .from("compatibility_reports")
    .select("id, match_id, score, strengths, challenges, discussion_topics, created_at")
    .eq("match_id", matchId)
    .maybeSingle();
  if (error) throw new Error("Could not load the compatibility report.");
  return (data as CompatibilityReport | null) ?? null;
}
