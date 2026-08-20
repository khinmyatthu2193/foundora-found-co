import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  compatibilityQueryKey,
  fetchCompatibilityReport,
  type CompatibilityReport,
} from "@/lib/compatibility";
import { generateCompatibilityReport } from "@/lib/compatibility.functions";
import { cn } from "@/lib/utils";

function ReportList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
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

export function CompatibilityCard({
  userId,
  matchId,
  premium,
  otherName,
  className,
}: {
  userId: string;
  matchId: string;
  premium: boolean;
  otherName: string;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const generate = useServerFn(generateCompatibilityReport);

  const report = useQuery({
    queryKey: compatibilityQueryKey(userId, matchId),
    queryFn: () => fetchCompatibilityReport(matchId),
  });

  const run = useMutation({
    mutationFn: () => generate({ data: { matchId } }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        compatibilityQueryKey(userId, matchId),
        data as CompatibilityReport,
      );
      toast.success("Compatibility analysis ready");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not generate the report."),
  });

  const data = report.data;

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
          <Sparkles className="size-4 text-primary" />
        ) : (
          <Lock className="size-4 text-muted-foreground" />
        )}
        <h3 className="text-sm font-semibold">AI Compatibility Analysis</h3>
      </div>

      {report.isLoading && (
        <p className="mt-2 text-sm text-muted-foreground">Loading analysis…</p>
      )}

      {!report.isLoading && !data && (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            {premium
              ? `Discover your founder compatibility with ${otherName}.`
              : "Founder Pro required for AI compatibility insights."}
          </p>
          {premium ? (
            <Button className="mt-3" onClick={() => run.mutate()} disabled={run.isPending}>
              {run.isPending && <Loader2 className="size-4 animate-spin" />}
              {run.isPending ? "Analyzing…" : "Analyze Compatibility"}
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
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-primary">{data.score}%</span>
            <span className="text-sm text-muted-foreground">compatibility score</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${data.score}%` }} />
          </div>
          <ReportList title="Strengths" items={data.strengths} />
          <ReportList title="Challenges" items={data.challenges} />
          <ReportList title="Suggested topics" items={data.discussion_topics} />
          {premium && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => run.mutate()}
              disabled={run.isPending}
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
