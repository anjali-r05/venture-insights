import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_reports",
  title: "List Startup X-Ray reports",
  description: "List Startup X-Ray reports for the signed-in user with summary metadata (score, verdict, startup).",
  inputSchema: {
    startup_id: z.string().uuid().optional().describe("Filter to a specific startup id."),
    limit: z.number().int().min(1).max(100).optional().describe("Max reports to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ startup_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("startup_reports")
      .select("id, startup_id, health_score, verdict, executive_summary, created_at, startups(startup_name, industry)")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (startup_id) q = q.eq("startup_id", startup_id);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { reports: data ?? [] },
    };
  },
});
