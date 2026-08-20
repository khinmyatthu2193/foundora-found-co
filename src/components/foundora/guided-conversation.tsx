import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Lock, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compatibilityQueryKey, fetchCompatibilityReport } from "@/lib/compatibility";
import { cn } from "@/lib/utils";

const FALLBACK_PROMPTS = [
  "What problem do you both care most about solving?",
  "How should responsibilities be divided between you?",
  "What commitment level can each of you realistically give?",
  "Which startup idea should be prioritised first?",
];

/**
 * Turns the saved compatibility report's suggested topics into a guided
 * conversation checklist. Premium-only, like the report itself.
 */
export function GuidedConversation({
  userId,
  matchId,
  premium,
  className,
}: {
  userId: string;
  matchId: string;
  premium: boolean;
  className?: string;
}) {
  const report = useQuery({
    queryKey: compatibilityQueryKey(userId, matchId),
    queryFn: () => fetchCompatibilityReport(matchId),
  });

  const topics = report.data?.discussion_topics ?? [];
  const prompts = [...topics, ...FALLBACK_PROMPTS].slice(0, 6);

  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        premium && report.data
          ? "border-border bg-card shadow-soft"
          : "border-dashed border-border bg-muted/40",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {premium ? (
          <MessagesSquare className="size-4 text-primary" />
        ) : (
          <Lock className="size-4 text-muted-foreground" />
        )}
        <h3 className="text-sm font-semibold">AI Guided Conversation</h3>
      </div>

      {!premium && (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Founder Pro required for guided conversation prompts.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/app/profile">Try Founder Pro</Link>
          </Button>
        </>
      )}

      {premium && report.isLoading && (
        <p className="mt-2 text-sm text-muted-foreground">Loading prompts…</p>
      )}

      {premium && !report.isLoading && !report.data && (
        <p className="mt-2 text-sm text-muted-foreground">Generate AI compatibility first.</p>
      )}

      {premium && report.data && (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Work through these together before committing to build.
          </p>
          <ol className="mt-3 space-y-2">
            {prompts.map((prompt, i) => (
              <li key={prompt} className="flex gap-3 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span>{prompt}</span>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
