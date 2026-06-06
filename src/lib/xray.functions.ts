import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
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

const SYSTEM_PROMPT = `You are an elite startup analyst combining the rigor of a Y Combinator partner, the skepticism of a Tier-1 venture capitalist, and the depth of a senior startup operator. You produce investor-grade due diligence reports.

Rules:
- Be sharp, specific, evidence-driven. No fluff. No motivational language. No filler.
- Every insight must be practical and actionable for the founder.
- NEVER leave a field blank. If information is missing, infer plausibly and state the assumption.
- Opportunities MUST be REAL-WORLD: name actual accelerators, incubators, startup programs, communities, university networks, grant programs, government initiatives, partnerships, distribution channels, or concrete industry/technology trends relevant to the startup. No generic advice.
- Use exactly these enum values for risk_level / market_readiness / execution_readiness: "Very Low" | "Low" | "Medium" | "High" | "Excellent".

Return STRICT JSON (no markdown) matching exactly:
{
  "executive_summary": string (MAX 120 words; cover startup overview, most critical risk, biggest opportunity, primary recommendation, immediate next step — flowing prose),
  "health_score": number (0-100),
  "readiness": {
    "risk_level": "Very Low" | "Low" | "Medium" | "High" | "Excellent",
    "market_readiness": "Very Low" | "Low" | "Medium" | "High" | "Excellent",
    "execution_readiness": "Very Low" | "Low" | "Medium" | "High" | "Excellent"
  },
  "verdict": {
    "label": "Investor Ready" | "High Potential" | "Promising" | "Needs Validation" | "High Risk",
    "confidence": number (0-100),
    "reasoning": string (2-3 sentences explaining the verdict)
  },
  "top_priorities": [
    { "title": string, "reason": string, "impact": "High"|"Medium"|"Low", "difficulty": "Low"|"Medium"|"High", "time_required": string, "priority_level": "Critical"|"High"|"Medium" }
  ] (EXACTLY 3, ordered by priority),
  "strengths": [
    { "title": string, "detail": string, "strategic_importance": string, "impact": "High"|"Medium"|"Low" }
  ] (3-5, startup-specific, not generic),
  "risks": [
    { "title": string, "detail": string, "severity": "Low"|"Medium"|"High", "category": "Market"|"Product"|"Competition"|"Execution"|"Funding"|"Technology"|"Legal", "business_impact": string, "mitigation": string }
  ] (3-6, no empty fields),
  "blind_spots": [
    { "title": string, "why_it_matters": string, "consequence": string, "action": string, "risk_level": "Low"|"Medium"|"High" }
  ] (3-5, all fields required),
  "opportunities": [
    { "title": string, "detail": string, "growth_potential": "High"|"Medium"|"Low", "revenue_impact": "High"|"Medium"|"Low", "difficulty": "Low"|"Medium"|"High", "why_exists": string, "suggested_action": string, "expected_outcome": string, "quick_win": boolean }
  ] (4-6 REAL-WORLD opportunities; name specific accelerators, incubators, programs, grants, communities, partnerships, channels, or trends; growth_potential, revenue_impact, difficulty MUST never be empty),
  "validation_steps": [
    { "week": 1, "objective": string, "tasks": [string], "deliverables": [string], "success_metric": string, "resources_needed": [string], "expected_outcome": string },
    { "week": 2, "objective": string, "tasks": [string], "deliverables": [string], "success_metric": string, "resources_needed": [string], "expected_outcome": string },
    { "week": 3, "objective": string, "tasks": [string], "deliverables": [string], "success_metric": string, "resources_needed": [string], "expected_outcome": string },
    { "week": 4, "objective": string, "tasks": [string], "deliverables": [string], "success_metric": string, "resources_needed": [string], "expected_outcome": string }
  ],
  "strategic_recommendations": [
    { "title": string, "what_to_do": string, "why_it_matters": string, "expected_impact": "High"|"Medium"|"Low", "difficulty": "Low"|"Medium"|"High", "time_required": string, "expected_outcome": string, "priority_level": "High"|"Medium"|"Low" }
  ] (3-5, written like a senior startup advisor, no generic statements)
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

Produce the Startup X-Ray JSON now. Every field is mandatory.`;

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
        executive_summary: analysis.executive_summary ?? null,
        readiness: analysis.readiness ?? null,
        verdict: analysis.verdict ?? null,
        top_priorities: analysis.top_priorities ?? [],
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

export const setReportPublic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ reportId: z.string().uuid(), isPublic: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("startup_reports")
      .update({ is_public: data.isPublic })
      .eq("id", data.reportId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getPublicReport = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ reportId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("startup_reports")
      .select("*, startups(startup_name, industry, startup_stage)")
      .eq("id", data.reportId)
      .eq("is_public", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Report not found or not public");
    return row;
  });
