import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Building2,
  Handshake,
  Lock,
  Menu,
  MessagesSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppearanceToggle, ThemeSelector } from "@/components/foundora/theme-selector";
import { Logo, PrivacyBadge, Tag } from "@/components/foundora/ui-bits";
import heroImage from "@/assets/founder-network.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Foundora — Find the right founder. Build the right future." },
      {
        name: "description",
        content:
          "Foundora helps entrepreneurs discover compatible co-founders, collaborate privately, and turn ideas into real businesses.",
      },
      { property: "og:title", content: "Foundora — Find the right founder. Build the right future." },
      {
        property: "og:description",
        content:
          "Discover compatible founders anonymously, match mutually, and build something worth starting.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your founder profile",
    text: "Share skills, availability and what you want to build — identity stays private.",
  },
  {
    icon: Users,
    title: "Discover compatible partners",
    text: "Browse founders anonymously and signal interest only when it feels right.",
  },
  {
    icon: Rocket,
    title: "Build together",
    text: "Move from a match into a shared workspace and a real startup plan.",
  },
];

const FEATURES = [
  {
    icon: Handshake,
    title: "Founder Matching",
    text: "Mutual interest turns into a match — no cold outreach, no noise.",
  },
  {
    icon: Brain,
    title: "AI Compatibility Analysis",
    text: "A deterministic score plus AI explanation of strengths and friction points.",
  },
  {
    icon: MessagesSquare,
    title: "Private Chat",
    text: "Talk anonymously and reveal identity only by mutual consent.",
  },
  {
    icon: Sparkles,
    title: "Founder Workspace",
    text: "Agree to build, then align on roles, goals and an AI startup proposal.",
  },
  {
    icon: Building2,
    title: "Franchise Opportunities",
    text: "Founder Pro members explore vetted franchise listings and apply directly.",
  },
];

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Anonymous discovery",
    text: "Real names, emails and startup ideas stay hidden until both sides agree.",
  },
  {
    icon: Lock,
    title: "Secure profiles",
    text: "Every profile is owner-only by default and protected at the database level.",
  },
  {
    icon: Users,
    title: "Founder-focused community",
    text: "Built for people who actually want to start something, not for networking noise.",
  },
];

const LINKS = [
  { href: "#top", label: "Home" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#trust", label: "Trust" },
];

function Landing() {
  const [open, setOpen] = useState(false);

  return (
    <div id="top" className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-background to-background"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-14 pb-12 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:pt-20">
          <div>
            <PrivacyBadge label="Privacy-first co-founder matching" />
            <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
              Find the right founder.{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Build the right future.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Foundora helps entrepreneurs discover compatible co-founders, collaborate, and turn
              ideas into real businesses.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/signup">
                  Find Your Co-Founder <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/signup">Explore Opportunities</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <Tag tone="primary">Anonymous by default</Tag>
              <Tag>Mutual matching</Tag>
              <Tag>AI compatibility</Tag>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
              <img
                src={heroImage}
                alt="Founders collaborating around connected anonymous profile cards"
                width={1280}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
            <Card className="absolute -bottom-6 left-4 hidden w-64 border-border shadow-card sm:block">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">Founder #A27</span>
                  <PrivacyBadge />
                </div>
                <p className="text-xs text-muted-foreground">
                  Real names stay hidden until both founders agree.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">How it works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Three steps from a private profile to a shared company.
          </p>
        </div>

        <div className="relative">
          <span aria-hidden className="absolute top-12 right-16 left-16 hidden h-px bg-border md:block" />
          <div className="relative grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Card key={s.title} className="h-full border-border shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                      <s.icon className="size-5" />
                    </span>
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-y border-border bg-muted/30 py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">Everything a founding team needs</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              From first anonymous conversation to a structured startup proposal.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
            {FEATURES.map((f, i) => (
              <Card
                key={f.title}
                className={`h-full border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card lg:col-span-2 ${
                  i === 3 ? "lg:col-start-2" : ""
                }`}
              >
                <CardContent className="p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">Built on trust, not exposure</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TRUST.map((t) => (
            <Card key={t.title} className="h-full border-border shadow-soft">
              <CardContent className="p-6">
                <t.icon className="size-6 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card px-6 py-14 text-center shadow-card">
          <h2 className="text-3xl font-semibold md:text-4xl">Ready to build something meaningful?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Create a founder profile in a few minutes and start discovering people building in your
            space.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/signup">Join Foundora</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/demo">Try demo mode</Link>
            </Button>
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
