import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/foundora/ui-bits";

/** Shown wherever a Founder Pro–only surface is reached on the free plan. */
export function PremiumGate({
  title = "Founder Pro required",
  description = "Unlock verified franchise opportunities and connect with business owners.",
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <EmptyState
      icon={<Lock className="size-6" />}
      title={title}
      description={description}
      action={
        children ?? (
          <Button asChild>
            <Link to="/app/profile">Upgrade to Founder Pro</Link>
          </Button>
        )
      }
    />
  );
}
