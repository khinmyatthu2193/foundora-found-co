import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeCompatibility, scoreBand } from "@/lib/compatibility-score";


/**
 * AI compatibility analysis for a mutual match.
 *
 * Only anonymous, profile-preference data is sent to the model: skills,
 * industries, experience, availability, working style, commitment and desired
 * partner traits. Emails, real names, private ideas and account ids never
 * leave the database.
 */
export const generateCompatibilityReport = createServerFn({ method: "POST" })
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
      throw new Error("Founder Pro required for AI compatibility insights.");
    }

    const apiKey = process.env["OPENROUTER_API_KEY"];
    if (!apiKey) throw new Error("AI analysis is not configured yet.");

    const founder = (p: "a" | "b") => ({
      skills: p === "a" ? input.a_skills : input.b_skills,
      industries: p === "a" ? input.a_industries : input.b_industries,
      experience: p === "a" ? input.a_experience : input.b_experience,
      availability_hours_per_week: p === "a" ? input.a_hours : input.b_hours,
      working_style: p === "a" ? input.a_working_style : input.b_working_style,
      commitment: p === "a" ? input.a_commitment : input.b_commitment,
      desired_partner_traits: p === "a" ? input.a_traits : input.b_traits,
    });

    // Deterministic score — the AI never decides this number.
    const { score, breakdown } = computeCompatibility(
      {
        skills: input.a_skills,
        industries: input.a_industries,
        experience: input.a_experience,
        hours: input.a_hours,
        workingStyle: input.a_working_style,
        commitment: input.a_commitment,
        traits: input.a_traits,
      },
      {
        skills: input.b_skills,
        industries: input.b_industries,
        experience: input.b_experience,
        hours: input.b_hours,
        workingStyle: input.b_working_style,
        commitment: input.b_commitment,
        traits: input.b_traits,
      },
    );
    const band = scoreBand(score);

    const prompt = `You are a co-founder matching analyst. The compatibility score has ALREADY been computed by a deterministic algorithm. Do not invent or change it — explain it.

Computed compatibility score: ${score}/100 (${band})
Score breakdown (dimension, weight %, sub-score 0-100):
${breakdown.map((d) => `- ${d.label} (${d.weight}%): ${d.value}`).join("\n")}

Founder A: ${JSON.stringify(founder("a"))}
Founder B: ${JSON.stringify(founder("b"))}

Write strengths and challenges that are consistent with the breakdown above: high sub-scores become strengths, low sub-scores become challenges. Keep the tone matched to the ${band.toLowerCase()} result.

Return strictly this JSON shape:
{"strengths": [3 short strings], "challenges": [3 short strings], "discussion_topics": [4 short questions they should discuss]}`;

    let payload: {
      score: number;
      strengths: string[];
      challenges: string[];
      discussion_topics: string[];
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
        console.error("[compatibility] OpenRouter error", res.status, await res.text());
        throw new Error("The AI service is busy. Please try again in a moment.");
      }
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = json.choices?.[0]?.message?.content ?? "";
      const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      const list = (v: unknown) =>
        Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean).slice(0, 6) : [];
      payload = {
        score,
        strengths: list(parsed["strengths"]),
        challenges: list(parsed["challenges"]),
        discussion_topics: list(parsed["discussion_topics"]),
      };
    } catch (e) {

      if (e instanceof Error && e.message.startsWith("The AI service")) throw e;
      console.error("[compatibility] generation failed", e);
      throw new Error("Could not generate the compatibility report. Please try again.");
    }

    const { data: saved, error: saveError } = await supabase
      .from("compatibility_reports")
      .upsert(
        { match_id: data.matchId, created_by: userId, ...payload },
        { onConflict: "match_id" },
      )
      .select("id, match_id, score, strengths, challenges, discussion_topics, created_at")
      .single();

    if (saveError) {
      console.error("[compatibility] save failed", saveError);
      throw new Error("The report could not be saved. Please try again.");
    }

    return saved;
  });
