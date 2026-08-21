import { supabase } from "@/integrations/supabase/client";
import { joinValues, splitValues, type FounderProfile } from "@/lib/foundora";

export type ProfileRow = {
  id: string;
  anonymous_name: string;
  real_name: string | null;
  skills: string[];
  what_to_build: string | null;
  bio: string | null;
  industry_interests: string[];
  available_hours: number;
  experience_level: string | null;
  looking_for: string | null;
  working_style: string | null;
  commitment_level: string | null;
  desired_partner_traits: string[];
  avatar_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  website_url: string | null;
  subscription_status: string;
};

export type TrustFlags = {
  has_linkedin: boolean;
  has_github: boolean;
  has_portfolio: boolean;
  email_verified: boolean;
};

export type DiscoveryFounder = TrustFlags & {
  discovery_id: string;
  anonymous_name: string;
  avatar_url: string | null;
  bio: string | null;
  skills: string[];
  industry_interests: string[];
  available_hours: number;
  experience_level: string | null;
  looking_for: string | null;
  working_style: string | null;
  commitment_level: string | null;
  desired_partner_traits: string[];
  profile_strength: number;
  interest_sent: boolean;
  is_matched: boolean;
  is_premium: boolean;
};

export function rowToForm(row: ProfileRow): FounderProfile {
  return {
    anonName: row.anonymous_name,
    realName: row.real_name ?? "",
    skills: row.skills ?? [],
    buildIdea: row.what_to_build ?? "",
    bio: row.bio ?? "",
    industries: row.industry_interests ?? [],
    hoursPerWeek: row.available_hours ?? 20,
    experience: row.experience_level ?? "Intermediate",
    lookingFor: splitValues(row.looking_for),
    workingStyle: splitValues(row.working_style),
    commitment: row.commitment_level ?? "Part-time",
    traits: row.desired_partner_traits ?? [],
    avatarPath: row.avatar_url ?? "",
    linkedinUrl: row.linkedin_url ?? "",
    githubUrl: row.github_url ?? "",
    portfolioUrl: row.portfolio_url ?? "",
    websiteUrl: row.website_url ?? "",
  };
}

export const emptyProfileForm: FounderProfile = {
  anonName: "",
  realName: "",
  skills: [],
  buildIdea: "",
  bio: "",
  industries: [],
  hoursPerWeek: 20,
  experience: "Intermediate",
  lookingFor: ["Co-founder"],
  workingStyle: ["Collaborative"],
  commitment: "Part-time",
  traits: [],
  avatarPath: "",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
  websiteUrl: "",
};

function cleanUrl(value: string) {
  const v = value.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function formToRow(form: FounderProfile, userId: string) {
  return {
    id: userId,
    anonymous_name: form.anonName.trim(),
    real_name: form.realName.trim() || null,
    skills: form.skills,
    what_to_build: form.buildIdea.trim() || null,
    bio: form.bio.trim() || null,
    industry_interests: form.industries,
    available_hours: form.hoursPerWeek,
    experience_level: form.experience,
    looking_for: joinValues(form.lookingFor),
    working_style: joinValues(form.workingStyle),
    commitment_level: form.commitment,
    desired_partner_traits: form.traits,
    avatar_url: form.avatarPath.trim() || null,
    linkedin_url: cleanUrl(form.linkedinUrl),
    github_url: cleanUrl(form.githubUrl),
    portfolio_url: cleanUrl(form.portfolioUrl),
    website_url: cleanUrl(form.websiteUrl),
  };
}

const PROFILE_COLUMNS =
  "id, anonymous_name, real_name, skills, what_to_build, bio, industry_interests, available_hours, experience_level, looking_for, working_style, commitment_level, desired_partner_traits, avatar_url, linkedin_url, github_url, portfolio_url, website_url, subscription_status";

function describe(error: { message: string; code?: string; details?: string; hint?: string }) {
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return "Your account isn't allowed to write this profile. Please log out and log back in, then try again.";
  }
  if (error.code === "23505" || /duplicate key|unique/i.test(error.message)) {
    return "That anonymous name is already taken. Generate another name and try again.";
  }
  const extra = [error.details, error.hint].filter(Boolean).join(" ");
  return [error.message, extra].filter(Boolean).join(" — ");
}

async function requireCurrentUser(expectedUserId?: string) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("Your session expired. Please log in again.");
  }
  if (expectedUserId && data.user.id !== expectedUserId) {
    throw new Error("Your account changed. Please reload this page before continuing.");
  }
  return data.user;
}

/* ------------------------------ validation -------------------------------- */

/** Friendly, human validation. Returns the first problem, or null when valid. */
export function validateProfileForm(form: FounderProfile): string | null {
  if (!form.anonName.trim()) {
    return "Your anonymous name is missing. Tap “Generate another name” to get one.";
  }
  if (form.anonName.trim().length < 3) {
    return "Your anonymous name needs at least 3 characters.";
  }
  if (form.skills.length === 0) {
    return "Please add at least one skill so founders can understand your strengths.";
  }
  if (form.industries.length === 0) {
    return "Pick at least one industry you're excited to build in.";
  }
  if (form.traits.length === 0) {
    return "Choose at least one trait you'd like in a co-founder.";
  }
  if (form.lookingFor.length === 0) {
    return "Pick at least one thing you're looking for (co-founder, teammate or advisor).";
  }
  if (form.workingStyle.length === 0) {
    return "Choose at least one working style that describes you.";
  }
  if (!Number.isFinite(form.hoursPerWeek) || form.hoursPerWeek < 5 || form.hoursPerWeek > 60) {
    return "Choose how much time you can commit each week.";
  }
  return null;
}

/* --------------------------- completion score ------------------------------ */

export type CompletionResult = { score: number; nextStep: string | null };

export function profileCompletion(form: FounderProfile, emailVerified = false): CompletionResult {
  const checks: { done: boolean; hint: string }[] = [
    { done: Boolean(form.anonName), hint: "Generate your anonymous founder name." },
    { done: Boolean(form.avatarPath), hint: "Add a profile photo to feel more human." },
    { done: form.skills.length > 0, hint: "Add your skills." },
    { done: form.industries.length > 0, hint: "Pick your industry interests." },
    { done: Boolean(form.experience), hint: "Set your experience level." },
    { done: form.workingStyle.length > 0, hint: "Describe your working style." },
    { done: Boolean(form.commitment), hint: "Set your commitment level." },
    { done: Boolean(form.bio.trim()), hint: "Write a short public bio (no personal details)." },
    { done: form.traits.length > 0, hint: "Add the partner traits you're looking for." },
    { done: form.lookingFor.length > 0, hint: "Say what you're looking for in a partner." },
    { done: Boolean(form.linkedinUrl), hint: "Add LinkedIn to increase trust." },
    {
      done: Boolean(form.githubUrl || form.portfolioUrl || form.websiteUrl),
      hint: "Add GitHub to increase trust — or a portfolio / personal site.",
    },
    { done: emailVerified, hint: "Confirm your email to earn the verified badge." },
  ];
  const done = checks.filter((c) => c.done).length;
  const score = Math.round((done / checks.length) * 100);
  const next = checks.find((c) => !c.done);
  return { score, nextStep: next ? next.hint : null };
}

/* -------------------------------- queries --------------------------------- */

/** Loads the signed-in user's own profile (RLS restricts this to the owner). */
export async function fetchMyProfile(expectedUserId?: string): Promise<ProfileRow | null> {
  const user = await requireCurrentUser(expectedUserId);

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(describe(error));
  return (data as ProfileRow | null) ?? null;
}

export async function upsertMyProfile(form: FounderProfile, expectedUserId?: string) {
  const user = await requireCurrentUser(expectedUserId);
  const problem = validateProfileForm(form);
  if (problem) throw new Error(problem);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(formToRow(form, user.id), { onConflict: "id" })
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

/** Friendly, unique anonymous name for a founder who has no profile yet. */
export async function suggestAnonymousName(): Promise<string> {
  const { data, error } = await supabase.rpc("suggest_anonymous_name");
  if (error) throw new Error("Could not generate a name right now. Please try again.");
  return data as unknown as string;
}

/** Regenerates and persists a new unique anonymous name for the signed-in founder. */
export async function regenerateAnonymousName(): Promise<string> {
  const { data, error } = await supabase.rpc("regenerate_my_anonymous_name");
  if (error) throw new Error("Could not generate a new name. Please try again.");
  return data as unknown as string;
}

/** True when the anonymous name is free (case-insensitive) for the current user. */
export async function isAnonymousNameAvailable(name: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("anonymous_name_available", { p_name: name });
  if (error) throw new Error("Could not check that name right now. Please try again.");
  return Boolean(data);
}

export async function fetchEmailVerified(): Promise<boolean> {
  const { data, error } = await supabase.rpc("my_email_verified");
  if (error) return false;
  return Boolean(data);
}

/* --------------------------------- avatar ---------------------------------- */

export const AVATAR_BUCKET = "avatars";

/** Uploads (or replaces) the signed-in founder's avatar. Returns the storage path. */
export async function uploadAvatar(file: File, expectedUserId?: string): Promise<string> {
  const user = await requireCurrentUser(expectedUserId);
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (PNG, JPG or WebP).");
  }
  if (file.size > 3 * 1024 * 1024) {
    throw new Error("That image is larger than 3 MB. Please choose a smaller one.");
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/avatar-${Date.now()}.${ext || "jpg"}`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error("Your photo could not be uploaded. Please try again.");
  return path;
}

/** Signed URL for a private avatar object. Returns null when there is no avatar. */
export async function avatarSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
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
