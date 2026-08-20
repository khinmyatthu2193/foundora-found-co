import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Compass,
  Handshake,
  MessagesSquare,
  Eye,
  Hammer,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  Rocket,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppearanceToggle, ThemeSelector } from "@/components/foundora/theme-selector";
import { Logo, PrivacyBadge, Tag } from "@/components/foundora/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Foundora — Find the right person to build with" },
      {
        name: "description",
        content:
          "Foundora is a privacy-first co-founder matching platform: discover founders anonymously, match mutually, and turn a match into a startup.",
      },
      { property: "og:title", content: "Foundora — Find the right person to build with" },
      {
        property: "og:description",
        content:
          "Discover compatible founders privately, connect anonymously, and build something worth starting.",
      },
    ],
  }),
  component: Landing,
});

const JOURNEY = [
  { icon: Compass, title: "Discover", text: "Browse founders anonymously." },
  { icon: Handshake, title: "Match", text: "Both sides choose each other." },
  { icon: MessagesSquare, title: "Chat", text: "Talk before revealing who you are." },
  { icon: Eye, title: "Reveal", text: "Identities unlock by mutual consent." },
  { icon: Hammer, title: "Build", text: "Shape a shared project direction." },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Discover Privately",
    text: "Explore founders through skills, interests, commitment, and working style without exposing personal identity.",
  },
  {
    icon: Handshake,
    title: "Match Intentionally",
    text: "Interest becomes a match only when both founders choose each other.",
  },
  {
    icon: MessagesSquare,
    title: "Connect Safely",
    text: "Start through anonymous conversation before deciding whether to reveal identity.",
  },
  {
    icon: Sparkles,
    title: "Understand Compatibility",
    text: "Use AI-assisted insights to explore strengths, friction points, and useful discussion topics.",
  },
  {
    icon: Rocket,
    title: "Build Together",
    text: "Turn shared direction into a structured AI-assisted project proposal.",
  },
];

const LINKS = [
  { href: "#top", label: "Home" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
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
      <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-4 sm:px-6 md:pt-16">
        <div className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-10">
          <div>
            <PrivacyBadge label="Privacy-first co-founder matching" />
            <h1 className="mt-5 text-4xl font-semibold md:text-5xl">
              Find the right person to build with.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Foundora helps founders discover compatible people, connect privately, and turn a
              promising match into something worth building together.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link to="/signup">
                  Find your co-founder <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/signup">Create founder profile</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
          </div>

          <Card className="border-border shadow-card">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">Founder #A27</span>
                <PrivacyBadge />
              </div>
              <p className="text-sm text-muted-foreground">
                Design-led product builder who ships weekly and loves early user interviews.
              </p>
              <div className="flex flex-wrap gap-2">
                {["React", "UI/UX", "Product Management"].map((s) => (
                  <Tag key={s} tone="primary">
                    {s}
                  </Tag>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {["AI", "SaaS", "25 hrs/week", "Serious part-time"].map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" size="sm" disabled>
                  Pass
                </Button>
                <Button size="sm" disabled>
                  Interested
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Real names stay hidden until both founders agree.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold md:text-3xl">How Foundora works</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            A deliberate path from anonymous discovery to a real, shared project.
          </p>
        </div>

        <div className="relative">
          <span
            aria-hidden
            className="absolute top-9 right-8 left-8 hidden h-px bg-border lg:block"
          />
          <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {JOURNEY.map((s, i) => (
              <Card
                key={s.title}
                className="relative h-full border-border shadow-soft transition-shadow hover:shadow-card"
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <s.icon className="size-4" />
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </CardContent>
                {i < JOURNEY.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-1/2 -right-3 hidden -translate-y-1/2 text-muted-foreground/60 lg:block"
                  >
                    <ArrowRight className="size-4" />
                  </span>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Built for how founders actually meet
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Five ideas that keep matching intentional, private, and useful.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map((f, i) => (
            <Card
              key={f.title}
              className={`h-full border-border shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card lg:col-span-2 ${
                i === 3 ? "lg:col-start-2" : ""
              }`}
            >
              <CardContent className="flex h-full flex-col p-6">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-4 pb-12 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-soft">
          <Users className="size-8 text-primary" />
          <h2 className="text-2xl font-semibold md:text-3xl">
            Your next co-founder is one honest conversation away.
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Create a founder profile in a few minutes and start discovering people building in your
            space.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/signup">Find your co-founder</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/signup">Create founder profile</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-7 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Foundora — privacy-first co-founder matching.
          </p>
        </div>
      </footer>
    </div>
  );
}
