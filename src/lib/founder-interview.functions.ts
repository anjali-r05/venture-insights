import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["assistant", "user"]),
  content: z.string(),
});

const StartupContextSchema = z
  .object({
    startup_name: z.string().optional(),
    industry: z.string().optional(),
    description: z.string().optional(),
  })
  .partial()
  .optional();

const INTERVIEWER_SYSTEM = `You are an elite venture capital investor conducting a live founder assessment interview. Think Marc Andreessen meets Y Combinator partner meets a seasoned startup mentor.

INTERVIEW STYLE:
- Speak conversationally, like a real human investor in a room with the founder. Warm but sharp.
- Ask ONE focused question at a time. Never bundle multiple questions.
- Base each new question on what the founder JUST said. Follow the thread. Dig into vague answers.
- If an answer is generic ("we help students"), push for specifics ("Which students? How many have you talked to this week?").
- Rotate coverage across: problem clarity, market understanding, customer discovery, product vision, business model, competition, unfair advantage, team, execution, traction, risks, self-awareness.
- Keep questions SHORT (1-2 sentences, under 40 words). This is spoken aloud.
- Do NOT compliment excessively. Stay neutral and probing.

CRITICAL: You MUST return STRICT JSON only, no markdown, no prose outside JSON, matching:
{
  "question": string,   // your next question to the founder (spoken aloud)
  "reasoning": string,  // 1 sentence why you're asking this (internal, not spoken)
  "scores": {           // your CURRENT running assessment 0-100, updated every turn
    "confidence": number,
    "communication": number,
    "leadership": number,
    "clarity_of_thought": number,
    "conviction": number,
    "problem_understanding": number,
    "product_understanding": number,
    "market_understanding": number,
    "business_understanding": number,
    "decision_making": number,
    "overall_readiness": number
  },
  "should_end": boolean // true after ~10-12 substantive exchanges, or if founder wants to end
}`;

const FINAL_REPORT_SYSTEM = `You are a senior VC partner writing the final Founder Readiness Assessment after a live interview. Be honest, specific, and evidence-based. Reference concrete moments from the transcript.

Return STRICT JSON only:
{
  "overall_score": number (0-100),
  "verdict": "Ready" | "Almost Ready" | "Needs Improvement",
  "verdict_reasoning": string (2-3 sentences),
  "scores": {
    "confidence": number,
    "communication": number,
    "leadership": number,
    "business_understanding": number,
    "vision_clarity": number,
    "investor_readiness": number
  },
  "strengths": [{ "title": string, "detail": string, "evidence": string }] (3-5),
  "weaknesses": [{ "title": string, "detail": string, "evidence": string }] (3-5),
  "areas_to_improve": [{ "area": string, "why": string, "how": string }] (3-5),
  "recommendations": [{ "title": string, "action": string, "expected_outcome": string }] (3-5),
  "signature_quote": string (one memorable line the founder said, or an assessment quote)
}`;

export const founderInterviewTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        messages: z.array(MessageSchema).max(60),
        startup: StartupContextSchema,
        turnCount: z.number().int().min(0).max(30),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI not configured");

    const ctx = data.startup;
    const contextLine = ctx?.startup_name
      ? `Founder is building "${ctx.startup_name}"${ctx.industry ? ` in ${ctx.industry}` : ""}.${ctx.description ? ` Brief: ${ctx.description.slice(0, 400)}` : ""}`
      : `No prior startup context. Start by asking the founder to briefly describe what they are building.`;

    const messages = [
      { role: "system", content: INTERVIEWER_SYSTEM },
      { role: "system", content: `Context: ${contextLine}\nTurn: ${data.turnCount}/12. Should end around turn 10-12.` },
      ...data.messages,
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit — try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) throw new Error(`AI error (${res.status})`);

    const payload = await res.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    return parsed as {
      question: string;
      reasoning: string;
      scores: Record<string, number>;
      should_end: boolean;
    };
  });

export const founderFinalReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        messages: z.array(MessageSchema).min(2).max(60),
        startup: StartupContextSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI not configured");

    const transcript = data.messages
      .map((m) => `${m.role === "assistant" ? "INVESTOR" : "FOUNDER"}: ${m.content}`)
      .join("\n\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: FINAL_REPORT_SYSTEM },
          {
            role: "user",
            content: `Startup: ${data.startup?.startup_name ?? "Unknown"}\n\nInterview transcript:\n\n${transcript}\n\nProduce the final Founder Readiness Assessment JSON now.`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) throw new Error(`AI error (${res.status})`);
    const payload = await res.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");
    return typeof content === "string" ? JSON.parse(content) : content;
  });
