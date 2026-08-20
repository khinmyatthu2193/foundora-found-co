import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/foundora/app-shell";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
