import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  directionIsReady,
  directionQueryKey,
  fetchProjectDirection,
  fetchStartupProposal,
  proposalQueryKey,
  type ProposalRow,
} from "@/lib/collab";
import { generateStartupProposal } from "@/lib/proposal.functions";
import { cn } from "@/lib/utils";

function Block({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** AI startup proposal built from the compatibility report + shared direction. */
export function ProposalCard({
  userId,
  matchId,
  premium,
  className,
  readyOverride,
  notReadyText,
}: {
  userId: string;
  matchId: string;
  premium: boolean;
  className?: string;
  /** When provided, replaces the shared-direction readiness check. */
  readyOverride?: boolean;
  notReadyText?: string;
}) {
  const queryClient = useQueryClient();
  const generate = useServerFn(generateStartupProposal);

  const proposal = useQuery({
    queryKey: proposalQueryKey(userId, matchId),
    queryFn: () => fetchStartupProposal(matchId),
  });

  const direction = useQuery({
    queryKey: directionQueryKey(userId, matchId),
    queryFn: () => fetchProjectDirection(matchId),
    enabled: readyOverride === undefined,
  });

  const run = useMutation({
    mutationFn: () => generate({ data: { matchId } }),
    onSuccess: (row) => {
      queryClient.setQueryData(proposalQueryKey(userId, matchId), row as ProposalRow);
      toast.success("Startup proposal ready");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not generate the proposal."),
  });

  const data = proposal.data?.proposal_json;
  const ready = readyOverride ?? directionIsReady(direction.data);

  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        premium || data
          ? "border-primary/30 bg-primary/5"
          : "border-dashed border-border bg-muted/40",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {premium || data ? (
          <FileText className="size-4 text-primary" />
        ) : (
          <Lock className="size-4 text-muted-foreground" />
        )}
        <h3 className="text-sm font-semibold">AI Startup Proposal</h3>
      </div>

      {proposal.isLoading && (
        <p className="mt-2 text-sm text-muted-foreground">Loading proposal…</p>
      )}

      {run.isPending && (
        <p className="mt-2 text-sm text-muted-foreground">
          AI is creating your startup direction…
        </p>
      )}

      {!proposal.isLoading && !data && (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            {!premium
              ? "Founder Pro required to generate AI startup proposals."
              : ready
                ? "Generate your startup proposal with AI."
                : (notReadyText ?? "Complete project direction before generating proposal.")}
          </p>
          {premium ? (
            <Button
              className="mt-3"
              onClick={() => run.mutate()}
              disabled={run.isPending || !ready}
            >
              {run.isPending && <Loader2 className="size-4 animate-spin" />}
              {run.isPending ? "Writing proposal…" : "Generate proposal"}
            </Button>
          ) : (
            <Button asChild variant="outline" className="mt-3">
              <Link to="/app/profile">Try Founder Pro</Link>
            </Button>
          )}
        </>
      )}

      {data && (
        <div className="mt-4 space-y-4">
          <Block title="Startup concept" text={data.concept_summary} />
          <Block title="Problem" text={data.problem} />
          <Block title="Target users" text={data.target_users} />
          <Block title="Solution" text={data.solution} />
          <ListBlock title="Founder roles" items={data.founder_roles} />
          <ListBlock title="MVP scope" items={data.mvp_scope} />
          <ListBlock title="30-day plan" items={data.plan_30_days} />
          <ListBlock title="Key risks" items={data.key_risks} />
          {premium && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => run.mutate()}
              disabled={run.isPending || !ready}
            >
              {run.isPending && <Loader2 className="size-4 animate-spin" />}
              Regenerate
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
