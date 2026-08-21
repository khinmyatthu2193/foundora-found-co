import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Pencil, Plus, RefreshCw, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  emptyProfileForm,
  fetchEmailVerified,
  isAnonymousNameAvailable,
  fetchMyProfile,
  profileCompletion,
  regenerateAnonymousName,
  rowToForm,
  suggestAnonymousName,
  uploadAvatar,
  upsertMyProfile,
  validateProfileForm,
} from "@/lib/profile";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { PlanCard } from "@/components/foundora/plan-card";
import { AiInsightsCard, PlanBadge } from "@/components/foundora/ui-bits";
import {
  FounderAvatar,
  PrivacyBadge,
  PrivateField,
  Section,
  Tag,
  TrustBadges,
} from "@/components/foundora/ui-bits";
import {
  AVAILABILITY_OPTIONS,
  COMMITMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  INDUSTRY_OPTIONS,
  LOOKING_FOR_OPTIONS,
  SKILL_OPTIONS,
  TRAIT_OPTIONS,
  WORKING_STYLE_OPTIONS,
  formatAvailability,
  type FounderProfile,
} from "@/lib/foundora";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/profile")({
  validateSearch: (search: Record<string, unknown>): { edit?: boolean } => {
    const raw = search["edit"];
    return raw === true || raw === "true" ? { edit: true } : {};
  },
  head: () => ({
    meta: [
      { title: "Founder profile — Foundora" },
      {
        name: "description",
        content:
          "Create and edit your Foundora founder profile: avatar, skills, industries, links and working style.",
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
  const { user } = Route.useRouteContext();
  const profileQueryKey = ["my-profile", user.id] as const;
  const fileRef = useRef<HTMLInputElement | null>(null);

  const {
    data: profile,
    isLoading,
    error: loadError,
    refetch,
  } = useQuery({ queryKey: profileQueryKey, queryFn: () => fetchMyProfile(user.id) });

  const emailVerified = useQuery({
    queryKey: ["email-verified", user.id],
    queryFn: fetchEmailVerified,
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FounderProfile>(emptyProfileForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [customSkill, setCustomSkill] = useState("");

  const search = Route.useSearch();
  const wantsEdit = search.edit === true;

  useEffect(() => {
    if (profile) {
      setForm(rowToForm(profile));
      setEditing(wantsEdit);
    } else if (profile === null) {
      setEditing(true);
      setForm((f) => (f.anonName ? f : emptyProfileForm));
      // new founders get a friendly, unique name automatically
      suggestAnonymousName()
        .then((name) => setForm((f) => (f.anonName ? f : { ...f, anonName: name })))
        .catch(() => undefined);
    }
  }, [profile, wantsEdit]);

  const saveMutation = useMutation({
    mutationFn: async (next: FounderProfile) => upsertMyProfile(next, user.id),
    onSuccess: async (savedProfile) => {
      setSaveError(null);
      queryClient.setQueryData(profileQueryKey, savedProfile);
      await queryClient.invalidateQueries({ queryKey: profileQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["discovery", user.id] });
      setEditing(false);
      toast.success("Profile saved", { description: "Your founder profile is up to date." });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Could not save your profile.";
      setSaveError(message);
      toast.error("Save failed", { description: message });
    },
  });

  const nameMutation = useMutation({
    mutationFn: async () => (profile ? regenerateAnonymousName() : suggestAnonymousName()),
    onSuccess: (name) => {
      setForm((f) => ({ ...f, anonName: name }));
      if (profile) {
        void queryClient.invalidateQueries({ queryKey: profileQueryKey });
        void queryClient.invalidateQueries({ queryKey: ["discovery", user.id] });
      }
      toast.success(`Your new anonymous name is ${name}`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not generate a name."),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file, user.id),
    onSuccess: (path) => {
      setForm((f) => ({ ...f, avatarPath: path }));
      toast.success("Photo uploaded", { description: "Save your profile to keep it." });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed."),
  });

  const set = <K extends keyof FounderProfile>(k: K, v: FounderProfile[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (!s) return;
    if (form.skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      toast.message("You already added that skill.");
      setCustomSkill("");
      return;
    }
    set("skills", [...form.skills, s]);
    setCustomSkill("");
  };

  const save = async () => {
    const problem = validateProfileForm(form);
    if (problem) {
      setSaveError(problem);
      toast.error(problem);
      return;
    }
    setSaveError(null);

    if (form.anonName.trim().toLowerCase() !== (profile?.anonymous_name ?? "").toLowerCase()) {
      try {
        const free = await isAnonymousNameAvailable(form.anonName);
        if (!free) {
          const msg = "That anonymous name is already taken. Please pick another one.";
          setSaveError(msg);
          toast.error(msg);
          return;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not check that name.";
        setSaveError(msg);
        toast.error(msg);
        return;
      }
    }

    saveMutation.mutate({ ...form, anonName: form.anonName.trim() });
  };

  const verified = emailVerified.data ?? false;
  const completion = profileCompletion(profile ? rowToForm(profile) : form, verified);

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

  const trustFlags = {
    email_verified: verified,
    has_linkedin: Boolean(form.linkedinUrl),
    has_github: Boolean(form.githubUrl),
    has_portfolio: Boolean(form.portfolioUrl || form.websiteUrl),
  };

  if (!editing && profile) {
    const p = rowToForm(profile);

    return (
      <Section
        className="pt-8"
        title="Your founder profile"
        description="This is how you appear to other founders — anonymously."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border shadow-soft lg:col-span-2">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <FounderAvatar size="lg" path={p.avatarPath} name={p.anonName} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold">{p.anonName}</h3>
                      <PlanBadge premium={profile.subscription_status === "premium"} size="sm" />
                    </div>
                    <TrustBadges className="mt-2" flags={trustFlags} />
                  </div>
                </div>
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
                <Field label="Availability">
                  <p className="text-sm">{formatAvailability(p.hoursPerWeek)}</p>
                </Field>
                <Field label="Experience">
                  <p className="text-sm">{p.experience}</p>
                </Field>
                <Field label="Looking for">
                  <p className="text-sm">{p.lookingFor.join(", ") || "—"}</p>
                </Field>
                <Field label="Working style">
                  <p className="text-sm">{p.workingStyle.join(", ") || "—"}</p>
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

              <Field label="Professional links">
                <div className="flex flex-wrap gap-3 text-sm">
                  {[
                    ["LinkedIn", p.linkedinUrl],
                    ["GitHub", p.githubUrl],
                    ["Portfolio", p.portfolioUrl],
                    ["Website", p.websiteUrl],
                  ]
                    .filter(([, url]) => Boolean(url))
                    .map(([label, url]) => (
                      <a
                        key={label}
                        href={url as string}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {label}
                      </a>
                    ))}
                  {!p.linkedinUrl && !p.githubUrl && !p.portfolioUrl && !p.websiteUrl && (
                    <span className="text-muted-foreground">No links added yet</span>
                  )}
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

          <div className="space-y-4">
            <CompletionCard score={completion.score} nextStep={completion.nextStep} />

            <PlanCard userId={user.id} />

            <AiInsightsCard
              premium={profile.subscription_status === "premium"}
              context="the founders you match with"
            />

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
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your startup idea stays private.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section
      className="pt-8"
      title={profile ? "Edit founder profile" : "Create your founder profile"}
      description="Everything marked private stays hidden until you choose to reveal it."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border shadow-soft lg:col-span-2">
          <CardContent className="space-y-7 p-6">
            <FormSection title="Identity" description="Your anonymous presence — and the private details only you can see." />

            <div className="flex flex-wrap items-center gap-4">
              <FounderAvatar size="lg" path={form.avatarPath} name={form.anonName || "Founder"} />
              <div className="space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) avatarMutation.mutate(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={avatarMutation.isPending}
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="size-4" />
                  {avatarMutation.isPending
                    ? "Uploading…"
                    : form.avatarPath
                      ? "Replace photo"
                      : "Upload photo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Optional. PNG, JPG or WebP up to 3 MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anon">Anonymous founder name</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  id="anon"
                  value={form.anonName}
                  onChange={(e) => set("anonName", e.target.value)}
                  placeholder="BrightNova"
                  maxLength={32}
                  className="max-w-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={nameMutation.isPending}
                  onClick={() => nameMutation.mutate()}
                >
                  <RefreshCw className="size-4" /> Generate another name
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Choose your own (at least 3 characters, must be unique) or keep the generated one —
                it never reveals your real identity.
              </p>
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

            <div className="space-y-3 border-t border-border pt-6">
              <FormSection title="Skills" description="What you bring to a founding team." />
              <Label>Skills / what you can do</Label>
              <Chips options={SKILL_OPTIONS} value={form.skills} onChange={(v) => set("skills", v)} />
              {form.skills.filter((s) => !SKILL_OPTIONS.includes(s)).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.skills
                    .filter((s) => !SKILL_OPTIONS.includes(s))
                    .map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                      >
                        {s}
                        <button
                          type="button"
                          aria-label={`Remove ${s}`}
                          onClick={() => set("skills", form.skills.filter((x) => x !== s))}
                        >
                          <X className="size-3.5" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                  placeholder="AI Automation, Sales Strategy, No-code…"
                  className="max-w-xs"
                />
                <Button type="button" variant="outline" onClick={addCustomSkill}>
                  <Plus className="size-4" /> Add custom skill
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short public bio</Label>
              <Textarea
                id="bio"
                rows={3}
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="How you like to build, what you're great at — no names or contact details."
              />
              <p className="text-xs text-muted-foreground">
                Shown anonymously on your discovery card. Keep it identity-free.
              </p>
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

            <div className="space-y-2 border-t border-border pt-6">
              <FormSection
                title="Founder preferences"
                description="How you like to work and what you want in a partner."
              />
              <Label>How much time can you commit?</Label>
              <Chips
                multi={false}
                options={AVAILABILITY_OPTIONS.map((o) => o.label)}
                value={[formatAvailability(form.hoursPerWeek)]}
                onChange={(v) =>
                  set(
                    "hoursPerWeek",
                    AVAILABILITY_OPTIONS.find((o) => o.label === v[0])?.value ?? 20,
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                Pick the option closest to your real week — you can change it any time.
              </p>
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
                options={LOOKING_FOR_OPTIONS}
                value={form.lookingFor}
                onChange={(v) => set("lookingFor", v)}
              />
              <p className="text-xs text-muted-foreground">Choose as many as apply.</p>
            </div>

            <div className="space-y-2">
              <Label>Working style</Label>
              <Chips
                options={WORKING_STYLE_OPTIONS}
                value={form.workingStyle}
                onChange={(v) => set("workingStyle", v)}
              />
              <p className="text-xs text-muted-foreground">Choose as many as apply.</p>
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
              <p className="text-xs text-muted-foreground">Choose as many as apply.</p>
            </div>

            <div className="space-y-3 border-t border-border pt-6">
              <FormSection
                title="Trust & verification"
                description="Optional links that earn trust badges — never shown as URLs in discovery."
              />
              <div>
                <Label>Professional links</Label>
                <p className="text-xs text-muted-foreground">
                  All optional — they add trust badges without revealing your identity in discovery.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <LinkInput
                  id="linkedin"
                  label="LinkedIn"
                  value={form.linkedinUrl}
                  onChange={(v) => set("linkedinUrl", v)}
                  placeholder="linkedin.com/in/you"
                />
                <LinkInput
                  id="github"
                  label="GitHub"
                  value={form.githubUrl}
                  onChange={(v) => set("githubUrl", v)}
                  placeholder="github.com/you"
                />
                <LinkInput
                  id="portfolio"
                  label="Portfolio"
                  value={form.portfolioUrl}
                  onChange={(v) => set("portfolioUrl", v)}
                  placeholder="dribbble.com/you"
                />
                <LinkInput
                  id="website"
                  label="Personal website"
                  value={form.websiteUrl}
                  onChange={(v) => set("websiteUrl", v)}
                  placeholder="you.com"
                />
              </div>
            </div>

            {saveError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {saveError}
              </p>
            )}

            <div className="flex flex-wrap gap-3 border-t border-border pt-5">
              <Button onClick={save} size="lg" disabled={saveMutation.isPending}>
                <Save className="size-4" />
                {saveMutation.isPending ? "Saving…" : "Save Profile"}
              </Button>
              {profile && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setEditing(false)}
                  disabled={saveMutation.isPending}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <CompletionCard
            score={profileCompletion(form, verified).score}
            nextStep={profileCompletion(form, verified).nextStep}
          />
          <Card className="h-fit border-border shadow-soft">
            <CardContent className="space-y-4 p-6">
              <PrivacyBadge label="Privacy in Foundora" />
              <TrustBadges flags={trustFlags} />
              <p className="text-sm text-muted-foreground">
                Other founders only see your anonymous name, avatar, skills, industries,
                availability, working preferences and trust badges.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real name — hidden until mutual reveal</li>
                <li>• Startup idea — never shown in discovery</li>
                <li>• Email — never shown to anyone</li>
                <li>• Links — only shown as badges, never as URLs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}

function CompletionCard({ score, nextStep }: { score: number; nextStep: string | null }) {
  return (
    <Card className="border-border shadow-soft">
      <CardContent className="space-y-3 p-6">
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold">Profile strength</h3>
          <span className="text-2xl font-semibold text-primary">{score}%</span>
        </div>
        <Progress value={score} />
        <p className="text-sm text-muted-foreground">
          {nextStep ?? "Your profile is complete. Founders can see everything they need."}
        </p>
      </CardContent>
    </Card>
  );
}

function LinkInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="url"
      />
    </div>
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

function FormSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
