import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, MapPin, Search, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PremiumGate } from "@/components/foundora/premium-gate";
import { EmptyState, Section, Tag } from "@/components/foundora/ui-bits";
import { fetchFranchises, formatInvestmentRange, franchiseListQueryKey } from "@/lib/franchise";
import { fetchMyPlan, planQueryKey } from "@/lib/premium";

export const Route = createFileRoute("/app/franchise/")({
  head: () => ({
    meta: [
      { title: "Franchise marketplace — Foundora" },
      {
        name: "description",
        content:
          "Founder Pro members browse verified franchise opportunities and request contact with franchise companies.",
      },
      { property: "og:title", content: "Franchise marketplace — Foundora" },
      {
        property: "og:description",
        content: "Discover franchise opportunities and connect with business owners on Foundora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FranchisePage,
});

function FranchisePage() {
  const { user } = Route.useRouteContext();
  const [query, setQuery] = useState("");

  const plan = useQuery({
    queryKey: planQueryKey(user.id),
    queryFn: () => fetchMyPlan(user.id),
  });
  const premium = plan.data === "premium";

  const franchises = useQuery({
    queryKey: franchiseListQueryKey(user.id),
    queryFn: fetchFranchises,
    enabled: premium,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (franchises.data ?? []).filter(
      (f) =>
        !q ||
        f.company_name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.available_locations.some((l) => l.toLowerCase().includes(q)),
    );
  }, [franchises.data, query]);

  return (
    <Section
      className="pt-8"
      title="Franchise marketplace"
      description="Explore franchise opportunities and request contact with the company. Your details are only shared when you confirm a request."
      action={
        <div className="flex items-center gap-2 text-muted-foreground">
          <Store className="size-4" />
          <span className="text-sm font-medium">
            {premium ? `${franchises.data?.length ?? 0} listed` : "Founder Pro"}
          </span>
        </div>
      }
    >
      {plan.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !premium ? (
        <PremiumGate />
      ) : franchises.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading franchise opportunities…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-6" />}
          title="No franchises yet"
          description="New franchise opportunities will appear here as companies are added."
        />
      ) : (
        <>
          <div className="relative mb-6 max-w-md">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, category or location…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => (
              <Card key={f.id} className="border-border shadow-soft">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-primary/10">
                      {f.logo_url ? (
                        <img
                          src={f.logo_url}
                          alt={`${f.company_name} logo`}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Building2 className="size-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold">{f.company_name}</h3>
                      <p className="text-xs text-muted-foreground">{f.category}</p>
                    </div>
                  </div>

                  <p className="line-clamp-3 text-sm text-muted-foreground">{f.description}</p>

                  <dl className="space-y-1 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Investment</dt>
                      <dd className="font-medium">
                        {formatInvestmentRange(f.investment_min_mmk, f.investment_max_mmk)}
                      </dd>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="size-3.5" />
                      <span>{f.available_locations.join(" / ") || "—"}</span>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-1.5">
                    {f.support_details.slice(0, 3).map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>

                  <Button asChild className="mt-auto w-full">
                    <Link to="/app/franchise/$id" params={{ id: f.id }}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
