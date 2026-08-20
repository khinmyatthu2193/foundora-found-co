import { Check, Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { THEMES, useAppearance, useTheme } from "@/lib/foundora";
import { cn } from "@/lib/utils";

/** Compact colour-theme dropdown (Sky / Lavender / Neutral). */
export function ThemeSelector({
  showLabel = true,
  className,
}: {
  showLabel?: boolean;
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const current = THEMES.find((t) => t.id === theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Choose colour theme"
          className={cn("gap-2", className)}
        >
          <Palette className="size-4 text-primary" />
          {showLabel && <span className="hidden sm:inline">{current?.label ?? "Sky"}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Colour theme</DropdownMenuLabel>
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onSelect={() => setTheme(t.id)}
            className="flex items-center gap-2"
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
            <span className="flex-1">{t.label}</span>
            {theme === t.id && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Compact light/dark appearance toggle. */
export function AppearanceToggle({ className }: { className?: string }) {
  const { appearance, toggleAppearance } = useAppearance();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleAppearance}
      aria-label={appearance === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
    >
      {appearance === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}

/** Theme + appearance controls grouped together. */
export function ThemeControls({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <ThemeSelector />
      <AppearanceToggle />
    </div>
  );
}
