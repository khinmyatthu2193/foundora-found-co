import { supabase } from "@/integrations/supabase/client";
import type { FounderProfile } from "@/lib/foundora";

export type ProfileRow = {
  id: string;
  anonymous_name: string;
  real_name: string | null;
  skills: string[];
  what_to_build: string | null;
  industry_interests: string[];
  available_hours: number;
  experience_level: string | null;
  looking_for: string | null;
  working_style: string | null;
  commitment_level: string | null;
  desired_partner_traits: string[];
};

export type DiscoveryFounder = {
  discovery_id: string;
  anonymous_name: string;
  skills: string[];
  industry_interests: string[];
  available_hours: number;
  experience_level: string | null;
  looking_for: string | null;
  working_style: string | null;
  commitment_level: string | null;
  desired_partner_traits: string[];
};

export function rowToForm(row: ProfileRow): FounderProfile {
  return {
    anonName: row.anonymous_name,
    realName: row.real_name ?? "",
    skills: row.skills ?? [],
    buildIdea: row.what_to_build ?? "",
    industries: row.industry_interests ?? [],
    hoursPerWeek: row.available_hours ?? 20,
    experience: row.experience_level ?? "Intermediate",
    lookingFor: row.looking_for ?? "Co-founder",
    workingStyle: row.working_style ?? "Collaborative",
    commitment: row.commitment_level ?? "Part-time",
    traits: row.desired_partner_traits ?? [],
  };
}

export function formToRow(form: FounderProfile, userId: string) {
  return {
    id: userId,
    anonymous_name: form.anonName.trim(),
    real_name: form.realName.trim() || null,
    skills: form.skills,
    what_to_build: form.buildIdea.trim() || null,
    industry_interests: form.industries,
    available_hours: form.hoursPerWeek,
    experience_level: form.experience,
    looking_for: form.lookingFor,
    working_style: form.workingStyle,
    commitment_level: form.commitment,
    desired_partner_traits: form.traits,
  };
}

const PROFILE_COLUMNS =
  "id, anonymous_name, real_name, skills, what_to_build, industry_interests, available_hours, experience_level, looking_for, working_style, commitment_level, desired_partner_traits";

function describe(error: { message: string; code?: string; details?: string; hint?: string }) {
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return "Your account isn't allowed to write this profile. Please log out and log back in, then try again.";
  }
  const extra = [error.details, error.hint].filter(Boolean).join(" ");
  return [error.message, extra].filter(Boolean).join(" — ");
}

/** Loads the signed-in user's own profile (RLS restricts this to the owner). */
export async function fetchMyProfile(): Promise<ProfileRow | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userData.user.id)
    .maybeSingle();
  if (error) throw new Error(describe(error));
  return (data as ProfileRow | null) ?? null;
}

export async function upsertMyProfile(form: FounderProfile, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(formToRow(form, userId), { onConflict: "id" })
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (error) throw new Error(describe(error));
  if (!data) {
    throw new Error(
      "The profile was not saved (no row returned). Please log out, log back in, and try again.",
    );
  }
  return data as ProfileRow;
}

/**
 * Anonymous discovery. Reads through a SECURITY DEFINER function that only
 * returns approved, non-identifying fields for other founders.
 */
export async function fetchDiscoveryFounders(): Promise<DiscoveryFounder[]> {
  const { data, error } = await supabase.rpc("discover_founders");
  if (error) throw error;
  return (data ?? []) as DiscoveryFounder[];
}
