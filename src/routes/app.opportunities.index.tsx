import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Filter, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState, Section, Tag } from "@/components/foundora/ui-bits";
import { fetchOpportunities, INDUSTRIES } from "@/lib/opportunities";

export const Route = createFileRoute("/app/opportunities/")({
  head: () => ({
    meta: [
      { title: "Business opportunities — Foundora" },
      {
        name: "description",
        content: "Browse founder-posted business opportunities and startup ideas on Foundora.",
      },
      { property: "og:title", content: "Business opportunities — Foundora" },
      {
        property: "og:description",
        content: "Discover opportunities to join a startup as a co-founder or early team member.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<string | "all">("all");

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: fetchOpportunities,
  });

  const filtered = useMemo(() => {
    if (!opportunities) return [];
    const q = query.trim().toLowerCase();
    return opportunities.filter((o) => {
      const matchesIndustry = industry === "all" || o.industry === industry;
      const matchesQuery =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.industry.toLowerCase().includes(q) ||
        o.shortDescription.toLowerCase().includes(q) ||
        o.skillsNeeded.some((s) => s.toLowerCase().includes(q));
      return matchesIndustry && matchesQuery;
    });
  }, [opportunities, query, industry]);

  return (
    <Section
      className="pt-8"
      title="Business opportunities"
      description="Explore opportunities to join a startup as a co-founder or early contributor. Identities stay anonymous until you connect."
      action={
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase className="size-4" />
          <span className="text-sm font-medium">{opportunities?.length ?? 0} listed</span>
        </div>
      }
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, industry, or skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All industries</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="border-border shadow-soft">
              <CardContent className="space-y-3 p-6">
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-20 w-full animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={<Briefcase className="size-8" />}
          title="No opportunities found"
          description="Try adjusting your search or filter. New opportunities are added every week."
          action={
            <Button variant="outline" onClick={() => { setQuery(""); setIndustry("all"); }}>
              Clear filters
            </Button>
          }
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <Card
              key={o.id}
              className="flex flex-col border-border shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <CardContent className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Tag tone="primary" className="mb-2">
                      {o.industry}
                    </Tag>
                    <h3 className="text-lg font-semibold leading-tight">{o.title}</h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{o.shortDescription}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    <span>{o.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Investment</span>
                    <span className="font-medium">{o.investmentRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Stage</span>
                    <span className="font-medium">{o.stage}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Skills needed</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {o.skillsNeeded.map((s) => (
                      <Tag key={s} tone="muted">
                        {s}
                      </Tag>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-3">
                  <Button asChild className="w-full">
                    <Link to="/app/opportunities/$id" params={{ id: o.id }}>
                      View details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
