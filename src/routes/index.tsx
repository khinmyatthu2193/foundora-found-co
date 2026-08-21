import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Building2,
  Check,
  Compass,
  Handshake,
  LineChart,
  Lock,
  Menu,
  MessagesSquare,
  PlayCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppearanceToggle, ThemeSelector } from "@/components/foundora/theme-selector";
import { Logo, PrivacyBadge, Tag } from "@/components/foundora/ui-bits";
import heroImage from "@/assets/hero-founders.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Foundora — Find the right co-founder. Build the future together." },
      {
        name: "description",
        content:
          "Foundora is the privacy-first platform where founders discover compatible partners, chat anonymously, get AI guidance and build together.",
      },
      {
        property: "og:title",
        content: "Foundora — Find the right co-founder. Build the future together.",
      },
      {
        property: "og:description",
        content:
          "Discover compatible founders anonymously, match mutually, get AI compatibility insights and build in a shared workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const TRUST_STRIP = [
  { icon: ShieldCheck, label: "Private matching" },
  { icon: Brain, label: "AI compatibility" },
  { icon: Lock, label: "Secure collaboration" },
  { icon: Building2, label: "Premium franchise access" },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your founder profile",
    text: "Skills, availability and ambitions — your real identity stays private from day one.",
  },
  {
    icon: Compass,
    title: "Discover compatible people",
    text: "Browse an anonymous founder feed ranked by how well you actually fit together.",
  },
  {
    icon: Handshake,
    title: "Match and chat privately",
    text: "Interest has to be mutual. No cold outreach, no spam, no wasted conversations.",
  },
  {
    icon: Rocket,
    title: "Build together",
    text: "Move into a shared workspace with roles, goals and an AI-drafted startup proposal.",
  },
];

const FEATURES = [
  {
    icon: Compass,
    title: "Founder Discovery",
    text: "A curated, anonymous feed of people who are genuinely ready to start something.",
  },
  {
    icon: Handshake,
    title: "Private Matching",
    text: "Signal interest quietly. A match only happens when both sides say yes.",
  },
  {
    icon: MessagesSquare,
    title: "Private Chat",
    text: "Talk freely under an alias and reveal your identity only when you're ready.",
  },
  {
    icon: Brain,
    title: "AI Compatibility",
    text: "A deterministic fit score with an AI explanation of your strengths and friction.",
  },
  {
    icon: Sparkles,
    title: "Founder Workspace",
    text: "Roles, goals, project direction and an AI startup proposal in one shared space.",
  },
  {
    icon: Building2,
    title: "Franchise Marketplace",
    text: "Founder Pro members explore vetted franchise opportunities and apply directly.",
  },
];

const PROBLEMS = [
  "Finding the right co-founder takes years of luck and lucky introductions.",
  "General networking platforms are noisy and full of people who never ship.",
  "Sharing your idea early feels risky, so most conversations stay shallow.",
  "Building alone burns motivation faster than it builds a company.",
];

const SOLUTIONS = [
  "Structured founder profiles that surface fit, not follower counts.",
  "Mutual-only matching keeps every conversation intentional.",
  "Anonymous by default — identity is revealed by consent, never by accident.",
  "AI guidance and a shared workspace to turn a match into a real plan.",
];

const PRO_BENEFITS = [
  "Premium franchise opportunities across the Myanmar market",
  "Advanced founder tools and priority placement in discovery",
  "Enhanced AI compatibility reports and startup proposals",
  "A stronger, more serious founder experience end to end",
];

const LINKS = [
  { href: "#top", label: "Home" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#why", label: "Why Foundora" },
  { href: "#pro", label: "Founder Pro" },
];

function Landing() {
  const [open, setOpen] = useState(false);

  return (
    <div id="top" className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo className="shrink-0" />

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            <ThemeSelector />
            <AppearanceToggle />
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <AppearanceToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[86vw] max-w-sm p-6">
                <div className="mt-6 flex flex-col gap-1">
                  {LINKS.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
                <div className="mt-6">
                  <ThemeSelector />
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-20 size-[28rem] rounded-full bg-primary/25 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -left-32 size-80 rounded-full bg-primary/15 blur-[110px]"
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:pt-24 md:pb-24">
          <div>
            <PrivacyBadge label="Privacy-first co-founder matching" />
            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
              Find the right co-founder.{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-primary/50 bg-clip-text text-transparent">
                Build the future together.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Foundora helps you meet compatible founders, chat privately under an alias, get AI
              guidance on how well you fit, build together in a shared workspace — and explore
              premium franchise opportunities when you're ready to scale.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="shadow-card">
                <Link to="/signup">
                  Get Started <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Explore Founders</Link>
              </Button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-1 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-2"
              >
                <PlayCircle className="size-4 text-primary" />
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <Tag tone="primary">Anonymous by default</Tag>
              <Tag>Mutual matching</Tag>
              <Tag>AI compatibility</Tag>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/25 to-transparent blur-2xl"
            />
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card">
              <img
                src={heroImage}
                alt="Founders connected through an anonymous matching network"
                width={1280}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
            <Card className="absolute -bottom-6 left-2 hidden w-64 border-border shadow-card sm:block">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">Founder #A27</span>
                  <PrivacyBadge />
                </div>
                <p className="text-xs text-muted-foreground">
                  Real names stay hidden until both founders agree to reveal.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --------------------------- Trust strip -------------------------- */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-4 py-6 sm:px-6 lg:grid-cols-4">
          {TRUST_STRIP.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-soft"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <t.icon className="size-4" />
              </span>
              <span className="text-sm font-medium">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------- How it works ------------------------- */}
      <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Tag tone="primary">How it works</Tag>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            From a private profile to a real company
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Four calm steps. No cold pitching, no public exposure, no guesswork.
          </p>
        </div>

        <div className="relative">
          <span
            aria-hidden
            className="absolute top-14 right-20 left-20 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />
          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Card
                key={s.title}
                className="h-full border-border shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                      <s.icon className="size-5" />
                    </span>
                    <span className="text-3xl font-semibold text-muted-foreground/25">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Features --------------------------- */}
      <section id="features" className="scroll-mt-20 border-y border-border bg-muted/30 py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Tag tone="primary">Platform</Tag>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Everything a founding team needs
            </h2>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              From the first anonymous message to a structured startup proposal.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="group h-full border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-card"
              >
                <CardContent className="p-6">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-transform group-hover:scale-105">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- Why Foundora ------------------------- */}
      <section id="why" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Tag tone="primary">Why Foundora</Tag>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Great ideas rarely fail alone — they fail with the wrong people
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Card className="h-full border-border shadow-soft">
            <CardContent className="p-7">
              <span className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
                <Target className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">The problem today</h3>
              <ul className="mt-4 space-y-3">
                {PROBLEMS.map((p) => (
                  <li key={p} className="flex gap-3 text-sm text-muted-foreground">
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/40"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="h-full border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card shadow-card">
            <CardContent className="p-7">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary">
                <LineChart className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">How Foundora solves it</h3>
              <ul className="mt-4 space-y-3">
                {SOLUTIONS.map((s) => (
                  <li key={s} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ---------------------------- Founder Pro ------------------------- */}
      <section id="pro" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-card to-card p-8 shadow-card md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-primary/25 blur-3xl"
          />
          <div className="relative grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" /> Founder Pro
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
                For founders who are ready to move faster
              </h2>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
                Founder Pro unlocks the deeper layer of Foundora — sharper AI guidance, stronger
                visibility and access to a vetted franchise marketplace.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/signup">
                    Start with Founder Pro <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/demo">Watch the demo</Link>
                </Button>
              </div>
            </div>

            <ul className="space-y-3">
              {PRO_BENEFITS.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card/80 px-4 py-3 text-sm shadow-soft backdrop-blur"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------- CTA ------------------------------ */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-card">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-primary/10"
          />
          <div className="relative">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary">
              <Users className="size-6" />
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
              Ready to build with the right people?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
              Create your founder profile in a few minutes and start meeting people building in
              your space — privately, and on your terms.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/signup">Join Foundora</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Start your journey</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Foundora — privacy-first co-founder matching.
          </p>
        </div>
      </footer>
    </div>
  );
}
