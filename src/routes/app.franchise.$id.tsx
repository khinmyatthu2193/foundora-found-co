import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PremiumGate } from "@/components/foundora/premium-gate";
import { EmptyState, Section } from "@/components/foundora/ui-bits";
import {
  applicationSchema,
  fetchFranchise,
  formatInvestmentRange,
  franchiseQueryKey,
  myApplicationsQueryKey,
  submitApplication,
  type ApplicationInput,
} from "@/lib/franchise";
import { fetchMyPlan, planQueryKey } from "@/lib/premium";

export const Route = createFileRoute("/app/franchise/$id")({
  head: () => ({
    meta: [
      { title: "Franchise details — Foundora" },
      {
        name: "description",
        content:
          "Franchise investment range, available locations, support provided and how to request contact with the company.",
      },
      { property: "og:title", content: "Franchise details — Foundora" },
      {
        property: "og:description",
        content: "Review a franchise opportunity and request contact with the company.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FranchiseDetailPage,
});

const EMPTY: ApplicationInput = {
  full_name: "",
  phone: "",
  email: "",
  location: "",
  budget: "",
  preferred_location: "",
  experience: "",
  message: "",
};

function FranchiseDetailPage() {
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ApplicationInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState(false);
  const [applying, setApplying] = useState(false);

  const plan = useQuery({
    queryKey: planQueryKey(user.id),
    queryFn: () => fetchMyPlan(user.id),
  });
  const premium = plan.data === "premium";

  const franchise = useQuery({
    queryKey: franchiseQueryKey(user.id, id),
    queryFn: () => fetchFranchise(id),
    enabled: premium,
  });

  const submit = useMutation({
    mutationFn: () => submitApplication(id, form),
    onSuccess: () => {
      setConfirming(false);
      setSent(true);
      setApplying(false);
      setForm(EMPTY);
      toast.success("Your franchise request has been sent successfully.", {
        description: "The company will review your information and contact you soon.",
      });
      void queryClient.invalidateQueries({ queryKey: myApplicationsQueryKey(user.id) });
    },
    onError: (e) => {
      setConfirming(false);
      toast.error(e instanceof Error ? e.message : "Could not send your request.");
    },
  });

  const set = (key: keyof ApplicationInput) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openConfirm = () => {
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error("Please check the highlighted fields.");
      return;
    }
    setErrors({});
    setConfirming(true);
  };

  const back = (
    <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
      <Link to="/app/franchise">
        <ArrowLeft className="size-4" /> Back to marketplace
      </Link>
    </Button>
  );

  if (plan.isLoading) {
    return (
      <Section className="pt-8">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </Section>
    );
  }

  if (!premium) {
    return (
      <Section className="pt-8">
        {back}
        <PremiumGate />
      </Section>
    );
  }

  if (franchise.isLoading) {
    return (
      <Section className="pt-8">
        {back}
        <p className="text-sm text-muted-foreground">Loading franchise…</p>
      </Section>
    );
  }

  const f = franchise.data;
  if (!f) {
    return (
      <Section className="pt-8">
        {back}
        <EmptyState
          icon={<Building2 className="size-6" />}
          title="Franchise not found"
          description="This listing may have been removed."
        />
      </Section>
    );
  }

  return (
    <Section className="pt-8">
      {back}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="border-border shadow-soft">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-primary/10">
                  {f.logo_url ? (
                    <img
                      src={f.logo_url}
                      alt={`${f.company_name} logo`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Building2 className="size-7 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold">{f.company_name}</h1>
                  <p className="text-sm text-muted-foreground">{f.category}</p>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  About the franchise
                </h2>
                <p className="mt-2 text-sm leading-relaxed">{f.description}</p>
              </div>

              <div>
                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  Support provided
                </h2>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {f.support_details.length ? (
                    f.support_details.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                        {s}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">—</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-soft">
            <CardContent className="space-y-4 p-6">
              <div>
                <h2 className="text-lg font-semibold">Interested in this franchise?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Send your details and the company will contact you directly.
                </p>
              </div>

              {sent ? (
                <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Your request has been sent successfully.</p>
                    <p className="text-sm text-muted-foreground">
                      The franchise company will review your information and contact you soon.
                    </p>
                  </div>
                </div>
              ) : !applying ? (
                <Button onClick={() => setApplying(true)}>Apply for Franchise</Button>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="full_name"
                    label="Full name"
                    value={form.full_name}
                    onChange={set("full_name")}
                    error={errors["full_name"]}
                  />
                  <Field
                    id="phone"
                    label="Phone number"
                    value={form.phone}
                    onChange={set("phone")}
                    error={errors["phone"]}
                  />
                  <Field
                    id="email"
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    error={errors["email"]}
                  />
                  <Field
                    id="location"
                    label="Current location"
                    value={form.location}
                    onChange={set("location")}
                    error={errors["location"]}
                  />
                  <Field
                    id="budget"
                    label="Preferred investment budget"
                    value={form.budget}
                    onChange={set("budget")}
                    error={errors["budget"]}
                    placeholder="e.g. 15,000,000 MMK"
                  />
                  <Field
                    id="preferred_location"
                    label="Preferred business location"
                    value={form.preferred_location}
                    onChange={set("preferred_location")}
                    error={errors["preferred_location"]}
                  />

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="experience">Experience / background</Label>
                    <Textarea
                      id="experience"
                      rows={3}
                      maxLength={1000}
                      value={form.experience}
                      onChange={(e) => set("experience")(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="message">Additional message</Label>
                    <Textarea
                      id="message"
                      rows={3}
                      maxLength={1000}
                      value={form.message}
                      onChange={(e) => set("message")(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <Button onClick={openConfirm} disabled={submit.isPending}>
                      {submit.isPending && <Loader2 className="size-4 animate-spin" />}
                      Send contact request
                    </Button>
                    <Button variant="ghost" onClick={() => setApplying(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit border-border shadow-soft">
          <CardContent className="space-y-4 p-6 text-sm">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Key details
            </h2>
            <div>
              <p className="text-muted-foreground">Investment range</p>
              <p className="font-medium">
                {formatInvestmentRange(f.investment_min_mmk, f.investment_max_mmk)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Available locations</p>
              <p className="flex items-center gap-1.5 font-medium">
                <MapPin className="size-3.5" />
                {f.available_locations.join(" / ") || "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Business category</p>
              <p className="font-medium">{f.category || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Contact</p>
              <p className="font-medium">{f.contact_information || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to request contact from this franchise company?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your name, phone number and email will be shared with {f.company_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                submit.mutate();
              }}
            >
              Confirm request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  type?: string | undefined;
  placeholder?: string | undefined;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
