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
  lookingFor: string;
  workingStyle: string;
  commitment: string;
  traits: string[];
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

export const MOCK_FOUNDERS: MockFounder[] = [
  {
    id: "a27",
    anonName: "Founder #A27",
    realName: "Amara Osei",
    skills: ["React", "UI/UX", "Product Management"],
    industries: ["AI", "SaaS"],
    hours: 25,
    experience: "Experienced",
    lookingFor: "Co-founder",
    workingStyle: "Structured",
    commitment: "Serious part-time",
    traits: ["Communicative", "Product-minded", "Reliable"],
    blurb: "Design-led product builder who ships weekly and loves early user interviews.",
    instantMatch: true,
  },
  {
    id: "b14",
    anonName: "Founder #B14",
    realName: "Dmitri Vaskov",
    skills: ["Python", "Data", "Operations"],
    industries: ["FinTech", "AI"],
    hours: 35,
    experience: "Intermediate",
    lookingFor: "Co-founder",
    workingStyle: "Fast-paced",
    commitment: "Full-time ready",
    traits: ["Technical", "Fast learner", "Strategic"],
    blurb: "Backend and data engineer moving from consulting into full-time founding.",
  },
  {
    id: "c08",
    anonName: "Founder #C08",
    realName: "Sofia Marin",
    skills: ["Marketing", "Sales", "Business Strategy"],
    industries: ["E-commerce", "Creator Economy"],
    hours: 15,
    experience: "Experienced",
    lookingFor: "Co-founder",
    workingStyle: "Collaborative",
    commitment: "Part-time",
    traits: ["Business-minded", "Communicative", "Creative"],
    blurb: "Growth operator who has taken two consumer brands from zero to first revenue.",
  },
  {
    id: "d31",
    anonName: "Founder #D31",
    realName: "Noah Bergström",
    skills: ["React", "Python", "UI/UX"],
    industries: ["EdTech", "AI"],
    hours: 20,
    experience: "Beginner",
    lookingFor: "Teammate",
    workingStyle: "Flexible",
    commitment: "Exploring",
    traits: ["Fast learner", "Creative", "Reliable"],
    blurb: "Recent CS grad prototyping learning tools and looking for a first serious team.",
  },
  {
    id: "e52",
    anonName: "Founder #E52",
    realName: "Priya Raman",
    skills: ["Finance", "Business Strategy", "Operations"],
    industries: ["HealthTech", "SaaS"],
    hours: 30,
    experience: "Experienced",
    lookingFor: "Co-founder",
    workingStyle: "Structured",
    commitment: "Full-time ready",
    traits: ["Strategic", "Reliable", "Business-minded"],
    blurb: "Ex-healthcare operator focused on workflow tools for small clinics.",
  },
  {
    id: "f19",
    anonName: "Founder #F19",
    realName: "Leo Ferreira",
    skills: ["Data", "Python", "Product Management"],
    industries: ["Sustainability", "AI"],
    hours: 18,
    experience: "Intermediate",
    lookingFor: "Advisor",
    workingStyle: "Independent",
    commitment: "Part-time",
    traits: ["Technical", "Product-minded", "Communicative"],
    blurb: "Climate data specialist exploring measurement tools for small manufacturers.",
  },
];

export function founderById(id: string) {
  return MOCK_FOUNDERS.find((f) => f.id === id);
}

/* ---------------------------------- store --------------------------------- */

const KEY = "foundora.state.v1";
const THEME_KEY = "foundora.theme";

export const emptyDirection: ProjectDirection = {
  title: "",
  problem: "",
  users: "",
  solution: "",
  notes: "",
};

export const emptyMatchState: MatchState = {
  messages: [],
  revealMe: false,
  revealThem: false,
  compatibility: false,
  direction: emptyDirection,
  proposal: false,
  acceptMe: false,
  acceptThem: false,
};

const initialState: FoundoraState = {
  interested: [],
  passed: [],
  matches: [],
  matchState: {},
};

let state: FoundoraState = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

function load(): FoundoraState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    return { ...initialState, ...(JSON.parse(raw) as FoundoraState) };
  } catch {
    return initialState;
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function setState(updater: (s: FoundoraState) => FoundoraState) {
  if (!hydrated && typeof window !== "undefined") {
    state = load();
    hydrated = true;
  }
  state = updater(state);
  persist();
  emit();
}

export function clearFoundoraUserState() {
  state = initialState;
  hydrated = true;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(KEY);
  }
  emit();
}

export function useFoundora() {
  const [snapshot, setSnapshot] = useState<FoundoraState>(state);

  useEffect(() => {
    if (!hydrated) {
      state = load();
      hydrated = true;
    }
    setSnapshot(state);
    const l = () => setSnapshot({ ...state });
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const actions = {
    pass: (id: string) =>
      setState((s) => ({ ...s, passed: [...new Set([...s.passed, id])] })),
    interested: (id: string) =>
      setState((s) => {
        const founder = founderById(id);
        const matches = founder?.instantMatch
          ? [...new Set([...s.matches, id])]
          : s.matches;
        return { ...s, interested: [...new Set([...s.interested, id])], matches };
      }),
    updateMatch: (id: string, patch: Partial<MatchState>) =>
      setState((s) => ({
        ...s,
        matchState: {
          ...s.matchState,
          [id]: { ...emptyMatchState, ...(s.matchState[id] ?? {}), ...patch },
        },
      })),
    reset: () => setState(() => initialState),
  };

  const getMatch = useCallback(
    (id: string): MatchState => ({ ...emptyMatchState, ...(snapshot.matchState[id] ?? {}) }),
    [snapshot],
  );

  return { state: snapshot, hydrated, getMatch, ...actions };
}

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
