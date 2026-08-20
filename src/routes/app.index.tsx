import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Compass,
  Hammer,
  MessagesSquare,
  Users,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JourneyProgress, Section, Tag } from "@/components/foundora/ui-bits";
import { useSession } from "@/lib/auth";
import { useFoundora } from "@/lib/foundora";
import { fetchMyProfile } from "@/lib/profile";


export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Your Foundora hub" },
      {
        name: "description",
        content: "Your founder journey hub: profile, discovery, matches and building together.",
      },
      { property: "og:title", content: "Your Foundora hub" },
      {
        property: "og:description",
        content: "Track your progress from profile to a shared startup project.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state } = useFoundora();
  const { user } = useSession();
  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: fetchMyProfile });
  const hasProfile = Boolean(profile);
  const matchCount = state.matches.length;
  const workspaceReady = Object.values(state.matchState).some((m) => m.acceptMe && m.acceptThem);

  const step = workspaceReady ? 3 : matchCount > 0 ? 2 : hasProfile ? 1 : 0;


  const actions = [
    {
      icon: UserRound,
      title: hasProfile ? "View Profile" : "Complete Profile",
      text: "Manage your founder profile.",
      to: "/app/profile" as const,
      cta: hasProfile ? "Open profile" : "Start profile",
      primary: !hasProfile,
    },
    {
      icon: Compass,
      title: "Discover Founders",
      text: "Browse compatible founders anonymously.",
      to: "/app/discover" as const,
      cta: "Start discovering",
      primary: hasProfile && matchCount === 0,
    },
    {
      icon: Users,
      title: "Matches",
      text: "See mutual connections.",
      to: "/app/matches" as const,
      cta: matchCount ? `View ${matchCount} match${matchCount > 1 ? "es" : ""}` : "View matches",
      primary: false,
    },
    {
      icon: MessagesSquare,
      title: "Continue Conversations",
      text: "Return to matched founder chats.",
      to: "/app/matches" as const,
      cta: "Open chats",
      primary: false,
    },
    {
      icon: Hammer,
      title: "Build Together",
      text: "Access AI collaboration for active matches.",
      to: "/app/workspace" as const,
      cta: "Open workspace",
      primary: workspaceReady,
    },
  ];

  return (
    <Section className="pt-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
        <p className="text-sm text-muted-foreground">
          {state.auth?.email ? `Signed in as ${state.auth.email}` : "Welcome to Foundora"}
        </p>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
          Ready to find your next collaborator?
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Foundora keeps your identity private while you explore. Move through the journey at your
          own pace.
        </p>
        <div className="mt-6">
          <JourneyProgress steps={["Profile", "Discover", "Match", "Build"]} current={step} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to={hasProfile ? "/app/discover" : "/app/profile"}>
              {hasProfile ? "Discover founders" : "Complete your profile"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/matches">Matches {matchCount > 0 && <Tag tone="primary">{matchCount}</Tag>}</Link>
          </Button>
        </div>
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold">Quick actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((a) => (
          <Card key={a.title} className="border-border shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
            <CardContent className="flex h-full flex-col p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <a.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{a.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a.text}</p>
              <div className="mt-5">
                <Button asChild variant={a.primary ? "default" : "outline"} size="sm">
                  <Link to={a.to}>{a.cta}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
