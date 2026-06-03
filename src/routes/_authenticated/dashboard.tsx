import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Telescope, History, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const { data } = useQuery({
    queryKey: ["dashboard-summary", user.id],
    queryFn: async () => {
      const { data: reports } = await supabase
        .from("startup_reports")
        .select("id, health_score, created_at, startup_id, startups(startup_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      const total = reports?.length ?? 0;
      const avg = total ? Math.round((reports!.reduce((s, r) => s + (r.health_score ?? 0), 0) / total)) : 0;
      return { reports: reports ?? [], total, avg };
    },
  });

  const greeting = (user.user_metadata as any)?.full_name?.split(" ")?.[0] ?? "Founder";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gradient">Welcome back</div>
        <h1 className="mt-2 text-4xl font-bold">Hi {greeting} 👋</h1>
        <p className="mt-2 text-muted-foreground">Run a new X-Ray or review your past analyses.</p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Analyses Completed" value={data?.total ?? 0} icon={Sparkles} />
        <StatCard label="Avg. Health Score" value={data?.avg ?? 0} suffix="/100" icon={TrendingUp} />
        <StatCard label="Latest Report" value={data?.reports[0]?.health_score ?? "—"} suffix={data?.reports[0] ? "/100" : ""} icon={History} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Link to="/xray">
          <motion.div whileHover={{ y: -2 }} className="group glass relative overflow-hidden rounded-3xl p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-primary opacity-20 blur-3xl transition group-hover:opacity-40" />
            <Telescope className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Run Startup X-Ray</h2>
            <p className="mt-1 text-sm text-muted-foreground">Get an investor-grade analysis in under a minute.</p>
            <Button className="mt-6 bg-gradient-primary text-primary-foreground">
              Start <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </Link>
        <Link to="/history">
          <motion.div whileHover={{ y: -2 }} className="group glass relative overflow-hidden rounded-3xl p-8">
            <History className="h-8 w-8 text-accent" />
            <h2 className="mt-4 text-2xl font-bold">Report History</h2>
            <p className="mt-1 text-sm text-muted-foreground">Browse and revisit your previous Startup X-Rays.</p>
            <Button variant="outline" className="mt-6">Open History</Button>
          </motion.div>
        </Link>
      </div>

      {data?.reports.length ? (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Recent reports</h3>
          <div className="space-y-2">
            {data.reports.map((r: any) => (
              <Link key={r.id} to="/report/$reportId" params={{ reportId: r.id }}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 p-4 transition hover:border-primary/40">
                <div>
                  <div className="font-medium">{r.startups?.startup_name ?? "Untitled startup"}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gradient">{r.health_score}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, suffix, icon: Icon }: any) {
  return (
    <div className="glass rounded-3xl p-6">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-4 text-4xl font-bold">{value}<span className="text-base font-medium text-muted-foreground">{suffix}</span></div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
