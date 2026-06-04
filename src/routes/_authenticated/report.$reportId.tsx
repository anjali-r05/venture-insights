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

      <Section title="Strengths" eyebrow="Signal" icon={CheckCircle2} tone="success">
        <Grid items={data.strengths as any[]} render={(i) => (
          <InsightCard tone="success" title={i.title} detail={i.detail} />
        )} />
      </Section>

      <Section title="Hidden Risks" eyebrow="Critical" icon={AlertTriangle} tone="destructive">
        <Grid items={data.risks as any[]} render={(i) => (
          <InsightCard tone="destructive" title={i.title} detail={i.detail}
            right={<SeverityBadge severity={i.severity} />} pulse />
        )} />
      </Section>

      <Section title="Blind Spots" eyebrow="High" icon={Eye} tone="warning">
        <Grid items={data.blind_spots as any[]} render={(i) => (
          <InsightCard tone="warning" title={i.title} detail={i.detail} pulse />
        )} />
      </Section>

      <Section title="Opportunities" eyebrow="Upside" icon={Lightbulb} tone="accent">
        <Grid items={data.opportunities as any[]} render={(i) => (
          <InsightCard tone="accent" title={i.title} detail={i.detail} />
        )} />
      </Section>

      <Section title="4-Week Validation Roadmap" eyebrow="Execution" icon={Calendar} tone="primary">
        <div className="relative space-y-5 border-l-2 border-accent/30 pl-8">
          {(data.validation_steps as any[])?.map((w, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative">
              <div className="absolute -left-[37px] top-3 h-4 w-4 rounded-full bg-gradient-neon glow-cyan" />
              <div className="card-hover rounded-2xl border border-border bg-card/50 p-6 backdrop-blur">
                <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Week {w.week}</div>
                <div className="mt-2 text-xl font-bold">{w.title}</div>
                <ul className="mt-4 space-y-2 text-[15px] text-muted-foreground">
                  {w.actions?.map((a: string, i: number) => (
                    <li key={i} className="flex gap-3"><span className="text-accent">→</span><span>{a}</span></li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {data.strategic_recommendations ? (
        <Section title="Strategic Recommendations" eyebrow="Playbook" icon={Sparkles} tone="accent">
          <Grid items={data.strategic_recommendations as any[]} render={(i) => (
            <InsightCard tone="accent" title={i.title} detail={i.detail} />
          )} />
        </Section>
      ) : null}

      <Section title="Investor Questions" eyebrow="Pitch Prep" icon={MessageSquareWarning} tone="primary">
        <div className="grid gap-3 md:grid-cols-2">
          {(data.investor_questions as string[])?.map((q, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="card-hover relative overflow-hidden rounded-2xl border border-primary/30 bg-card/60 p-6 backdrop-blur">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">VC Question · {String(i + 1).padStart(2, "0")}</div>
              <p className="mt-3 text-lg font-semibold leading-snug">{q}</p>
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function InsightCard({ tone, title, detail, right, pulse }: { tone: string; title: string; detail: string; right?: React.ReactNode; pulse?: boolean }) {
  const map: Record<string, { text: string; border: string; bg: string; ring: string }> = {
    success:     { text: "text-success",     border: "border-success/40",     bg: "bg-success/5",     ring: "bg-success" },
    destructive: { text: "text-destructive", border: "border-destructive/40", bg: "bg-destructive/5", ring: "bg-destructive" },
    warning:     { text: "text-warning",     border: "border-warning/40",     bg: "bg-warning/5",     ring: "bg-warning" },
    accent:      { text: "text-accent",      border: "border-accent/40",      bg: "bg-accent/5",      ring: "bg-accent" },
    primary:     { text: "text-primary",     border: "border-primary/40",     bg: "bg-primary/5",     ring: "bg-primary" },
  };
  const t = map[tone];
  return (
    <div className={`card-hover relative overflow-hidden rounded-2xl border ${t.border} ${t.bg} p-6 backdrop-blur`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {pulse && <span className={`h-2 w-2 rounded-full ${t.ring} pulse-soft ${t.text}`} />}
          <div className={`text-base font-bold ${t.text}`}>{title}</div>
        </div>
        {right}
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 90, c = 2 * Math.PI * r, dash = c * (score / 100);
  return (
    <svg width="240" height="240" viewBox="0 0 240 240">
      <defs>
        <linearGradient id="rg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r={r} stroke="oklch(1 0 0 / 6%)" strokeWidth="14" fill="none" />
      <motion.circle cx="120" cy="120" r={r} stroke="url(#rg)" strokeWidth="14" fill="none"
        strokeLinecap="round" transform="rotate(-90 120 120)"
        initial={{ strokeDasharray: `0 ${c}` }}
        animate={{ strokeDasharray: `${dash} ${c}` }}
        transition={{ duration: 1.2, ease: "easeOut" }} />
      <text x="120" y="132" textAnchor="middle" className="fill-foreground font-display" fontSize="58" fontWeight="800">{score}</text>
    </svg>
  );
}

function Section({ title, eyebrow, icon: Icon, tone, children }: any) {
  const map: Record<string, string> = {
    success: "text-success", destructive: "text-destructive", warning: "text-warning",
    accent: "text-accent", primary: "text-primary",
  };
  return (
    <section>
      <div className="mb-6 flex items-center gap-3">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/60 ${map[tone]}`}>
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <div className={`font-mono text-[10px] uppercase tracking-[0.25em] ${map[tone]}`}>{eyebrow}</div>
          <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
        </div>
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
