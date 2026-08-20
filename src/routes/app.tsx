import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/foundora/app-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  // Supabase keeps the session in localStorage, so the gate runs client-side only.
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    return { user: data.user };
  },
  component: AppLayout,
  pendingComponent: () => (
    <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
      Loading your session…
    </div>
  ),
});

function AppLayout() {
  const { user } = Route.useRouteContext();
  return (
    <AppShell userId={user.id}>
      <Outlet />
    </AppShell>
  );
}
