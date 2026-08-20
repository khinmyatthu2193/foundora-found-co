import { supabase } from "@/integrations/supabase/client";

/**
 * Prototype premium system.
 *
 * This is a DEMO entitlement only: the plan is a single self-owned column on
 * the founder's own profile row, toggled by the founder from the UI. There is
 * no payment provider, no billing period and no server-verified entitlement.
 */

export type PlanStatus = "free" | "premium";

export const PLAN_LABEL: Record<PlanStatus, string> = {
  free: "Explorer",
  premium: "Founder Pro",
};

export function planQueryKey(userId: string) {
  return ["plan", userId] as const;
}

/** Reads the signed-in founder's plan. RLS keeps this to their own row. */
export async function fetchMyPlan(userId: string): Promise<PlanStatus> {
  const { data, error } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", userId)
    .maybeSingle();
  if (error) return "free";
  return data?.subscription_status === "premium" ? "premium" : "free";
}

/** Demo-only activation / deactivation of Founder Pro. No payment involved. */
export async function setMyPlan(userId: string, plan: PlanStatus): Promise<PlanStatus> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user || auth.user.id !== userId) {
    throw new Error("Your session expired. Please log in again.");
  }
  const { data, error } = await supabase
    .from("profiles")
    .update({ subscription_status: plan })
    .eq("id", userId)
    .select("subscription_status")
    .maybeSingle();
  if (error) throw new Error("Could not update your demo plan. Please try again.");
  if (!data) {
    throw new Error("Create your founder profile first, then activate the Founder Pro demo.");
  }
  return data.subscription_status === "premium" ? "premium" : "free";
}
