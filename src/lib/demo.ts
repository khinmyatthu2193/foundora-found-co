/**
 * Prototype demo fallback data.
 *
 * This never touches Supabase. Demo founders exist only inside the /demo route
 * so real accounts and real data are never mixed with demo content.
 */

export type DemoFounder = {
  id: string;
  anonymous_name: string;
  bio: string;
  skills: string[];
  industry_interests: string[];
  experience_level: string;
  looking_for: string;
  working_style: string;
  commitment_level: string;
  available_hours: number;
};

export const DEMO_FOUNDERS: DemoFounder[] = [
  {
    id: "demo-1",
    anonymous_name: "Nova Carter",
    bio: "Design-led product builder who ships weekly and loves early user interviews.",
    skills: ["React", "UI/UX", "Product Design"],
    industry_interests: ["AI", "SaaS"],
    experience_level: "Experienced",
    looking_for: "Co-founder",
    working_style: "Collaborative",
    commitment_level: "Full-time ready",
    available_hours: 40,
  },
  {
    id: "demo-2",
    anonymous_name: "Leo Morgan",
    bio: "Data and ML engineer turning messy datasets into products people trust.",
    skills: ["Python", "Machine Learning", "Data Analysis"],
    industry_interests: ["AI", "FinTech"],
    experience_level: "Intermediate",
    looking_for: "Technical Partner",
    working_style: "Structured",
    commitment_level: "Part-time",
    available_hours: 20,
  },
  {
    id: "demo-3",
    anonymous_name: "Mia Anderson",
    bio: "Go-to-market operator focused on brand, positioning and first 1,000 customers.",
    skills: ["Marketing", "Brand Strategy", "Business Development"],
    industry_interests: ["E-commerce", "Creator Economy"],
    experience_level: "Experienced",
    looking_for: "Business Partner",
    working_style: "Flexible",
    commitment_level: "Serious part-time",
    available_hours: 25,
  },
];

export type DemoMessage = { id: string; from: "me" | "them"; text: string; time: string };

export const DEMO_CONVERSATION: Record<string, DemoMessage[]> = {
  "demo-1": [
    { id: "m1", from: "them", text: "Hi! Your profile mentions AI tooling — what are you exploring?", time: "10:24 AM" },
    { id: "m2", from: "me", text: "Mostly workflow copilots for small teams. You?", time: "10:26 AM" },
    { id: "m3", from: "them", text: "Same space. I can own design and front-end end-to-end.", time: "10:31 AM" },
  ],
  "demo-2": [
    { id: "m1", from: "them", text: "Happy to match. I build the models, you handle product?", time: "09:02 AM" },
    { id: "m2", from: "me", text: "That split works. Let's scope a 30-day MVP.", time: "09:10 AM" },
  ],
  "demo-3": [
    { id: "m1", from: "me", text: "Loved your GTM notes. Which channel do you start with?", time: "04:41 PM" },
    { id: "m2", from: "them", text: "Founder-led content first, then partnerships.", time: "04:45 PM" },
  ],
};
