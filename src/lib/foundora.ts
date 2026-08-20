import { useCallback, useEffect, useState } from "react";

/* ---------------------------------- types --------------------------------- */

export type ThemeName = "sky" | "lavender" | "neutral";

export type FounderProfile = {
  anonName: string;
  realName: string;
  skills: string[];
  buildIdea: string;
  industries: string[];
  hoursPerWeek: number;
  experience: string;
  lookingFor: string[];
  workingStyle: string[];
  commitment: string;
  traits: string[];
  avatarPath: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  websiteUrl: string;
};

export type MockFounder = {
  id: string;
  anonName: string;
  realName: string;
  skills: string[];
  industries: string[];
  hours: number;
  experience: string;
  lookingFor: string;
  workingStyle: string;
  commitment: string;
  traits: string[];
  blurb: string;
  instantMatch?: boolean;
};

export type ChatMessage = { id: string; from: "me" | "them"; text: string; at: number };

export type ProjectDirection = {
  title: string;
  problem: string;
  users: string;
  solution: string;
  notes: string;
};

export type MatchState = {
  messages: ChatMessage[];
  revealMe: boolean;
  revealThem: boolean;
  compatibility: boolean;
  direction: ProjectDirection;
  proposal: boolean;
  acceptMe: boolean;
  acceptThem: boolean;
};

export type FoundoraState = {
  interested: string[];
  passed: string[];
  matches: string[];
  matchState: Record<string, MatchState>;
};

/* --------------------------------- options -------------------------------- */

export const SKILL_OPTIONS = [
  "React",
  "Python",
  "UI/UX",
  "Product Management",
  "Marketing",
  "Sales",
  "Finance",
  "Business Strategy",
  "Data",
  "Operations",
];

export const INDUSTRY_OPTIONS = [
  "AI",
  "FinTech",
  "EdTech",
  "HealthTech",
  "SaaS",
  "E-commerce",
  "Sustainability",
  "Gaming",
  "Creator Economy",
];

export const AVAILABILITY_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: "5 hrs/week" },
  { value: 10, label: "10 hrs/week" },
  { value: 20, label: "20 hrs/week" },
  { value: 30, label: "30 hrs/week" },
  { value: 40, label: "Full-time" },
];

/** Human label for a stored weekly-hours value. */
export function formatAvailability(hours: number | null | undefined): string {
  if (!hours && hours !== 0) return "—";
  if (hours >= 40) return "Full-time";
  return `${hours} hrs/week`;
}

/** Multi-value profile text columns are stored comma separated. */
export function splitValues(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function joinValues(values: string[]): string | null {
  const cleaned = values.map((v) => v.trim()).filter(Boolean);
  return cleaned.length ? cleaned.join(", ") : null;
}

export const EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Experienced"];
export const LOOKING_FOR_OPTIONS = ["Co-founder", "Teammate", "Advisor"];
export const WORKING_STYLE_OPTIONS = [
  "Structured",
  "Flexible",
  "Fast-paced",
  "Collaborative",
  "Independent",
];
export const COMMITMENT_OPTIONS = [
  "Exploring",
  "Part-time",
  "Serious part-time",
  "Full-time ready",
];
export const TRAIT_OPTIONS = [
  "Communicative",
  "Technical",
  "Business-minded",
  "Creative",
  "Reliable",
  "Strategic",
  "Fast learner",
  "Product-minded",
];

export const GUIDED_PROMPTS = [
  "How many hours can each of you consistently commit?",
  "Who should lead product?",
  "Who should lead growth?",
  "How will you resolve disagreements?",
  "What does success in the first 30 days look like?",
  "How would you split equity and responsibilities early on?",
];

/* --------------------------- legacy local cleanup -------------------------- */

const LEGACY_KEYS = ["foundora.state.v1"];

/** Clears any locally cached per-user data. Supabase is the only source of truth. */
export function clearFoundoraUserState() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

const THEME_KEY = "foundora.theme";

/* ---------------------------------- theme --------------------------------- */

export const THEMES: { id: ThemeName; label: string; swatch: string[] }[] = [
  { id: "sky", label: "Sky", swatch: ["#5BA7F7", "#EAF4FF", "#16324F"] },
  { id: "lavender", label: "Lavender", swatch: ["#8B7BE8", "#F1EEFC", "#332B57"] },
  { id: "neutral", label: "Neutral", swatch: ["#5A6779", "#EFF1F4", "#2A3140"] },
];

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>("sky");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY) as ThemeName | null;
    const next = stored && THEMES.some((t) => t.id === stored) ? stored : "sky";
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return { theme, setTheme };
}

/* ------------------------------ appearance -------------------------------- */

export type Appearance = "light" | "dark";
const APPEARANCE_KEY = "foundora.appearance";

export function useAppearance() {
  const [appearance, setAppearanceState] = useState<Appearance>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(APPEARANCE_KEY) as Appearance | null;
    const next: Appearance = stored === "dark" ? "dark" : "light";
    setAppearanceState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  const setAppearance = useCallback((next: Appearance) => {
    setAppearanceState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem(APPEARANCE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleAppearance = useCallback(() => {
    setAppearance(document.documentElement.classList.contains("dark") ? "light" : "dark");
  }, [setAppearance]);

  return { appearance, setAppearance, toggleAppearance };
}
