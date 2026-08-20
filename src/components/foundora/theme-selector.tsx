import { Check } from "lucide-react";
import { THEMES, useTheme } from "@/lib/foundora";
import { cn } from "@/lib/utils";

export function ThemeSelector({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", compact && "gap-1.5")}>
      {THEMES.map((t) => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            aria-pressed={active}
            className={cn(
              "group flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all",
              compact && "px-2.5 py-1 text-xs",
              active
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <span className="flex -space-x-1">
              {t.swatch.map((c) => (
                <span
                  key={c}
                  className="size-3 rounded-full border border-border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </span>
            <span className="font-medium">{t.label}</span>
            {active && <Check className="size-3.5 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
