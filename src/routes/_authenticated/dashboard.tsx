import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Telescope, History, Sparkles, TrendingUp, Zap, Radar } from "lucide-react";
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
    <div className="mx-auto max-w-7xl space-y-12 fade-up">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="chip text-accent border-accent/40"><Radar className="h-3.5 w-3.5" /> Founder OS · Command Center</div>
        <h1 className="mt-5 text-5xl font-extrabold tracking-tight md:text-6xl">
          Welcome back, <span className="text-gradient">{greeting}</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Run a new diagnostic or review past intelligence reports. Your operating system is ready.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Analyses Completed" value={data?.total ?? 0} icon={Sparkles} tone="primary" />
        <StatCard label="Avg. Health Score" value={data?.avg ?? 0} suffix="/100" icon={TrendingUp} tone="accent" />
        <StatCard label="Latest Report" value={data?.reports[0]?.health_score ?? "—"} suffix={data?.reports[0] ? "/100" : ""} icon={History} tone="primary" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/xray">
          <motion.div whileHover={{ y: -4 }} className="group card-hover relative overflow-hidden rounded-3xl border border-accent/30 bg-card/60 p-10 backdrop-blur-xl">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-neon opacity-30 blur-3xl transition group-hover:opacity-60" />
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-accent glow-cyan">
              <Telescope className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <h2 className="mt-6 text-3xl font-bold">Run Startup X-Ray</h2>
            <p className="mt-2 max-w-md text-[15px] text-muted-foreground">
              Diagnostic intelligence in under 60 seconds — risks, blind spots, opportunities, investor questions.
            </p>
            <Button className="btn-neon mt-8 h-12 px-6 font-semibold">
              <Zap className="mr-2 h-4 w-4 text-accent" /> Launch diagnostic <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </Link>
        <Link to="/history">
          <motion.div whileHover={{ y: -4 }} className="group card-hover relative overflow-hidden rounded-3xl border border-primary/30 bg-card/60 p-10 backdrop-blur-xl">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl transition group-hover:opacity-80" />
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
              <History className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <h2 className="mt-6 text-3xl font-bold">Report Archive</h2>
            <p className="mt-2 max-w-md text-[15px] text-muted-foreground">
              Browse every X-Ray you've run. Compare scores, revisit insights, track your trajectory.
            </p>
            <Button variant="outline" className="glass mt-8 h-12 px-6 font-semibold">Open archive</Button>
          </motion.div>
        </Link>
      </div>

      {data?.reports.length ? (
        <div>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Recent intelligence</div>
              <h3 className="mt-2 text-3xl font-bold">Latest reports</h3>
            </div>
            <Link to="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">View all →</Link>
          </div>
          <div className="space-y-3">
            {data.reports.map((r: any, i: number) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to="/report/$reportId" params={{ reportId: r.id }}
                  className="card-hover flex items-center justify-between rounded-2xl border border-border bg-card/50 p-5 backdrop-blur transition hover:border-accent/40">
                  <div className="flex items-center gap-4">
                    <ScoreChip score={r.health_score ?? 0} />
                    <div>
                      <div className="text-lg font-semibold">{r.startups?.startup_name ?? "Untitled startup"}</div>
                      <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, suffix, icon: Icon, tone }: any) {
  const toneCls = tone === "accent" ? "text-accent border-accent/30 bg-accent/10" : "text-primary border-primary/30 bg-primary/10";
  return (
    <div className="card-hover relative overflow-hidden rounded-3xl border border-border/60 bg-card/50 p-7 backdrop-blur-xl">
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${toneCls}`}>
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="mt-5 font-display text-5xl font-extrabold tracking-tight">
        {value}<span className="text-xl font-semibold text-muted-foreground">{suffix}</span>
      </div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
    </div>
  );
}

function ScoreChip({ score }: { score: number }) {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-accent/30 bg-card">
      <span className="font-display text-xl font-extrabold text-gradient">{score}</span>
    </div>
  );
}
