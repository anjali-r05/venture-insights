import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  product_name: z.string().min(1).max(200),
  industry: z.string().min(1).max(200),
  stage: z.string().min(1).max(50),
  description: z.string().min(10).max(4000),
  target_users: z.string().min(3).max(2000),
  current_features: z.string().max(3000).optional().default(""),
  startup_id: z.string().uuid().optional(),
});

const SYSTEM_PROMPT = `You are an elite Chief Product Officer with 15+ years shipping product-led SaaS, marketplaces, and consumer apps. You have led product at YC companies, Series A–C startups, and one FAANG-scale product. You write like a senior CPO advising a founder in a strategy session — sharp, opinionated, evidence-driven, never generic.

Your job: produce a full Product Strategy blueprint that tells the founder WHAT to build, WHAT NOT to build, and HOW to build it in the smartest possible order.

Rules:
- Be specific. No filler. No motivational language. Every sentence must move a decision forward.
- Ground every recommendation in the startup context provided. Reference the target users, industry, stage.
- Never leave a field blank. If information is missing, infer plausibly and state the assumption inline.
- MVP scope should be BRUTALLY small — pick the 3-5 features that prove the core value loop, nothing more.
- "Skip For Now" must include features founders are usually tempted to build too early.
- Use ONLY these enum values where specified. Do not invent new labels.

Return STRICT JSON (no markdown fences, no prose outside JSON) matching EXACTLY this schema. Every field is REQUIRED unless marked optional. Arrays must be non-empty within the stated bounds.

{
  "executive_summary": string (100-160 words, flowing prose — the product thesis, the MVP bet, the biggest product risk, the recommended first release, and the one thing to cut ruthlessly),

  "blueprint": {
    "product_vision": string (1-2 sentences, ambitious but grounded),
    "core_problem": string (2-3 sentences, in the user's language),
    "target_users": [ { "segment": string, "who_they_are": string, "core_need": string } ] (2-4),
    "personas": [ { "name": string, "role": string, "context": string, "primary_goal": string, "biggest_frustration": string, "quote": string } ] (2-3),
    "user_journey": [ { "stage": string, "user_action": string, "product_response": string, "emotion": string } ] (5-7 stages, from awareness to retention),
    "product_goals": [ { "goal": string, "why_it_matters": string, "success_metric": string } ] (3-5)
  },

  "mvp": {
    "hypothesis": string (1-2 sentences — the single core bet the MVP will prove or disprove),
    "core_value_loop": string (2-3 sentences — the atomic user action that must feel magical),
    "must_have": [ { "feature": string, "why_in_mvp": string, "risk_if_missing": string } ] (3-5),
    "nice_to_have": [ { "feature": string, "why_deferred": string, "trigger_to_build": string } ] (3-5),
    "future_features": [ { "feature": string, "why_later": string, "unlocks": string } ] (3-6)
  },

  "feature_priorities": [
    {
      "name": string,
      "purpose": string,
      "priority": "High" | "Medium" | "Low",
      "complexity": "Low" | "Medium" | "High",
      "business_impact": "High" | "Medium" | "Low",
      "reason": string (1 sentence — why this priority ranking)
    }
  ] (8-12 features covering MVP + near-term; ordered by build order),

  "roadmap": [
    { "phase": 1, "name": "Core MVP",         "timeline": string, "objective": string, "features": [string], "success_criteria": string },
    { "phase": 2, "name": "Beta Release",     "timeline": string, "objective": string, "features": [string], "success_criteria": string },
    { "phase": 3, "name": "Public Launch",    "timeline": string, "objective": string, "features": [string], "success_criteria": string },
    { "phase": 4, "name": "Growth Features",  "timeline": string, "objective": string, "features": [string], "success_criteria": string },
    { "phase": 5, "name": "Scale",            "timeline": string, "objective": string, "features": [string], "success_criteria": string }
  ],

  "ai_suggestions": [
    { "title": string, "type": "Missing" | "Competitor Parity" | "Retention" | "UX" | "AI-Powered", "detail": string, "expected_impact": "High" | "Medium" | "Low" }
  ] (5-8, mix all five types, be very specific to this product's category),

  "build_vs_skip": {
    "build_now": [ { "feature": string, "why": string, "expected_outcome": string } ] (4-6),
    "skip_for_now": [ { "feature": string, "why_skip": string, "when_to_revisit": string } ] (4-6 — include the classic traps founders fall into for THIS type of product)
  },

  "technical_suggestions": {
    "tech_stack": [ { "layer": string, "recommendation": string, "reason": string, "alternative": string } ] (5-7 layers: frontend, backend, database, hosting, auth, payments, analytics, etc — pick what fits the product),
    "architecture": { "pattern": string, "reason": string, "diagram_notes": string },
    "database": { "type": string, "reason": string, "key_tables": [string] },
    "apis": [ { "name": string, "purpose": string, "priority": "High" | "Medium" | "Low" } ] (3-6 third-party APIs),
    "ai_models": [ { "use_case": string, "model_recommendation": string, "reason": string } ] (2-4 if AI is relevant, otherwise 1 explaining it is not core)
  },

  "risks": [
    {
      "risk": "Feature Overload" | "Wrong Priorities" | "Weak MVP" | "Poor User Experience" | "Scalability Issues" | "Tech Debt" | "Retention Gap" | "Wrong Persona",
      "why_it_applies": string (specific to this product),
      "consequence": string,
      "how_to_avoid": string,
      "severity": "Low" | "Medium" | "High"
    }
  ] (4-6 — MUST include at least Feature Overload, Wrong Priorities, Weak MVP, Poor User Experience, Scalability Issues where relevant)
}`;

export const generateProductStrategy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service not configured");

    const userPrompt = `Product: ${data.product_name}
Industry: ${data.industry}
Stage: ${data.stage}

Description:
${data.description}

Target users:
${data.target_users}

${data.current_features?.trim() ? `Existing / planned features (context only — challenge these):\n${data.current_features}` : "No existing features described. Design the MVP from scratch."}

Produce the AI Product Strategy JSON now. Every field is mandatory. Do not include markdown fences.`;

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

    let strategy: unknown;
    try { strategy = typeof content === "string" ? JSON.parse(content) : content; }
    catch { throw new Error("AI returned invalid JSON"); }

    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("product_strategies" as never)
      .insert({
        user_id: userId,
        startup_id: data.startup_id ?? null,
        product_name: data.product_name,
        industry: data.industry,
        stage: data.stage,
        description: data.description,
        target_users: data.target_users,
        current_features: data.current_features ?? "",
        strategy,
      } as never)
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Failed to save product strategy");

    return { id: (row as { id: string }).id };
  });

export const listProductStrategies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("product_strategies" as never)
      .select("id, product_name, industry, stage, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{
      id: string; product_name: string; industry: string | null;
      stage: string | null; created_at: string;
    }>;
  });

export const getProductStrategy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("product_strategies" as never)
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Strategy not found");
    return row as {
      id: string; product_name: string; industry: string | null; stage: string | null;
      description: string | null; target_users: string | null; current_features: string | null;
      strategy: ProductStrategyPayload; created_at: string;
    };
  });

export type ProductStrategyPayload = {
  executive_summary: string;
  blueprint: {
    product_vision: string;
    core_problem: string;
    target_users: { segment: string; who_they_are: string; core_need: string }[];
    personas: { name: string; role: string; context: string; primary_goal: string; biggest_frustration: string; quote: string }[];
    user_journey: { stage: string; user_action: string; product_response: string; emotion: string }[];
    product_goals: { goal: string; why_it_matters: string; success_metric: string }[];
  };
  mvp: {
    hypothesis: string;
    core_value_loop: string;
    must_have: { feature: string; why_in_mvp: string; risk_if_missing: string }[];
    nice_to_have: { feature: string; why_deferred: string; trigger_to_build: string }[];
    future_features: { feature: string; why_later: string; unlocks: string }[];
  };
  feature_priorities: {
    name: string; purpose: string;
    priority: "High" | "Medium" | "Low";
    complexity: "Low" | "Medium" | "High";
    business_impact: "High" | "Medium" | "Low";
    reason: string;
  }[];
  roadmap: {
    phase: number; name: string; timeline: string; objective: string;
    features: string[]; success_criteria: string;
  }[];
  ai_suggestions: {
    title: string;
    type: "Missing" | "Competitor Parity" | "Retention" | "UX" | "AI-Powered";
    detail: string;
    expected_impact: "High" | "Medium" | "Low";
  }[];
  build_vs_skip: {
    build_now: { feature: string; why: string; expected_outcome: string }[];
    skip_for_now: { feature: string; why_skip: string; when_to_revisit: string }[];
  };
  technical_suggestions: {
    tech_stack: { layer: string; recommendation: string; reason: string; alternative: string }[];
    architecture: { pattern: string; reason: string; diagram_notes: string };
    database: { type: string; reason: string; key_tables: string[] };
    apis: { name: string; purpose: string; priority: "High" | "Medium" | "Low" }[];
    ai_models: { use_case: string; model_recommendation: string; reason: string }[];
  };
  risks: {
    risk: string;
    why_it_applies: string;
    consequence: string;
    how_to_avoid: string;
    severity: "Low" | "Medium" | "High";
  }[];
};
