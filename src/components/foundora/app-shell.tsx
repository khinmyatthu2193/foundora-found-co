import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, LogOut } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeSelector } from "@/components/foundora/theme-selector";
import { Logo } from "@/components/foundora/ui-bits";
import { useFoundora } from "@/lib/foundora";

const NAV = [
  { to: "/app", label: "Home" },
  { to: "/app/profile", label: "Profile" },
  { to: "/app/discover", label: "Discover" },
  { to: "/app/matches", label: "Matches" },
  { to: "/app/workspace", label: "Workspace" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { logout } = useFoundora();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/app" className="shrink-0">
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

          <div className="hidden items-center gap-3 md:flex">
            <ThemeSelector compact />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" /> Logout
            </Button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
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
              <div className="mt-8">
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Theme
                </p>
                <ThemeSelector />
              </div>
              <Button variant="outline" className="mt-8 w-full" onClick={handleLogout}>
                <LogOut className="size-4" /> Logout
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="pb-20">{children}</main>
    </div>
  );
}
