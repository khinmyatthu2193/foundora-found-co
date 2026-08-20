import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Lock, ShieldCheck } from "lucide-react";
import { avatarSignedUrl } from "@/lib/profile";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/foundora-logo.png.asset.json";

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
        className="h-9 w-auto md:h-10"
        loading="eager"
        decoding="async"
      />
    </span>
  );
}

/* --------------------------- avatars & trust ------------------------------ */

export function useAvatarUrl(path: string | null | undefined) {
  const { data } = useQuery({
    queryKey: ["avatar-url", path ?? ""],
    queryFn: () => avatarSignedUrl(path ?? null),
    enabled: Boolean(path),
    staleTime: 45 * 60 * 1000,
  });
  return data ?? null;
}

function initials(name: string) {
  const clean = name.replace(/[^A-Za-z0-9 ]/g, "").trim();
  if (!clean) return "F";
  const parts = clean.split(/\s+/);
  return (parts.length > 1
    ? `${parts[0]![0]}${parts[1]![0]}`
    : clean.slice(0, 2)
  ).toUpperCase();
}

export function FounderAvatar({
  path,
  name,
  size = "md",
  className,
}: {
  path?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const url = useAvatarUrl(path);
  const dim = size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-20 text-xl" : "size-11 text-sm";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 font-semibold text-primary",
        dim,
        className,
      )}
    >
      {url ? (
        <img src={url} alt={`${name}'s anonymous avatar`} className="size-full object-cover" loading="lazy" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export type TrustFlagsView = {
  email_verified?: boolean;
  has_linkedin?: boolean;
  has_github?: boolean;
  has_portfolio?: boolean;
};

export function TrustBadges({ flags, className }: { flags: TrustFlagsView; className?: string }) {
  const items = [
    flags.email_verified ? "Email verified" : null,
    flags.has_linkedin ? "LinkedIn added" : null,
    flags.has_github ? "GitHub added" : null,
    flags.has_portfolio ? "Portfolio added" : null,
  ].filter(Boolean) as string[];

  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((label) => (
        <span
          key={label}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
        >
          <BadgeCheck className="size-3" />
          {label}
        </span>
      ))}
    </div>
  );
}
