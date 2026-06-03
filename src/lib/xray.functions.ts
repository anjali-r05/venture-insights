import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const StartupInput = z.object({
  startup_name: z.string().min(1).max(200),
  industry: z.string().min(1).max(200),
  startup_stage: z.string().min(1).max(50),
  description: z.string().min(10).max(4000),
  problem: z.string().min(5).max(3000),
  target_audience: z.string().min(3).max(2000),
  revenue_model: z.string().min(1).max(200),
  competitors: z.string().min(1).max(2000),
});

const SYSTEM_PROMPT = `You are an elite startup analyst combining the rigor of a Y Combinator partner, the skepticism of a Tier-1 venture capitalist, and the strategic depth of a seasoned startup advisor.

Perform a professional due diligence review of the startup. Be objective, sharp, specific, and practical. Avoid generic platitudes and motivational language. No business-plan fluff.

Return STRICT JSON matching this schema (no markdown, no commentary):
{
  "health_score": number (0-100),
  "assessment": "High Potential" | "Promising" | "Needs Validation" | "High Risk",
  "summary": string (1-2 sharp sentences),
  "strengths": [{ "title": string, "detail": string }],            // 3-5 items
  "risks": [{ "title": string, "detail": string, "severity": "Low"|"Medium"|"High" }], // 3-6
  "blind_spots": [{ "title": string, "detail": string }],          // 3-5
  "opportunities": [{ "title": string, "detail": string }],        // 3-5
  "validation_steps": [
    { "week": 1, "title": string, "actions": [string] },
    { "week": 2, "title": string, "actions": [string] },
    { "week": 3, "title": string, "actions": [string] },
    { "week": 4, "title": string, "actions": [string] }
  ],
  "strategic_recommendations": [{ "title": string, "detail": string }], // 3-5
  "investor_questions": [string]                                    // 5-8 sharp questions a VC would actually ask
}`;

export const analyzeStartup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => StartupInput.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service not configured");

    const userPrompt = `Startup: ${data.startup_name}
Industry: ${data.industry}
Stage: ${data.startup_stage}

Description:
${data.description}

Problem being solved:
${data.problem}

Target audience:
${data.target_audience}

Revenue model: ${data.revenue_model}

Competitors:
${data.competitors}

Produce the Startup X-Ray JSON now.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI error (${res.status}): ${t.slice(0, 200)}`);
    }

    const payload = await res.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned empty response");

    let analysis: any;
    try { analysis = typeof content === "string" ? JSON.parse(content) : content; }
    catch { throw new Error("AI returned invalid JSON"); }

    // Persist startup
    const { supabase, userId } = context;
    const { data: startupRow, error: sErr } = await supabase
      .from("startups")
      .insert({
        user_id: userId,
        startup_name: data.startup_name,
        industry: data.industry,
        startup_stage: data.startup_stage,
        description: data.description,
        problem: data.problem,
        target_audience: data.target_audience,
        revenue_model: data.revenue_model,
        competitors: data.competitors,
      })
      .select()
      .single();
    if (sErr || !startupRow) throw new Error(sErr?.message ?? "Failed to save startup");

    const { data: reportRow, error: rErr } = await supabase
      .from("startup_reports")
      .insert({
        startup_id: startupRow.id,
        user_id: userId,
        health_score: Math.round(analysis.health_score ?? 0),
        strengths: analysis.strengths ?? [],
        risks: analysis.risks ?? [],
        blind_spots: analysis.blind_spots ?? [],
        opportunities: analysis.opportunities ?? [],
        validation_steps: analysis.validation_steps ?? [],
        strategic_recommendations: analysis.strategic_recommendations ?? [],
        investor_questions: analysis.investor_questions ?? [],
      })
      .select()
      .single();
    if (rErr || !reportRow) throw new Error(rErr?.message ?? "Failed to save report");

    return { reportId: reportRow.id as string };
  });
