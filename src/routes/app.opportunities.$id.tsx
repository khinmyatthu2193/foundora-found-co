import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, DollarSign, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, Section, Tag } from "@/components/foundora/ui-bits";
import { fetchOpportunityById } from "@/lib/opportunities";

export const Route = createFileRoute("/app/opportunities/$id")({
  head: ({ params }) => ({
    meta: [
      { title: "Opportunity — Foundora" },
      {
        name: "description",
        content: "View details of a founder-posted business opportunity on Foundora.",
      },
      { property: "og:title", content: "Opportunity — Foundora" },
      {
        property: "og:description",
        content: "Discover co-founder opportunities and startup ideas on Foundora.",
      },
    ],
  }),
  component: OpportunityDetailPage,
});

function OpportunityDetailPage() {
  const { id } = Route.useParams();
  const { data: opportunity, isLoading } = useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => fetchOpportunityById(id),
  });

  if (isLoading) {
    return (
      <Section className="pt-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-32 w-full animate-pulse rounded bg-muted" />
        </div>
      </Section>
    );
  }

  if (!opportunity) {
    return (
      <Section className="pt-8">
        <EmptyState
          icon={<Briefcase className="size-8" />}
          title="Opportunity not found"
          description="This opportunity may have been removed or the link is incorrect."
          action={
            <Button asChild>
              <Link to="/app/opportunities">Browse opportunities</Link>
            </Button>
          }
        />
      </Section>
    );
  }

  return (
    <Section className="pt-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/app/opportunities">
          <ArrowLeft className="size-4" />
          Back to opportunities
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <Tag tone="primary" className="mb-3">
              {opportunity.industry}
            </Tag>
            <h1 className="text-2xl font-semibold md:text-3xl">{opportunity.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Posted by {opportunity.founderAlias} · {opportunity.postedAt}
            </p>

            <div className="mt-6 space-y-4 text-sm md:text-base">
              <h2 className="text-lg font-semibold">About this opportunity</h2>
              <p className="leading-relaxed text-foreground">{opportunity.fullDescription}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <h2 className="text-lg font-semibold">Skills needed</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {opportunity.skillsNeeded.map((s) => (
                <Tag key={s} tone="primary">
                  {s}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-border shadow-soft">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Key details</h2>

              <div className="flex items-start gap-3">
                <DollarSign className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Investment range</p>
                  <p className="font-medium">{opportunity.investmentRange}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{opportunity.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Stage</p>
                  <p className="font-medium">{opportunity.stage}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Current team</p>
                  <p className="font-medium">{opportunity.teamSize}</p>
                </div>
              </div>

              {opportunity.equityOffered && (
                <div className="flex items-start gap-3">
                  <DollarSign className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Equity offered</p>
                    <p className="font-medium">{opportunity.equityOffered}</p>
                  </div>
                </div>
              )}

              {opportunity.traction && (
                <div className="flex items-start gap-3">
                  <Briefcase className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Traction</p>
                    <p className="font-medium">{opportunity.traction}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Interested?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                If this opportunity fits your skills, connect with the founder to start a conversation.
              </p>
              <Button className="mt-4 w-full" asChild>
                <Link to="/app/discover">Find this founder in Discover</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
