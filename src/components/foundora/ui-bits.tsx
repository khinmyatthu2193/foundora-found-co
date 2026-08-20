import { Lock, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tag({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "primary" | "muted";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "primary" && "bg-primary/12 text-primary",
        tone === "default" && "surface-panel",
        tone === "muted" && "bg-muted text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PrivacyBadge({ label = "Identity protected" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <ShieldCheck className="size-3.5 text-primary" />
      {label}
    </span>
  );
}

export function PrivateField({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-primary uppercase">
      <Lock className="size-3" />
      {children}
    </span>
  );
}

export function Section({
  title,
  description,
  children,
  className,
  action,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14", className)}>
      {(title || action) && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            {title && <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>}
            {description && (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function JourneyProgress({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-x-2 gap-y-2 text-xs sm:text-sm", className)}>
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-3 py-1 font-medium transition-colors",
              i < current && "border-primary/30 bg-primary/10 text-primary",
              i === current && "border-primary bg-primary text-primary-foreground",
              i > current && "border-border bg-card text-muted-foreground",
            )}
          >
            {s}
          </span>
          {i < steps.length - 1 && <span className="text-muted-foreground/50">›</span>}
        </li>
      ))}
    </ol>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      {icon && <div className="mb-3 text-primary">{icon}</div>}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center", className)}>
      <img
        src={logoAsset.url}
        alt="Foundora — find, match, build"
        className="h-9 w-auto"
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
