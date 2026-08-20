import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Handshake, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  collaborationQueryKey,
  fetchCollaboration,
  setCollaborationDecision,
  workspaceListQueryKey,
} from "@/lib/workspace";
import { cn } from "@/lib/utils";

/** "Are you ready to build something together?" — both founders must agree. */
export function BuildDecisionCard({
  userId,
  matchId,
  partnerName,
  className,
}: {
  userId: string;
  matchId: string;
  partnerName: string;
  className?: string;
}) {
  const queryClient = useQueryClient();

  const state = useQuery({
    queryKey: collaborationQueryKey(userId, matchId),
    queryFn: () => fetchCollaboration(matchId),
    refetchInterval: 15000,
  });

  const decide = useMutation({
    mutationFn: (accept: boolean) => setCollaborationDecision(matchId, accept),
    onSuccess: (row, accept) => {
      queryClient.setQueryData(collaborationQueryKey(userId, matchId), row);
      void state.refetch();
      void queryClient.invalidateQueries({ queryKey: workspaceListQueryKey(userId) });

      if (row?.status === "building_together") {
        toast.success("You're building together — your workspace is ready");
      } else if (accept) {
        toast.success("Waiting for your match to confirm");
      } else {
        toast.success("Keep exploring — no rush");
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save your decision."),
  });

  const s = state.data;
  const building = s?.status === "building_together";
  const waiting = !building && s?.my_status === "accepted";

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-soft",
        building ? "border-primary/30 bg-primary/5" : "border-border bg-card",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Handshake className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">
          {building ? "You're building together" : "Are you ready to build something together?"}
        </h3>
      </div>

      {state.isLoading && (
        <p className="mt-2 text-sm text-muted-foreground">Checking your collaboration…</p>
      )}

      {!state.isLoading && building && (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            You and {partnerName} both agreed. Your shared workspace is open.
          </p>
          <Button asChild className="mt-3">
            <Link to="/app/workspace">Open workspace</Link>
          </Button>
        </>
      )}

      {!state.isLoading && !building && waiting && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="size-4 text-primary" />
          Waiting for your match to confirm.
        </p>
      )}

      {!state.isLoading && !building && !waiting && (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Both founders need to agree before a shared workspace is created.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => decide.mutate(true)} disabled={decide.isPending}>
              {decide.isPending && <Loader2 className="size-4 animate-spin" />}
              Start building together
            </Button>
            <Button
              variant="outline"
              onClick={() => decide.mutate(false)}
              disabled={decide.isPending}
            >
              Continue exploring
            </Button>
          </div>
          {s?.partner_status === "accepted" && (
            <p className="mt-2 text-xs text-muted-foreground">
              {partnerName} is ready to build together.
            </p>
          )}
        </>
      )}
    </div>
  );
}
