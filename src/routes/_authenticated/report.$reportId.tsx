import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle2, AlertTriangle, Eye, Lightbulb, MessageSquareWarning,
  Sparkles, ArrowLeft, Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/report/$reportId")({
  component: ReportPage,
});

function ReportPage() {
  const { reportId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("startup_reports")
        .select("*, startups(startup_name, industry, startup_stage)")
        .eq("id", reportId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="py-24 text-center font-mono text-sm uppercase tracking-[0.25em] text-accent">Loading intelligence…</div>;
  if (!data) return <div className="py-24 text-center text-muted-foreground">Report not found.</div>;

  const score = data.health_score ?? 0;
  const assessment =
    score >= 80 ? "High Potential" :
    score >= 65 ? "Promising" :
    score >= 45 ? "Needs Validation" : "High Risk";

  const startup = (data as any).startups;

  return (
    <div className="mx-auto max-w-6xl space-y-14 fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/history" className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> All reports
          </Link>
          <div className="mt-4 chip text-accent border-accent/40"><Sparkles className="h-3.5 w-3.5" /> Startup X-Ray Intelligence Report</div>
          <h1 className="mt-5 text-5xl font-extrabold tracking-tight md:text-6xl">{startup?.startup_name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="chip text-muted-foreground">{startup?.industry}</span>
            <span className="chip text-muted-foreground">{startup?.startup_stage}</span>
            <span className="chip text-muted-foreground"><Calendar className="h-3 w-3" />{new Date(data.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <Link to="/xray"><Button className="btn-neon h-12 px-6 font-semibold">Run another</Button></Link>
      </div>

      {/* Health Score */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass-strong relative overflow-hidden rounded-[2rem] p-12">
        <div className="absolute inset-x-10 -top-20 h-48 rounded-full bg-gradient-neon opacity-30 blur-3xl" />
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="flex justify-center"><ScoreRing score={score} /></div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Startup Health Score</div>
            <h2 className="mt-3 font-display text-7xl font-extrabold tracking-tight">{score}<span className="text-3xl text-muted-foreground">/100</span></h2>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-card/60 px-5 py-2 text-base font-semibold">
              <Sparkles className="h-4 w-4 text-accent" /> {assessment}
            </div>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              A weighted assessment of your startup's viability, defensibility, and execution risk —
              calibrated against investor-grade benchmarks.
            </p>
          </div>
        </div>
      </motion.div>

      <Section title="Strengths" icon={CheckCircle2} accent="success">
        <Grid items={data.strengths as any[]} render={(i) => (
          <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
            <div className="font-semibold text-success">{i.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{i.detail}</p>
          </div>
        )} />
      </Section>

      <Section title="Risks" icon={AlertTriangle} accent="destructive">
        <Grid items={data.risks as any[]} render={(i) => (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="font-semibold text-destructive">{i.title}</div>
              <SeverityBadge severity={i.severity} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{i.detail}</p>
          </div>
        )} />
      </Section>

      <Section title="Blind Spots" icon={Eye} accent="warning">
        <Grid items={data.blind_spots as any[]} render={(i) => (
          <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
            <div className="font-semibold text-warning">{i.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{i.detail}</p>
          </div>
        )} />
      </Section>

      <Section title="Opportunities" icon={Lightbulb} accent="info">
        <Grid items={data.opportunities as any[]} render={(i) => (
          <div className="rounded-2xl border border-info/30 bg-info/5 p-5">
            <div className="font-semibold text-info">{i.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{i.detail}</p>
          </div>
        )} />
      </Section>

      <Section title="4-Week Validation Roadmap" icon={Calendar} accent="primary">
        <div className="relative space-y-4 border-l-2 border-primary/30 pl-6">
          {(data.validation_steps as any[])?.map((w, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative">
              <div className="absolute -left-[31px] top-2 h-4 w-4 rounded-full bg-gradient-primary" />
              <div className="rounded-2xl border border-border bg-card/40 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-gradient">Week {w.week}</div>
                <div className="mt-1 font-semibold">{w.title}</div>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {w.actions?.map((a: string, i: number) => (
                    <li key={i} className="flex gap-2"><span className="text-primary">→</span><span>{a}</span></li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section title="Strategic Recommendations" icon={Sparkles} accent="accent">
        <Grid items={data.strategic_recommendations as any[]} render={(i) => (
          <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5">
            <div className="font-semibold text-accent">{i.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{i.detail}</p>
          </div>
        )} />
      </Section>

      <Section title="What Would Investors Ask?" icon={MessageSquareWarning} accent="primary">
        <div className="grid gap-3 md:grid-cols-2">
          {(data.investor_questions as string[])?.map((q, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 p-5">
              <div className="text-xs font-semibold text-primary">VC Question</div>
              <p className="mt-1 text-base font-medium">{q}</p>
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 80, c = 2 * Math.PI * r, dash = c * (score / 100);
  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      <defs>
        <linearGradient id="rg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r={r} stroke="oklch(1 0 0 / 8%)" strokeWidth="16" fill="none" />
      <motion.circle cx="110" cy="110" r={r} stroke="url(#rg)" strokeWidth="16" fill="none"
        strokeLinecap="round" transform="rotate(-90 110 110)"
        initial={{ strokeDasharray: `0 ${c}` }}
        animate={{ strokeDasharray: `${dash} ${c}` }}
        transition={{ duration: 1.2, ease: "easeOut" }} />
      <text x="110" y="120" textAnchor="middle" className="fill-foreground" fontSize="48" fontWeight="700">{score}</text>
    </svg>
  );
}

function Section({ title, icon: Icon, children }: any) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Grid<T>({ items, render }: { items: T[]; render: (i: T) => React.ReactNode }) {
  if (!items?.length) return <div className="text-sm text-muted-foreground">No items.</div>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((i, idx) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: idx * 0.04 }}>
          {render(i)}
        </motion.div>
      ))}
    </div>
  );
}

function SeverityBadge({ severity }: { severity?: string }) {
  const s = (severity ?? "Medium").toLowerCase();
  const cls = s === "high" ? "bg-destructive text-destructive-foreground"
    : s === "medium" ? "bg-warning text-warning-foreground"
    : "bg-muted text-foreground";
  return <Badge className={`${cls} border-0`}>{severity ?? "Medium"}</Badge>;
}
