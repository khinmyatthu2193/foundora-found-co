import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, LogOut } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppearanceToggle, ThemeSelector } from "@/components/foundora/theme-selector";
import { FounderAvatar, Logo } from "@/components/foundora/ui-bits";
import { fetchInboxMessages, fetchIncomingInterests } from "@/lib/matching";
import { fetchMyProfile } from "@/lib/profile";
import { signOutUser } from "@/lib/auth";
import { clearFoundoraUserState } from "@/lib/foundora";
import { unreadByMatch, useReadState } from "@/lib/notifications";

const NAV = [
  { to: "/app", label: "Home" },
  { to: "/app/profile", label: "Profile" },
  { to: "/app/discover", label: "Discover" },
  { to: "/app/matches", label: "Matches" },
  { to: "/app/chat", label: "Chat" },
  { to: "/app/workspace", label: "Workspace" },
] as const;

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function AppShell({ children, userId }: { children: ReactNode; userId: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const readState = useReadState(userId);

  const incoming = useQuery({
    queryKey: ["incoming-interests", userId],
    queryFn: fetchIncomingInterests,
    refetchInterval: 30000,
  });
  const inbox = useQuery({
    queryKey: ["inbox-messages", userId],
    queryFn: fetchInboxMessages,
    refetchInterval: 15000,
  });
  const profile = useQuery({
    queryKey: ["my-profile", userId],
    queryFn: () => fetchMyProfile(userId),
  });

  const matchesCount = (incoming.data ?? []).filter(
    (i) =>
      !i.interest_sent &&
      i.status === "pending" &&
      new Date(i.created_at).getTime() > readState.matchesSeenAt,
  ).length;

  const unread = unreadByMatch(
    (inbox.data ?? []).filter((m) => m.sender_id !== userId),
    readState,
  );
  const chatCount = Object.values(unread).reduce((a, b) => a + b, 0);

  const badgeFor = (to: string) =>
    to === "/app/matches" ? matchesCount : to === "/app/chat" ? chatCount : 0;

  const handleLogout = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    clearFoundoraUserState();
    await signOutUser();
    navigate({ to: "/login", replace: true });
  };




  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 md:flex md:justify-between">
          <Link to="/app" className="min-w-0 shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/app" }}
                activeProps={{ className: "bg-primary/10 text-primary" }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {n.label}
                <Badge count={badgeFor(n.to)} />

              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            <ThemeSelector />
            <AppearanceToggle />
            <Link to="/app/profile" aria-label="Your profile">
              <FounderAvatar
                size="sm"
                path={profile.data?.avatar_url ?? null}
                name={profile.data?.anonymous_name ?? "Founder"}
              />
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" /> Logout
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
                  {NAV.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: n.to === "/app" }}
                      activeProps={{ className: "bg-primary/10 text-primary" }}
                      className="rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {n.label}
                      <Badge count={badgeFor(n.to)} />

                    </Link>
                  ))}
                </div>
                <div className="mt-8 flex items-center gap-2">
                  <ThemeSelector />
                  <AppearanceToggle />
                </div>
                <Button variant="outline" className="mt-8 w-full" onClick={handleLogout}>
                  <LogOut className="size-4" /> Logout
                </Button>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="pb-20">{children}</main>
    </div>
  );
}
