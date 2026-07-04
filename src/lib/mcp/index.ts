import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listStartups from "./tools/list_startups";
import listReports from "./tools/list_reports";
import getReport from "./tools/get_report";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "venturebots-mcp",
  title: "VentureBots",
  version: "0.1.0",
  instructions:
    "Access the signed-in founder's VentureBots data. Use `list_startups` to browse the founder's startups, `list_reports` to see their Startup X-Ray reports, and `get_report` to load a full report by id.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listStartups, listReports, getReport],
});
