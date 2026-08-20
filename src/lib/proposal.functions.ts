import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * AI startup proposal for a mutual match.
 *
 * Only anonymous data leaves the database: profile preference attributes, the
 * saved compatibility report and the shared project direction both founders
 * wrote. Emails, real names and account ids are never sent to the model.
 */
export const generateStartupProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { matchId: string }) => {
    if (!data?.matchId || typeof data.matchId !== "string") {
      throw new Error("A match is required.");
    }
    return { matchId: data.matchId };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: rows, error } = await supabase.rpc("match_compatibility_inputs", {
      p_match_id: data.matchId,
    });
    if (error) throw new Error("Could not load this match.");
    const input = (rows ?? [])[0];
    if (!input) throw new Error("You are not part of this match.");
    if (!input.me_premium) {
      throw new Error("Founder Pro required to generate AI proposal.");
    }

    const { data: direction } = await supabase
      .from("shared_project_directions")
      .select("project_title, problem, target_users, solution, why_now, notes")
      .eq("match_id", data.matchId)
      .maybeSingle();

    // Prefer the shared workspace once the founders decided to build together.
    const { data: collab } = await supabase
      .from("founder_collaborations")
      .select("id")
      .eq("match_id", data.matchId)
      .maybeSingle();

    let workspace: {
      project_name: string;
      problem: string;
      target_users: string;
      solution: string;
      stage: string;
      goals: unknown;
    } | null = null;
    let roles: string[] = [];

    if (collab?.id) {
      const { data: ws } = await supabase
        .from("workspaces")
        .select("id, project_name, problem, target_users, solution, stage, goals")
        .eq("collaboration_id", collab.id)
        .maybeSingle();
      if (ws) {
        workspace = ws;
        const { data: members } = await supabase
          .from("workspace_members")
          .select("role")
          .eq("workspace_id", ws.id);
        roles = (members ?? []).map((m) => m.role).filter(Boolean);
      }
    }

    const workspaceReady = Boolean(
      workspace?.project_name?.trim() &&
        workspace?.problem?.trim() &&
        workspace?.target_users?.trim() &&
        workspace?.solution?.trim(),
    );
    const directionReady = Boolean(
      direction?.project_title?.trim() &&
        direction?.problem?.trim() &&
        direction?.target_users?.trim() &&
        direction?.solution?.trim(),
    );

    if (!workspaceReady && !directionReady) {
      throw new Error("Complete your project details before generating a proposal.");
    }


    const { data: report } = await supabase
      .from("compatibility_reports")
      .select("score, strengths, challenges, discussion_topics")
      .eq("match_id", data.matchId)
      .maybeSingle();

    const apiKey = process.env["OPENROUTER_API_KEY"];
    if (!apiKey) throw new Error("AI analysis is not configured yet.");

    const founder = (p: "a" | "b") => ({
      skills: p === "a" ? input.a_skills : input.b_skills,
      industries: p === "a" ? input.a_industries : input.b_industries,
      experience: p === "a" ? input.a_experience : input.b_experience,
      availability_hours_per_week: p === "a" ? input.a_hours : input.b_hours,
      working_style: p === "a" ? input.a_working_style : input.b_working_style,
      commitment: p === "a" ? input.a_commitment : input.b_commitment,
    });

    const prompt = `You are a startup advisor. Write a concise startup proposal for two anonymous co-founders. Return JSON only.

Founder A: ${JSON.stringify(founder("a"))}
Founder B: ${JSON.stringify(founder("b"))}
Compatibility: ${JSON.stringify(report ?? "not generated")}
Shared project direction: ${JSON.stringify(direction)}

Return strictly this JSON shape:
{"concept_summary": "<2 sentences>", "problem": "<1-2 sentences>", "target_users": "<1-2 sentences>", "solution": "<2 sentences>", "founder_roles": ["Founder A — ...", "Founder B — ..."], "mvp_scope": [3-5 short strings], "plan_30_days": ["Week 1 — ...", "Week 2 — ...", "Week 3 — ...", "Week 4 — ..."], "key_risks": [3 short strings]}`;

    let payload: {
      concept_summary: string;
      problem: string;
      target_users: string;
      solution: string;
      founder_roles: string[];
      mvp_scope: string[];
      plan_30_days: string[];
      key_risks: string[];
    };

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "Respond with valid JSON only. No markdown." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        console.error("[proposal] OpenRouter error", res.status, await res.text());
        throw new Error("The AI service is busy. Please try again in a moment.");
      }
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const raw = json.choices?.[0]?.message?.content ?? "";
      const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
      const list = (v: unknown) =>
        Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean).slice(0, 8) : [];
      payload = {
        concept_summary: text(parsed["concept_summary"]),
        problem: text(parsed["problem"]),
        target_users: text(parsed["target_users"]),
        solution: text(parsed["solution"]),
        founder_roles: list(parsed["founder_roles"]),
        mvp_scope: list(parsed["mvp_scope"]),
        plan_30_days: list(parsed["plan_30_days"]),
        key_risks: list(parsed["key_risks"]),
      };
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("The AI service")) throw e;
      console.error("[proposal] generation failed", e);
      throw new Error("Could not generate the startup proposal. Please try again.");
    }

    const { data: saved, error: saveError } = await supabase
      .from("startup_proposals")
      .upsert(
        { match_id: data.matchId, created_by: userId, proposal_json: payload },
        { onConflict: "match_id" },
      )
      .select("id, match_id, proposal_json, created_at, updated_at")
      .single();

    if (saveError) {
      console.error("[proposal] save failed", saveError);
      throw new Error("The proposal could not be saved. Please try again.");
    }

    return saved;
  });
