import { Briefcase } from "lucide-react";

export const INDUSTRIES = ["AI", "FinTech", "Sustainability", "HealthTech", "EdTech", "Creator Economy"] as const;

export type Opportunity = {
  id: string;
  title: string;
  industry: string;
  investmentRange: string;
  location: string;
  shortDescription: string;
  fullDescription: string;
  stage: string;
  teamSize: string;
  postedAt: string;
  founderAlias: string;
  skillsNeeded: string[];
  equityOffered?: string;
  traction?: string;
};

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-1",
    title: "AI-Powered Personal Finance Coach",
    industry: "FinTech",
    investmentRange: "$50K – $150K",
    location: "Remote / US",
    shortDescription:
      "A privacy-first AI assistant that helps Gen Z build savings habits through conversational guidance.",
    fullDescription:
      "We are building a mobile-first AI coach that turns noisy bank data into simple, actionable savings goals. The product is pre-launch with a waitlist of 1,200 users. We are looking for a technical co-founder who can lead AI/ML architecture and mobile development. The ideal partner is comfortable with LLM orchestration, security-first design, and rapid prototyping.",
    stage: "Pre-launch / Waitlist",
    teamSize: "1 founder",
    postedAt: "2026-08-18",
    founderAlias: "Nova",
    skillsNeeded: ["Python", "AI/ML", "Mobile", "Product Management"],
    equityOffered: "20 – 40%",
    traction: "1,200 waitlist signups",
  },
  {
    id: "opp-2",
    title: "Sustainable Fashion Marketplace",
    industry: "Sustainability",
    investmentRange: "$25K – $75K",
    location: "Berlin / Remote",
    shortDescription:
      "A curated marketplace connecting independent sustainable brands with conscious consumers.",
    fullDescription:
      "Our platform helps small sustainable fashion brands reach buyers who care about transparency. We have 8 pilot brands and our first 100 transactions. We need a growth-oriented co-founder to lead marketing, brand partnerships, and community. Experience in e-commerce, influencer partnerships, or sustainability is a big plus.",
    stage: "Early traction",
    teamSize: "2 founders",
    postedAt: "2026-08-17",
    founderAlias: "PixelFox",
    skillsNeeded: ["Marketing", "Sales", "Operations", "UI/UX"],
    equityOffered: "15 – 30%",
    traction: "8 pilot brands, 100+ transactions",
  },
  {
    id: "opp-3",
    title: "Remote Team Wellness Platform",
    industry: "HealthTech",
    investmentRange: "$100K – $250K",
    location: "Remote / Global",
    shortDescription:
      "Bite-sized wellness sessions and analytics for distributed engineering teams.",
    fullDescription:
      "Remote engineering teams burn out silently. We are building a wellness platform that integrates into Slack and offers 5-minute sessions focused on movement, focus, and sleep. We have a working prototype and 3 design partners. We are looking for a technical co-founder to own the backend and integrations, and eventually lead engineering hiring.",
    stage: "Prototype / Design partners",
    teamSize: "1 founder",
    postedAt: "2026-08-15",
    founderAlias: "Echo",
    skillsNeeded: ["React", "Node.js", "Data", "Business Strategy"],
    equityOffered: "25 – 45%",
    traction: "3 active design partners",
  },
  {
    id: "opp-4",
    title: "EdTech Coding Bootcamp for Refugees",
    industry: "EdTech",
    investmentRange: "Grant-funded / Angel",
    location: "Remote / Europe",
    shortDescription:
      "An accessible, mentorship-driven bootcamp that prepares refugees for junior developer roles.",
    fullDescription:
      "We partner with NGOs and tech companies to deliver a free, remote coding bootcamp with 1:1 mentorship and job placement support. We have a curriculum, volunteer mentors, and a pilot cohort of 15 learners. We need a mission-driven co-founder to lead operations, partnerships, and fundraising.",
    stage: "Pilot cohort",
    teamSize: "2 founders",
    postedAt: "2026-08-14",
    founderAlias: "Sage",
    skillsNeeded: ["Operations", "Business Strategy", "Marketing", "Finance"],
    equityOffered: "Open to discussion",
    traction: "15 learners in pilot cohort",
  },
  {
    id: "opp-5",
    title: "Creator Economy Analytics Tool",
    industry: "Creator Economy",
    investmentRange: "$75K – $200K",
    location: "Remote / US",
    shortDescription:
      "A unified dashboard for creators to track earnings, audience health, and brand deals.",
    fullDescription:
      "Creators juggle 5+ platforms to understand their business. We are building a single dashboard that aggregates revenue, audience growth, and deal pipelines. We have an MVP with 50 beta users. We are looking for a full-stack or front-end leaning co-founder to own the product experience and ship fast.",
    stage: "MVP / Beta",
    teamSize: "1 founder",
    postedAt: "2026-08-12",
    founderAlias: "Wren",
    skillsNeeded: ["React", "Data", "UI/UX", "Product Management"],
    equityOffered: "20 – 35%",
    traction: "50 beta users",
  },
];

export function fetchOpportunities(): Promise<Opportunity[]> {
  return Promise.resolve(MOCK_OPPORTUNITIES);
}

export function fetchOpportunityById(id: string): Promise<Opportunity | null> {
  const match = MOCK_OPPORTUNITIES.find((o) => o.id === id);
  return Promise.resolve(match ?? null);
}
