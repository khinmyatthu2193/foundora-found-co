import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, LogOut } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppearanceToggle, ThemeSelector } from "@/components/foundora/theme-selector";
import { Logo } from "@/components/foundora/ui-bits";
import { signOutUser } from "@/lib/auth";

const NAV = [
  { to: "/app", label: "Home" },
  { to: "/app/profile", label: "Profile" },
  { to: "/app/discover", label: "Discover" },
  { to: "/app/matches", label: "Matches" },
  { to: "/app/workspace", label: "Workspace" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutUser();
    navigate({ to: "/", replace: true });
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
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            <ThemeSelector />
            <AppearanceToggle />
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
