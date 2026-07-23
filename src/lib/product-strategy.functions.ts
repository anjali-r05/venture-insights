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

const SYSTEM_PROMPT = `You are an elite Chief Product Officer advising a founder. Be concise, specific, and opinionated. No filler. No generic startup advice. Ground every answer in the founder's actual product, problem, industry, and users.

Return STRICT JSON (no markdown fences) matching EXACTLY this schema:

{
  "product_vision": string (2-3 sentences, ambitious but grounded),
  "target_users": [ { "segment": string, "description": string (1 sentence) } ] (2-3 items),
  "mvp_features": [ { "name": string, "description": string (1 sentence), "priority": "Build First" | "Build Later" | "Skip for Now" } ] (5-7 items, at least 3 "Build First", at least 1 "Skip for Now"),
  "tech_stack": [ { "layer": string, "recommendation": string, "reason": string (1 sentence) } ] (5-6 layers: frontend, backend, database, hosting, auth, payments/analytics),
  "launch_plan_30_days": [ { "week": 1|2|3|4, "focus": string, "tasks": [string] (3-4 tasks per week) } ] (exactly 4 weeks),
  "top_risks": [ { "risk": string, "severity": "High" | "Medium" | "Low", "mitigation": string (1 sentence) } ] (exactly 3),
  "ai_recommendation": string (2-3 sentences — the single biggest strategic move this founder should make right now)
}`;

function fallbackStrategy(data: z.infer<typeof Input>): ProductStrategyPayload {
  return {
    product_vision: `${data.product_name} aims to solve a real problem for ${data.industry} users. Refine the vision by talking to 10 target users this week.`,
    target_users: [
      { segment: "Primary users", description: data.target_users.slice(0, 160) || "Define your primary user segment." },
    ],
    mvp_features: [
      { name: "Core value action", description: "The single action that delivers value to users.", priority: "Build First" },
      { name: "Onboarding flow", description: "Get users to their first success in under 3 minutes.", priority: "Build First" },
      { name: "User accounts", description: "Simple email/Google auth.", priority: "Build First" },
      { name: "Basic analytics", description: "Track activation and retention events.", priority: "Build Later" },
      { name: "Payments", description: "Add when you have paying-intent signal.", priority: "Build Later" },
      { name: "Admin dashboard", description: "Use the database console until it hurts.", priority: "Skip for Now" },
    ],
    tech_stack: [
      { layer: "Frontend", recommendation: "React + Vite + Tailwind", reason: "Fast iteration and huge ecosystem." },
      { layer: "Backend", recommendation: "Serverless functions", reason: "Zero infra to launch." },
      { layer: "Database", recommendation: "Postgres (Supabase)", reason: "Auth, RLS, and storage in one." },
      { layer: "Hosting", recommendation: "Lovable / Vercel", reason: "One-click deploys and previews." },
      { layer: "Auth", recommendation: "Supabase Auth (email + Google)", reason: "Ships in an hour." },
    ],
    launch_plan_30_days: [
      { week: 1, focus: "Validate the problem", tasks: ["Interview 10 target users", "Write a one-page product brief", "Sketch the core flow"] },
      { week: 2, focus: "Build the MVP core", tasks: ["Ship the core value action", "Add auth", "Deploy behind a waitlist"] },
      { week: 3, focus: "Private beta", tasks: ["Invite 20 users", "Instrument analytics", "Fix top 3 friction points"] },
      { week: 4, focus: "Public launch", tasks: ["Public landing page", "Launch on 2 channels", "Set up weekly retention review"] },
    ],
    top_risks: [
      { risk: "Building too much before validation", severity: "High", mitigation: "Ship the smallest thing that proves the core loop." },
      { risk: "Wrong target user", severity: "Medium", mitigation: "Run 10 user interviews before writing more code." },
      { risk: "Weak retention", severity: "Medium", mitigation: "Instrument day-1 and day-7 return early." },
    ],
    ai_recommendation: `Cut your feature list in half and ship a private beta to 20 real ${data.industry} users within 3 weeks. Everything else is a distraction until you see returning usage.`,
  };
}

export const generateProductStrategy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service not configured");

    const userPrompt = `Product: ${data.product_name}
Industry: ${data.industry}
Stage: ${data.stage}

Description: ${data.description}

Target users: ${data.target_users}

${data.current_features?.trim() ? `Existing/planned features (challenge these):\n${data.current_features}` : "Design the MVP from scratch."}

Return the JSON now.`;

    let strategy: ProductStrategyPayload;
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
      if (!res.ok) throw new Error(`AI error (${res.status})`);

      const payload = await res.json();
      const content = payload?.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI returned empty response");
      strategy = typeof content === "string" ? JSON.parse(content) : content;
      if (!strategy?.product_vision || !Array.isArray(strategy?.mvp_features)) {
        throw new Error("AI returned incomplete strategy");
      }
    } catch (err) {
      // Fallback: never leave the user with a broken screen.
      console.warn("[product-strategy] AI failed, using fallback template:", err);
      strategy = fallbackStrategy(data);
    }

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
    const r = row as {
      id: string; product_name: string; industry: string | null; stage: string | null;
      description: string | null; target_users: string | null; current_features: string | null;
      strategy: unknown; created_at: string;
    };
    return { ...r, strategy: normalizeStrategy(r.strategy, r.product_name, r.industry ?? "") };
  });

/* -------- Normalizer: adapt legacy rows to the new lightweight schema -------- */

function normalizeStrategy(raw: unknown, productName: string, industry: string): ProductStrategyPayload {
  const s = (raw ?? {}) as Record<string, any>;

  // Already v2
  if (s.product_vision && Array.isArray(s.mvp_features) && Array.isArray(s.launch_plan_30_days)) {
    return s as ProductStrategyPayload;
  }

  // Legacy v1 → v2 adapter
  const legacy = s as Partial<{
    blueprint: any; mvp: any; feature_priorities: any[]; roadmap: any[];
    build_vs_skip: any; technical_suggestions: any; risks: any[]; executive_summary: string;
  }>;

  const target_users = (legacy.blueprint?.target_users ?? []).slice(0, 3).map((u: any) => ({
    segment: u.segment ?? "Users",
    description: u.core_need ?? u.who_they_are ?? "",
  }));

  const mustHave = (legacy.mvp?.must_have ?? []).map((f: any) => ({
    name: f.feature, description: f.why_in_mvp ?? "", priority: "Build First" as const,
  }));
  const niceToHave = (legacy.mvp?.nice_to_have ?? []).map((f: any) => ({
    name: f.feature, description: f.why_deferred ?? "", priority: "Build Later" as const,
  }));
  const skip = (legacy.build_vs_skip?.skip_for_now ?? []).map((f: any) => ({
    name: f.feature, description: f.why_skip ?? "", priority: "Skip for Now" as const,
  }));
  const mvp_features = [...mustHave, ...niceToHave, ...skip].slice(0, 7);

  const tech_stack = (legacy.technical_suggestions?.tech_stack ?? []).slice(0, 6).map((t: any) => ({
    layer: t.layer, recommendation: t.recommendation, reason: t.reason,
  }));

  const launch_plan_30_days = (legacy.roadmap ?? []).slice(0, 4).map((ph: any, i: number) => ({
    week: (i + 1) as 1 | 2 | 3 | 4,
    focus: ph.name ?? ph.objective ?? `Week ${i + 1}`,
    tasks: (ph.features ?? []).slice(0, 4),
  }));

  const top_risks = (legacy.risks ?? []).slice(0, 3).map((r: any) => ({
    risk: r.risk, severity: (r.severity ?? "Medium") as "High" | "Medium" | "Low",
    mitigation: r.how_to_avoid ?? "",
  }));

  return {
    product_vision: legacy.blueprint?.product_vision ?? legacy.executive_summary?.slice(0, 260) ?? `${productName} for ${industry}.`,
    target_users: target_users.length ? target_users : [{ segment: "Primary users", description: "Define your primary user segment." }],
    mvp_features: mvp_features.length ? mvp_features : [{ name: "Core action", description: "The single action that delivers value.", priority: "Build First" }],
    tech_stack: tech_stack.length ? tech_stack : [{ layer: "Frontend", recommendation: "React + Vite", reason: "Fast iteration." }],
    launch_plan_30_days: launch_plan_30_days.length === 4 ? launch_plan_30_days : [
      { week: 1, focus: "Validate", tasks: ["Interview 10 users"] },
      { week: 2, focus: "Build MVP core", tasks: ["Ship core loop"] },
      { week: 3, focus: "Private beta", tasks: ["Invite 20 users"] },
      { week: 4, focus: "Public launch", tasks: ["Launch on 2 channels"] },
    ],
    top_risks: top_risks.length ? top_risks : [
      { risk: "Building before validation", severity: "High", mitigation: "Ship smallest MVP." },
    ],
    ai_recommendation: legacy.executive_summary ?? `Cut features aggressively and ship a private beta within 3 weeks.`,
  };
}

export type ProductStrategyPayload = {
  product_vision: string;
  target_users: { segment: string; description: string }[];
  mvp_features: { name: string; description: string; priority: "Build First" | "Build Later" | "Skip for Now" }[];
  tech_stack: { layer: string; recommendation: string; reason: string }[];
  launch_plan_30_days: { week: 1 | 2 | 3 | 4; focus: string; tasks: string[] }[];
  top_risks: { risk: string; severity: "High" | "Medium" | "Low"; mitigation: string }[];
  ai_recommendation: string;
};
