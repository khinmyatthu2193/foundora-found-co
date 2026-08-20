import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, RefreshCw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProfile, rowToForm, upsertMyProfile } from "@/lib/profile";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { PrivacyBadge, PrivateField, Section, Tag } from "@/components/foundora/ui-bits";
import {
  COMMITMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  INDUSTRY_OPTIONS,
  LOOKING_FOR_OPTIONS,
  SKILL_OPTIONS,
  TRAIT_OPTIONS,
  WORKING_STYLE_OPTIONS,
  useFoundora,
  type FounderProfile,
} from "@/lib/foundora";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Founder profile — Foundora" },
      {
        name: "description",
        content:
          "Create and edit your Foundora founder profile: skills, industries, commitment and working style.",
      },
      { property: "og:title", content: "Founder profile — Foundora" },
      {
        property: "og:description",
        content: "Your real name and idea stay private until you choose to share them.",
      },
    ],
  }),
  component: ProfilePage,
});

function randomName() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return `Founder #${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(
    10 + Math.random() * 89,
  )}`;
}

const emptyProfile: FounderProfile = {
  anonName: "Founder #A27",
  realName: "",
  skills: [],
  buildIdea: "",
  industries: [],
  hoursPerWeek: 20,
  experience: "Intermediate",
  lookingFor: "Co-founder",
  workingStyle: "Collaborative",
  commitment: "Part-time",
  traits: [],
};

function Chips({
  options,
  value,
  onChange,
  multi = true,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  multi?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() =>
              multi
                ? onChange(active ? value.filter((v) => v !== o) : [...value, o])
                : onChange([o])
            }
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function ProfilePage() {
  const queryClient = useQueryClient();
  const {
    data: profile,
    isLoading,
    error: loadError,
    refetch,
  } = useQuery({ queryKey: ["my-profile"], queryFn: fetchMyProfile });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FounderProfile>(emptyProfile);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm(rowToForm(profile));
      setEditing(false);
    } else if (profile === null) {
      setEditing(true);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (next: FounderProfile) => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Your session expired. Please log in again.");
      await upsertMyProfile(next, data.user.id);
    },
    onSuccess: async () => {
      setSaveError(null);
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setEditing(false);
      toast.success("Profile saved", { description: "Your founder profile is up to date." });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Could not save your profile.";
      setSaveError(message);
      toast.error("Save failed", { description: message });
    },
  });

  const set = <K extends keyof FounderProfile>(k: K, v: FounderProfile[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.anonName.trim()) {
      setSaveError("Add an anonymous founder name before saving.");
      return;
    }
    saveMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <Section className="pt-8" title="Founder profile" description="Loading your profile…">
        <Card className="border-border shadow-soft">
          <CardContent className="space-y-3 p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </Section>
    );
  }

  if (loadError) {
    return (
      <Section className="pt-8" title="Founder profile" description="We couldn't load your profile.">
        <Card className="border-border shadow-soft">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-destructive">
              {loadError instanceof Error ? loadError.message : "Something went wrong."}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </Section>
    );
  }

  if (!editing && profile) {
    const p = rowToForm(profile);

    return (
      <Section className="pt-8" title="Your founder profile" description="This is how you appear to other founders — anonymously.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border shadow-soft lg:col-span-2">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">{p.anonName}</h3>
                <PrivacyBadge />
              </div>

              <Field label="Skills">
                <div className="flex flex-wrap gap-2">
                  {p.skills.length ? (
                    p.skills.map((s) => (
                      <Tag key={s} tone="primary">
                        {s}
                      </Tag>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">None added yet</span>
                  )}
                </div>
              </Field>

              <Field label="Industry interests">
                <div className="flex flex-wrap gap-2">
                  {p.industries.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Available hours">
                  <p className="text-sm">{p.hoursPerWeek} hrs / week</p>
                </Field>
                <Field label="Experience">
                  <p className="text-sm">{p.experience}</p>
                </Field>
                <Field label="Looking for">
                  <p className="text-sm">{p.lookingFor}</p>
                </Field>
                <Field label="Working style">
                  <p className="text-sm">{p.workingStyle}</p>
                </Field>
                <Field label="Commitment">
                  <p className="text-sm">{p.commitment}</p>
                </Field>
              </div>

              <Field label="Desired partner traits">
                <div className="flex flex-wrap gap-2">
                  {p.traits.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </Field>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={() => setEditing(true)} variant="outline">
                  <Pencil className="size-4" /> Edit profile
                </Button>
                <Button asChild>
                  <Link to="/app/discover">Discover founders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-soft">
            <CardContent className="space-y-5 p-6">
              <h3 className="font-semibold">Private information</h3>
              <div>
                <PrivateField>Private</PrivateField>
                <p className="mt-2 text-sm font-medium">{p.realName || "Not provided"}</p>
                <p className="text-xs text-muted-foreground">
                  Kept private until both founders agree to reveal identities.
                </p>
              </div>
              <div>
                <PrivateField>Private</PrivateField>
                <p className="mt-2 text-sm whitespace-pre-wrap">
                  {p.buildIdea || "No idea shared yet."}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Your startup idea stays private.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    );
  }

  return (
    <Section
      className="pt-8"
      title={state.profile ? "Edit founder profile" : "Create your founder profile"}
      description="Everything marked private stays hidden until you choose to reveal it."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border shadow-soft lg:col-span-2">
          <CardContent className="space-y-7 p-6">
            <div className="space-y-2">
              <Label htmlFor="anon">Anonymous founder name</Label>
              <div className="flex gap-2">
                <Input
                  id="anon"
                  value={form.anonName}
                  onChange={(e) => set("anonName", e.target.value)}
                  placeholder="Founder #A27"
                />
                <Button type="button" variant="outline" onClick={() => set("anonName", randomName())}>
                  <RefreshCw className="size-4" /> Generate name
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="real">Real name</Label>
                <PrivateField>Private</PrivateField>
              </div>
              <Input
                id="real"
                value={form.realName}
                onChange={(e) => set("realName", e.target.value)}
                placeholder="Your legal or preferred name"
              />
              <p className="text-xs text-muted-foreground">
                Kept private until both founders agree to reveal identities.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Skills / what you can do</Label>
              <Chips options={SKILL_OPTIONS} value={form.skills} onChange={(v) => set("skills", v)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="idea">What you want to build</Label>
                <PrivateField>Private</PrivateField>
              </div>
              <Textarea
                id="idea"
                rows={4}
                value={form.buildIdea}
                onChange={(e) => set("buildIdea", e.target.value)}
                placeholder="A short description of the direction you're exploring."
              />
              <p className="text-xs text-muted-foreground">Your startup idea stays private.</p>
            </div>

            <div className="space-y-2">
              <Label>Industry interests</Label>
              <Chips
                options={INDUSTRY_OPTIONS}
                value={form.industries}
                onChange={(v) => set("industries", v)}
              />
            </div>

            <div className="space-y-3">
              <Label>Available hours per week: {form.hoursPerWeek}</Label>
              <Slider
                value={[form.hoursPerWeek]}
                min={5}
                max={60}
                step={5}
                onValueChange={(v) => set("hoursPerWeek", v[0] ?? 20)}
              />
            </div>

            <div className="space-y-2">
              <Label>Experience level</Label>
              <Chips
                multi={false}
                options={EXPERIENCE_OPTIONS}
                value={[form.experience]}
                onChange={(v) => set("experience", v[0] ?? "Intermediate")}
              />
            </div>

            <div className="space-y-2">
              <Label>Looking for</Label>
              <Chips
                multi={false}
                options={LOOKING_FOR_OPTIONS}
                value={[form.lookingFor]}
                onChange={(v) => set("lookingFor", v[0] ?? "Co-founder")}
              />
            </div>

            <div className="space-y-2">
              <Label>Working style</Label>
              <Chips
                multi={false}
                options={WORKING_STYLE_OPTIONS}
                value={[form.workingStyle]}
                onChange={(v) => set("workingStyle", v[0] ?? "Collaborative")}
              />
            </div>

            <div className="space-y-2">
              <Label>Commitment level</Label>
              <Chips
                multi={false}
                options={COMMITMENT_OPTIONS}
                value={[form.commitment]}
                onChange={(v) => set("commitment", v[0] ?? "Part-time")}
              />
            </div>

            <div className="space-y-2">
              <Label>Desired partner traits</Label>
              <Chips options={TRAIT_OPTIONS} value={form.traits} onChange={(v) => set("traits", v)} />
            </div>

            <div className="flex flex-wrap gap-3 border-t border-border pt-5">
              <Button onClick={save} size="lg">
                <Save className="size-4" /> Save Profile
              </Button>
              {state.profile && (
                <Button variant="outline" size="lg" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit border-border shadow-soft">
          <CardContent className="space-y-4 p-6">
            <PrivacyBadge label="Privacy in Foundora" />
            <p className="text-sm text-muted-foreground">
              Other founders only see your anonymous name, skills, industries, availability and
              working preferences.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Real name — hidden until mutual reveal</li>
              <li>• Startup idea — never shown in discovery</li>
              <li>• Email — never shown to anyone</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}
