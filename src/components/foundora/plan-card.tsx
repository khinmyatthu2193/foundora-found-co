import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlanBadge } from "@/components/foundora/ui-bits";
import { fetchMyPlan, planQueryKey, setMyPlan } from "@/lib/premium";

const FREE_FEATURES = ["Basic discovery", "Matching", "Chat"];
const PRO_FEATURES = [
  "Everything in Explorer",
  "AI Founder Insights (preview)",
  "Priority recommendations badge",
];

/** Prototype plan panel: demo-only activation, no payment involved. */
export function PlanCard({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const plan = useQuery({
    queryKey: planQueryKey(userId),
    queryFn: () => fetchMyPlan(userId),
  });
  const premium = plan.data === "premium";

  const change = useMutation({
    mutationFn: (next: "free" | "premium") => setMyPlan(userId, next),
    onSuccess: (next) => {
      setConfirming(false);
      queryClient.setQueryData(planQueryKey(userId), next);
      void queryClient.invalidateQueries({ queryKey: ["discovery", userId] });
      void queryClient.invalidateQueries({ queryKey: ["matches", userId] });
      toast.success(
        next === "premium" ? "Founder Pro demo activated ⭐" : "Back on the Explorer plan",
      );
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update your plan."),
  });

  return (
    <Card className="border-border shadow-soft">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Your plan
          </h3>
          <PlanBadge premium={premium} />
        </div>

        <div>
          <p className="text-lg font-semibold">
            {premium ? "Founder Pro (demo)" : "Explorer (Free)"}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {(premium ? PRO_FEATURES : FREE_FEATURES).map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </div>

        {premium ? (
          <Button
            variant="outline"
            className="w-full"
            disabled={change.isPending}
            onClick={() => change.mutate("free")}
          >
            Turn off demo mode
          </Button>
        ) : (
          <Button className="w-full" disabled={change.isPending} onClick={() => setConfirming(true)}>
            <Sparkles className="size-4" /> Try Founder Pro
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          Prototype demonstration only — no payment, billing or subscription is involved.
        </p>
      </CardContent>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Founder Pro demo mode?</AlertDialogTitle>
            <AlertDialogDescription>
              This unlocks the Founder Pro experience for this prototype. Nothing is charged and you
              can switch back at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                change.mutate("premium");
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
