/**
 * Deterministic co-founder compatibility scoring.
 *
 * The AI never decides the score — it only explains the result. Weights:
 *  - Skills similarity ............ 25%
 *  - Industry alignment ........... 20%
 *  - Working style compatibility .. 15%
 *  - Commitment compatibility ..... 15%
 *  - Availability compatibility ... 10%
 *  - Experience complement ........ 10%
 *  - Partner trait alignment ...... 5%
 */

export type FounderScoreInput = {
  skills: string[] | null;
  industries: string[] | null;
  experience: string | null;
  hours: number | null;
  workingStyle: string | null;
  commitment: string | null;
  traits: string[] | null;
};

export type CompatibilityBreakdown = {
  label: string;
  weight: number;
  /** 0-100 sub-score for this dimension. */
  value: number;
};

export type CompatibilityScore = {
  score: number;
  breakdown: CompatibilityBreakdown[];
};

const norm = (v: string) => v.trim().toLowerCase();

/** Multi-select fields are stored comma-joined; split them back into tokens. */
function tokens(value: string | string[] | null | undefined): string[] {
  const list = Array.isArray(value) ? value : value ? value.split(",") : [];
  return Array.from(new Set(list.map(norm).filter(Boolean)));
}

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const overlap = a.filter((x) => setB.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : overlap / union;
}

/** Overlap relative to the smaller set — rewards shared ground without punishing breadth. */
function overlapRatio(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const overlap = a.filter((x) => setB.has(x)).length;
  return overlap / Math.min(a.length, b.length);
}

const EXPERIENCE_RANK: Record<string, number> = {
  "first-time founder": 0,
  "first time founder": 0,
  beginner: 0,
  student: 0,
  "some experience": 1,
  intermediate: 1,
  "1-3 years": 1,
  experienced: 2,
  senior: 2,
  "3-5 years": 2,
  "serial founder": 3,
  expert: 3,
  "5+ years": 3,
};

function experienceRank(value: string | null): number | null {
  if (!value) return null;
  const key = norm(value);
  if (key in EXPERIENCE_RANK) return EXPERIENCE_RANK[key]!;
  const match = Object.keys(EXPERIENCE_RANK).find((k) => key.includes(k));
  return match ? EXPERIENCE_RANK[match]! : null;
}

const COMMITMENT_RANK: Record<string, number> = {
  exploring: 0,
  curious: 0,
  "side project": 1,
  "part-time": 1,
  "part time": 1,
  serious: 2,
  "full-time soon": 2,
  "full-time": 3,
  "full time": 3,
  "all in": 3,
};

function commitmentRank(value: string): number | null {
  const key = norm(value);
  if (key in COMMITMENT_RANK) return COMMITMENT_RANK[key]!;
  const match = Object.keys(COMMITMENT_RANK).find((k) => key.includes(k));
  return match ? COMMITMENT_RANK[match]! : null;
}

/**
 * Skills: co-founders want *complementary* skills with a little shared ground.
 * Perfect score sits around 30-40% overlap; identical or disjoint skill sets score lower.
 */
function skillsScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 40;
  const j = jaccard(a, b);
  const ideal = 0.35;
  const distance = Math.abs(j - ideal) / Math.max(ideal, 1 - ideal);
  return Math.round(Math.max(0, 1 - distance) * 100);
}

function industryScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 40;
  return Math.round(overlapRatio(a, b) * 100);
}

function multiSelectScore(a: string[], b: string[], neutral = 50): number {
  if (a.length === 0 || b.length === 0) return neutral;
  return Math.round(overlapRatio(a, b) * 100);
}

function commitmentScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 50;
  const ra = a.map(commitmentRank).filter((x): x is number => x !== null);
  const rb = b.map(commitmentRank).filter((x): x is number => x !== null);
  if (ra.length === 0 || rb.length === 0) return multiSelectScore(a, b);
  const gap = Math.abs(Math.max(...ra) - Math.max(...rb));
  return [100, 75, 45, 20][Math.min(gap, 3)]!;
}

function availabilityScore(a: number | null, b: number | null): number {
  if (!a || !b) return 50;
  const gap = Math.abs(a - b);
  const larger = Math.max(a, b);
  const ratio = larger === 0 ? 1 : 1 - gap / larger;
  // Both being high-availability is a bonus.
  const bonus = Math.min(a, b) >= 30 ? 8 : 0;
  return Math.round(Math.max(0, Math.min(100, ratio * 100 + bonus)));
}

/** Experience: a modest gap is complementary (mentor/builder); a huge gap is friction. */
function experienceScore(a: string | null, b: string | null): number {
  const ra = experienceRank(a);
  const rb = experienceRank(b);
  if (ra === null || rb === null) return 50;
  const gap = Math.abs(ra - rb);
  return [80, 100, 70, 45][Math.min(gap, 3)]!;
}

export function computeCompatibility(
  a: FounderScoreInput,
  b: FounderScoreInput,
): CompatibilityScore {
  const breakdown: CompatibilityBreakdown[] = [
    {
      label: "Skills similarity",
      weight: 25,
      value: skillsScore(tokens(a.skills), tokens(b.skills)),
    },
    {
      label: "Industry alignment",
      weight: 20,
      value: industryScore(tokens(a.industries), tokens(b.industries)),
    },
    {
      label: "Working style compatibility",
      weight: 15,
      value: multiSelectScore(tokens(a.workingStyle), tokens(b.workingStyle)),
    },
    {
      label: "Commitment compatibility",
      weight: 15,
      value: commitmentScore(tokens(a.commitment), tokens(b.commitment)),
    },
    {
      label: "Availability compatibility",
      weight: 10,
      value: availabilityScore(a.hours, b.hours),
    },
    {
      label: "Experience complement",
      weight: 10,
      value: experienceScore(a.experience, b.experience),
    },
    {
      label: "Partner trait alignment",
      weight: 5,
      value: multiSelectScore(tokens(a.traits), tokens(b.traits)),
    },
  ];

  const weighted = breakdown.reduce((sum, d) => sum + d.value * d.weight, 0) / 100;
  return { score: Math.max(0, Math.min(100, Math.round(weighted))), breakdown };
}

export function scoreBand(score: number): "Highly compatible" | "Moderate" | "Low" {
  if (score >= 85) return "Highly compatible";
  if (score >= 65) return "Moderate";
  return "Low";
}
