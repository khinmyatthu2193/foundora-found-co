import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export type Franchise = {
  id: string;
  company_name: string;
  logo_url: string | null;
  category: string;
  description: string;
  investment_min_mmk: number;
  investment_max_mmk: number;
  available_locations: string[];
  support_details: string[];
  contact_information: string;
};

export const franchiseListQueryKey = (userId: string) => ["franchises", userId] as const;
export const franchiseQueryKey = (userId: string, id: string) => ["franchise", userId, id] as const;
export const myApplicationsQueryKey = (userId: string) =>
  ["franchise-applications", userId] as const;

const SELECT =
  "id, company_name, logo_url, category, description, investment_min_mmk, investment_max_mmk, available_locations, support_details, contact_information";

/** Premium-only read; RLS returns nothing for free accounts. */
export async function fetchFranchises(): Promise<Franchise[]> {
  const { data, error } = await supabase
    .from("franchises")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load franchise listings. Please try again.");
  return (data ?? []) as Franchise[];
}

export async function fetchFranchise(id: string): Promise<Franchise | null> {
  const { data, error } = await supabase.from("franchises").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error("Could not load this franchise. Please try again.");
  return (data as Franchise | null) ?? null;
}

/** MMK amounts are large; show them grouped and suffixed. */
export function formatMmk(amount: number): string {
  return `${new Intl.NumberFormat("en-US").format(amount)} MMK`;
}

export function formatInvestmentRange(min: number, max: number): string {
  if (!max || max === min) return formatMmk(min);
  return `${formatMmk(min)} – ${formatMmk(max)}`;
}

export const applicationSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: z
    .string()
    .trim()
    .min(6, "Please enter a valid phone number.")
    .max(30, "Phone number is too long."),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  location: z.string().trim().min(2, "Please enter your current location.").max(120),
  budget: z.string().trim().min(1, "Please enter your preferred budget.").max(120),
  preferred_location: z.string().trim().min(2, "Please enter a preferred business location.").max(120),
  experience: z.string().trim().max(1000).default(""),
  message: z.string().trim().max(1000).default(""),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export type FranchiseApplication = {
  id: string;
  franchise_id: string;
  status: string;
  created_at: string;
};

export async function fetchMyApplications(): Promise<FranchiseApplication[]> {
  const { data, error } = await supabase
    .from("franchise_applications")
    .select("id, franchise_id, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load your requests. Please try again.");
  return data ?? [];
}

export async function submitApplication(
  franchiseId: string,
  input: ApplicationInput,
): Promise<FranchiseApplication> {
  const parsed = applicationSchema.parse(input);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Your session expired. Please log in again.");

  const { data, error } = await supabase
    .from("franchise_applications")
    .insert({ ...parsed, franchise_id: franchiseId, user_id: auth.user.id })
    .select("id, franchise_id, status, created_at")
    .single();

  if (error) {
    if (error.code === "42501") {
      throw new Error("Founder Pro is required to send a contact request.");
    }
    throw new Error("Could not send your request. Please try again.");
  }
  return data;
}
