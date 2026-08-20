import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Compass,
  Handshake,
  MessagesSquare,
  Eye,
  Hammer,
  ShieldCheck,
  Sparkles,
  Users,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeSelector } from "@/components/foundora/theme-selector";
import { Logo, PrivacyBadge, Section, Tag } from "@/components/foundora/ui-bits";

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

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeSelector compact />
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-14 pb-6 sm:px-6 md:pt-20">
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <PrivacyBadge label="Privacy-first co-founder matching" />
            <h1 className="mt-5 text-4xl font-semibold md:text-5xl">
              Find the right person to build with.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Foundora helps founders discover compatible people, connect privately, and turn a
              promising match into something worth building together.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
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
            <p className="mt-4 text-sm text-muted-foreground">
              Already building with Foundora?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>

          <Card className="border-border shadow-card">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
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

      {/* Theme chooser */}
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Choose your Foundora style</h2>
            <p className="text-sm text-muted-foreground">
              Your theme is saved on this device and applies across the whole app.
            </p>
          </div>
          <ThemeSelector />
        </div>
      </section>

      {/* How it works */}
      <div id="how-it-works" className="scroll-mt-20">
        <Section
          title="How Foundora works"
          description="A deliberate path from anonymous discovery to a real, shared project."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {JOURNEY.map((s, i) => (
              <Card key={s.title} className="border-border shadow-soft transition-shadow hover:shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <s.icon className="size-4" />
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      {/* Features */}
      <Section
        title="Built for how founders actually meet"
        description="Five ideas that keep matching intentional, private, and useful."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-border shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
              <CardContent className="p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section>
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-soft">
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
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </Section>

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
