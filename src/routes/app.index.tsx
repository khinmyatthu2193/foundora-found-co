import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Building2,
  Compass,
  Hammer,
  MessagesSquare,
  Rocket,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FounderAvatar,
  PlanBadge,
  Section,
  StrengthPill,
  Tag,
} from "@/components/foundora/ui-bits";
import { fetchInboxMessages, fetchMyMatches } from "@/lib/matching";
import { fetchMyProfile, profileCompletion, rowToForm } from "@/lib/profile";
import { fetchDiscoveryFounders } from "@/lib/profile";
import { fetchMyWorkspaces } from "@/lib/workspace";
import { fetchFranchises, formatInvestmentRange } from "@/lib/franchise";
import { fetchMyPlan, planQueryKey } from "@/lib/premium";
import { unreadByMatch, useReadState } from "@/lib/notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Your Foundora home" },
      {
        name: "description",
        content:
          "Your founder home: journey progress, matches, chats, AI tools, recommended actions and franchise access.",
      },
      { property: "og:title", content: "Your Foundora home" },
      {
        property: "og:description",
        content: "Track your progress from profile to a shared startup project.",
      },
    ],
  }),
  component: Dashboard,
});

const JOURNEY = [
  "Profile created",
  "Discovering founders",
  "Matched",
  "Building together",
  "Proposal ready",
];

function Dashboard() {
  const { user } = Route.useRouteContext();

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user.id],
    queryFn: () => fetchMyProfile(user.id),
  });
  const { data: matches } = useQuery({
    queryKey: ["matches", user.id],
    queryFn: fetchMyMatches,
  });
  const { data: inbox } = useQuery({
    queryKey: ["inbox", user.id],
    queryFn: fetchInboxMessages,
  });
  const { data: workspaces } = useQuery({
    queryKey: ["workspaces", user.id],
    queryFn: fetchMyWorkspaces,
  });
  const { data: founders } = useQuery({
    queryKey: ["discovery", user.id],
    queryFn: fetchDiscoveryFounders,
  });
  const { data: plan } = useQuery({
    queryKey: planQueryKey(user.id),
    queryFn: () => fetchMyPlan(user.id),
  });
  const premium = plan === "premium";
  const { data: franchises } = useQuery({
    queryKey: ["franchises", user.id],
    queryFn: fetchFranchises,
    enabled: premium,
    retry: false,
  });

  const readState = useReadState(user.id);
  const otherMessages = (inbox ?? []).filter((m) => m.sender_id !== user.id);
  const unreadMap = unreadByMatch(otherMessages, readState);
  const unreadChats = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  const form = profile ? rowToForm(profile) : null;
  const strength = form ? profileCompletion(form).score : 0;
  const nextStep = form ? profileCompletion(form).nextStep : "Create your founder profile.";

  const hasProfile = Boolean(profile);
  const matchCount = matches?.length ?? 0;
  const workspaceCount = workspaces?.length ?? 0;
  const proposalReady = workspaces?.some((w) => w.stage === "proposal") ?? false;

  const step = proposalReady
    ? 4
    : workspaceCount > 0
      ? 3
      : matchCount > 0
        ? 2
        : hasProfile
          ? 1
          : 0;

  const previewFounders = (founders ?? []).slice(0, 3);
  const previewFranchises = (franchises ?? []).slice(0, 3);

  const quickActions = [
    { label: hasProfile ? "Edit profile" : "Complete profile", to: "/app/profile" as const, icon: UserRound },
    { label: "Discover founders", to: "/app/discover" as const, icon: Compass },
    { label: "View matches", to: "/app/matches" as const, icon: Users },
    { label: "Open workspace", to: "/app/workspace" as const, icon: Hammer },
    { label: "Explore franchise", to: "/app/franchise" as const, icon: Building2 },
  ];

  const stats = [
    { label: "Profile strength", value: `${strength}%`, icon: UserRound, to: "/app/profile" as const },
    { label: "Matches", value: String(matchCount), icon: Users, to: "/app/matches" as const },
    { label: "Unread chats", value: String(unreadChats), icon: MessagesSquare, to: "/app/chat" as const },
    { label: "Workspaces", value: String(workspaceCount), icon: Hammer, to: "/app/workspace" as const },
    {
      label: "Franchise access",
      value: premium ? "Unlocked" : "Locked",
      icon: Building2,
      to: "/app/franchise" as const,
    },
  ];

  const recommendations = [
    strength < 100
      ? {
          title: "Strengthen your profile",
          text: nextStep ?? "Add more detail to improve your matching quality.",
          cta: "Update profile",
          to: "/app/profile" as const,
          icon: UserRound,
        }
      : null,
    matchCount === 0
      ? {
          title: "Start discovering founders",
          text: "Browse compatible founders anonymously and signal interest when it feels right.",
          cta: "Open discovery",
          to: "/app/discover" as const,
          icon: Compass,
        }
      : {
          title: `You have ${matchCount} match${matchCount > 1 ? "es" : ""}`,
          text: "Keep the conversation moving — momentum matters early.",
          cta: "Open matches",
          to: "/app/matches" as const,
          icon: Users,
        },
    unreadChats > 0
      ? {
          title: `${unreadChats} unread message${unreadChats > 1 ? "s" : ""}`,
          text: "A founder is waiting for your reply.",
          cta: "Open chats",
          to: "/app/chat" as const,
          icon: MessagesSquare,
        }
      : {
          title: "Try AI compatibility",
          text: "Get a deterministic fit score plus an AI explanation of your strengths.",
          cta: "See matches",
          to: "/app/matches" as const,
          icon: Brain,
        },
    workspaceCount > 0
      ? {
          title: "Continue your workspace",
          text: "Align on roles and goals, then generate your AI startup proposal.",
          cta: "Open workspace",
          to: "/app/workspace" as const,
          icon: Hammer,
        }
      : {
          title: premium ? "Explore the franchise marketplace" : "Unlock Founder Pro",
          text: premium
            ? "Vetted franchise opportunities are ready for you to review."
            : "Founder Pro unlocks franchise access and enhanced AI tools.",
          cta: premium ? "Browse franchises" : "See Founder Pro",
          to: premium ? ("/app/franchise" as const) : ("/app/profile" as const),
          icon: premium ? Building2 : Sparkles,
        },
  ].filter(Boolean) as {
    title: string;
    text: string;
    cta: string;
    to: "/app/profile" | "/app/discover" | "/app/matches" | "/app/chat" | "/app/workspace" | "/app/franchise";
    icon: typeof UserRound;
  }[];

  return (
    <Section className="pt-8">
      {/* ---------------------------- Welcome hero --------------------------- */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/12 via-card to-card p-6 shadow-card md:p-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <FounderAvatar
                path={profile?.avatar_url ?? null}
                name={profile?.anonymous_name ?? "Founder"}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">
                  Welcome back{profile?.anonymous_name ? `, ${profile.anonymous_name}` : ""}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <PlanBadge premium={premium} size="sm" />
                  {hasProfile && <StrengthPill value={strength} />}
                </div>
              </div>
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight md:text-4xl">
              Your next great collaboration starts here.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              Keep your identity private while you explore, match and build. Move through the
              journey at your own pace.
            </p>
          </div>
        </div>

        <div className="relative mt-7 flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Button key={a.label} asChild variant="outline" size="sm" className="bg-card/80">
              <Link to={a.to}>
                <a.icon className="size-4" />
                {a.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* ------------------------------ Journey ------------------------------ */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Your founder journey</h2>
          <Tag tone="primary">
            Step {Math.min(step + 1, JOURNEY.length)} of {JOURNEY.length}
          </Tag>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {JOURNEY.map((label, i) => (
            <div
              key={label}
              className={cn(
                "rounded-xl border px-4 py-3",
                i < step && "border-primary/30 bg-primary/8",
                i === step && "border-primary bg-primary/12 shadow-soft",
                i > step && "border-border bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold",
                  i <= step ? "text-primary" : "text-muted-foreground/70",
                )}
              >
                0{i + 1}
              </span>
              <p
                className={cn(
                  "mt-1 text-sm font-medium",
                  i > step && "text-muted-foreground",
                )}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------- Stats ------------------------------- */}
      <h2 className="mt-10 mb-4 text-lg font-semibold">At a glance</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="size-4" />
            </span>
            <p className="mt-4 text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* -------------------------- Recommendations -------------------------- */}
      <h2 className="mt-10 mb-4 text-lg font-semibold">Recommended for you</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((r) => (
          <Card key={r.title} className="border-border shadow-soft transition-all hover:shadow-card">
            <CardContent className="flex h-full flex-col p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <r.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{r.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
              <div className="mt-5">
                <Button asChild size="sm" variant="outline">
                  <Link to={r.to}>
                    {r.cta} <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---------------------------- Founders preview ----------------------- */}
      {previewFounders.length > 0 && (
        <>
          <div className="mt-10 mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Founders you might click with</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/discover">
                See all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {previewFounders.map((f) => (
              <Card key={f.discovery_id} className="border-border shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <FounderAvatar path={f.avatar_url} name={f.anonymous_name} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{f.anonymous_name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {f.experience_level ?? "Founder"} · {f.available_hours}h / week
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {f.skills.slice(0, 3).map((s) => (
                      <Tag key={s} tone="muted">
                        {s}
                      </Tag>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ---------------------------- Franchise preview ---------------------- */}
      <div className="mt-10 mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Franchise opportunities</h2>
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/franchise">
            Explore <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      {premium && previewFranchises.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {previewFranchises.map((fr) => (
            <Card key={fr.id} className="border-border shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
              <CardContent className="p-5">
                <p className="font-semibold">{fr.company_name}</p>
                <p className="text-xs text-muted-foreground">{fr.category}</p>
                <p className="mt-3 text-sm text-primary">
                  {formatInvestmentRange(fr.investment_min_mmk, fr.investment_max_mmk)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card shadow-soft">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="font-semibold">Founder Pro unlocks the franchise marketplace</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Vetted franchise opportunities, advanced founder tools and enhanced AI features.
              </p>
            </div>
            <Button asChild>
              <Link to="/app/profile">See Founder Pro</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------ Mini CTAs ---------------------------- */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Compass,
            title: "Find a co-founder",
            text: "Browse the anonymous founder feed.",
            to: "/app/discover" as const,
          },
          {
            icon: Rocket,
            title: "Start building together",
            text: "Turn a match into a shared workspace.",
            to: "/app/workspace" as const,
          },
          {
            icon: Building2,
            title: "Explore franchises",
            text: "Premium opportunities, ready to apply.",
            to: "/app/franchise" as const,
          },
        ].map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <c.icon className="size-5" />
            </span>
            <h3 className="mt-4 font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
