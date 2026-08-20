import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  directionQueryKey,
  EMPTY_DIRECTION,
  fetchProjectDirection,
  saveProjectDirection,
  type DirectionDraft,
} from "@/lib/collab";
import { cn } from "@/lib/utils";

const FIELDS: { key: keyof DirectionDraft; label: string; placeholder: string; long?: boolean }[] =
  [
    { key: "problem", label: "Problem to solve", placeholder: "What pain are you attacking?", long: true },
    { key: "target_users", label: "Target users", placeholder: "Who feels this problem most?", long: true },
    { key: "solution", label: "Proposed solution", placeholder: "What will you build first?", long: true },
    { key: "why_now", label: "Why now?", placeholder: "What makes this the right moment?", long: true },
    { key: "notes", label: "Notes", placeholder: "Anything else you both agreed on", long: true },
  ];

/** Shared, collaboratively edited project direction for a match. */
export function ProjectDirectionCard({
  userId,
  matchId,
  className,
}: {
  userId: string;
  matchId: string;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<DirectionDraft>(EMPTY_DIRECTION);
  const [dirty, setDirty] = useState(false);

  const direction = useQuery({
    queryKey: directionQueryKey(userId, matchId),
    queryFn: () => fetchProjectDirection(matchId),
  });

  // Keep the form in sync with the shared row until the founder starts editing.
  useEffect(() => {
    if (dirty) return;
    const d = direction.data;
    setDraft(
      d
        ? {
            project_title: d.project_title,
            problem: d.problem,
            target_users: d.target_users,
            solution: d.solution,
            why_now: d.why_now,
            notes: d.notes,
          }
        : EMPTY_DIRECTION,
    );
  }, [direction.data, dirty]);

  const save = useMutation({
    mutationFn: () => saveProjectDirection(matchId, draft),
    onSuccess: (row) => {
      setDirty(false);
      queryClient.setQueryData(directionQueryKey(userId, matchId), row);
      toast.success("Project direction saved for both founders");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  const set = (key: keyof DirectionDraft, value: string) => {
    setDirty(true);
    setDraft((d) => ({ ...d, [key]: value }));
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-soft", className)}>
      <div className="flex items-center gap-2">
        <Target className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Shared Project Direction</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {direction.isLoading
          ? "Loading shared direction…"
          : direction.data
            ? "Both founders can view and edit this."
            : "No shared project direction yet — start it below."}
      </p>

      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!save.isPending) save.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="direction-title">Project title</Label>
          <Input
            id="direction-title"
            value={draft.project_title}
            onChange={(e) => set("project_title", e.target.value)}
            placeholder="Working name for what you'd build"
          />
        </div>
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`direction-${f.key}`}>{f.label}</Label>
            <Textarea
              id={`direction-${f.key}`}
              value={draft[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              rows={3}
            />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save direction
          </Button>
          {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
        </div>
      </form>
    </div>
  );
}
