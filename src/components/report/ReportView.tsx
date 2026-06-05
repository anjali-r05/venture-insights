import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  CheckCircle2, AlertTriangle, Eye, Lightbulb, MessageSquareWarning,
  Sparkles, ArrowLeft, Calendar, Download, Share2, Link2, Save, Printer,
  Target, Zap, TrendingUp, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Props = {
  report: any;
  isPublic?: boolean;
  readOnly?: boolean;
  onShare?: () => void;
  onCopy?: () => void;
  busy?: boolean;
  backHref?: string;
};

const TABS = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "strengths", label: "Strengths", icon: CheckCircle2 },
  { id: "risks", label: "Hidden Risks", icon: AlertTriangle },
  { id: "blindspots", label: "Blind Spots", icon: Eye },
  { id: "opportunities", label: "Opportunities", icon: Lightbulb },
  { id: "roadmap", label: "Validation Roadmap", icon: Calendar },
  { id: "playbook", label: "Recommendations", icon: Target },
  { id: "investor", label: "Investor Challenge Room", icon: MessageSquareWarning },
] as const;

export function ReportView({ report, isPublic, readOnly, onShare, onCopy, busy, backHref }: Props) {
  const [tab, setTab] = useState<string>("overview");
  const startup = report.startups;
  const score = report.health_score ?? 0;
  const verdict = report.verdict ?? { label: scoreToLabel(score), confidence: Math.max(50, score), reasoning: "Auto-derived verdict from health score." };
  const readiness = report.readiness ?? {};

  return (
    <div className="mx-auto max-w-6xl space-y-10 fade-up print:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {backHref && !readOnly && (
            <Link to={backHref} className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> All reports
            </Link>
          )}
          <div className="mt-4 chip text-accent border-accent/40"><Sparkles className="h-3.5 w-3.5" /> Startup X-Ray Intelligence Report</div>
          <h1 className="mt-5 text-5xl font-extrabold tracking-tight md:text-6xl">{startup?.startup_name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="chip text-muted-foreground">{startup?.industry}</span>
            <span className="chip text-muted-foreground">{startup?.startup_stage}</span>
            <span className="chip text-muted-foreground"><Calendar className="h-3 w-3" />{new Date(report.created_at).toLocaleDateString()}</span>
            {isPublic && <span className="chip text-success border-success/40"><Share2 className="h-3 w-3" /> Public</span>}
          </div>
        </div>
        {!readOnly && (
          <Link to="/xray"><Button className="btn-neon h-12 px-6 font-semibold">Run another</Button></Link>
        )}
      </div>

      {/* SECTION 1 — Executive Summary */}
      <ExecutiveSummary text={report.executive_summary} verdict={verdict} />

      {/* SECTION 2 + 3 — Score + Verdict + Readiness */}
      <div className="grid gap-6 lg:grid-cols-5">
        <ScorePanel score={score} readiness={readiness} />
        <VerdictPanel verdict={verdict} />
      </div>

      {/* SECTION 4 — Top 3 Priorities */}
      <TopPriorities items={report.top_priorities ?? []} />

      {/* SECTION 5 — Tabs */}
      <div className="sticky top-2 z-30 -mx-2 print:hidden">
        <div className="glass-strong overflow-x-auto rounded-2xl border border-border/60 p-1.5">
          <div className="flex min-w-max gap-1">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`group inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? "bg-gradient-neon text-background shadow-glow"
                      : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="min-h-[300px]"
        >
          {tab === "overview" && <OverviewTab report={report} />}
          {tab === "strengths" && <StrengthsTab items={report.strengths} />}
          {tab === "risks" && <RisksTab items={report.risks} />}
          {tab === "blindspots" && <BlindSpotsTab items={report.blind_spots} />}
          {tab === "opportunities" && <OpportunitiesTab items={report.opportunities} />}
          {tab === "roadmap" && <RoadmapTab items={report.validation_steps} />}
          {tab === "playbook" && <PlaybookTab items={report.strategic_recommendations} />}
          {tab === "investor" && <InvestorTab items={report.investor_questions} />}
        </motion.div>
      </AnimatePresence>

      {/* Quick Action Bar */}
      {!readOnly && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 print:hidden">
          <div className="glass-strong flex items-center gap-1 rounded-full border border-border/60 px-2 py-2 shadow-glow">
            <ActionBtn icon={Download} label="Export PDF" onClick={() => window.print()} />
            <ActionBtn icon={Save} label="Saved" onClick={() => toast.success("Report is saved automatically")} />
            <ActionBtn icon={Share2} label={isPublic ? "Sharing on" : "Share"} onClick={onShare} loading={busy} highlight={isPublic} />
            <ActionBtn icon={Link2} label="Copy link" onClick={onCopy} />
            <ActionBtn icon={Printer} label="Print" onClick={() => window.print()} />
          </div>
        </div>
      )}
    </div>
  );
}

function scoreToLabel(score: number) {
  if (score >= 80) return "High Potential";
  if (score >= 65) return "Promising";
  if (score >= 45) return "Needs Validation";
  return "High Risk";
}

function ActionBtn({ icon: Icon, label, onClick, loading, highlight }: any) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
        highlight ? "bg-gradient-neon text-background" : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
      } disabled:opacity-50`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ExecutiveSummary({ text, verdict }: { text?: string; verdict: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-strong relative overflow-hidden rounded-[2rem] p-10">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/40 bg-card/60 text-accent">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Executive Summary™</div>
          <div className="text-2xl font-extrabold tracking-tight">30-second briefing</div>
        </div>
      </div>
      <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground/90">
        {text || "VentureBots is preparing your executive summary. Insights from this report are distilled into a quick briefing covering overview, assessment, critical risk, biggest opportunity, and next step."}
      </p>
    </motion.div>
  );
}

function ScorePanel({ score, readiness }: { score: number; readiness: any }) {
  return (
    <div className="glass-strong relative overflow-hidden rounded-[2rem] p-8 lg:col-span-3">
      <div className="absolute inset-x-10 -top-16 h-40 rounded-full bg-gradient-neon opacity-25 blur-3xl" />
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div className="flex justify-center"><ScoreRing score={score} /></div>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Startup Health Score™</div>
          <h2 className="mt-2 font-display text-6xl font-extrabold tracking-tight">{score}<span className="text-2xl text-muted-foreground">/100</span></h2>
          <div className="mt-5 space-y-2.5">
            <ReadinessRow label="Risk Level" value={readiness.risk_level} tone={riskTone(readiness.risk_level)} />
            <ReadinessRow label="Market Readiness" value={readiness.market_readiness} tone={levelTone(readiness.market_readiness)} />
            <ReadinessRow label="Execution Readiness" value={readiness.execution_readiness} tone={levelTone(readiness.execution_readiness)} />
            <ReadinessRow label="Investor Attractiveness" value={readiness.investor_attractiveness} tone={levelTone(readiness.investor_attractiveness)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadinessRow({ label, value, tone }: { label: string; value?: string; tone: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card/40 px-4 py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold ${tone}`}>{value ?? "—"}</span>
    </div>
  );
}

function riskTone(v?: string) {
  switch ((v ?? "").toLowerCase()) {
    case "low": return "text-success";
    case "moderate": return "text-warning";
    case "high": case "critical": return "text-destructive";
    default: return "text-muted-foreground";
  }
}
function levelTone(v?: string) {
  switch ((v ?? "").toLowerCase()) {
    case "strong": case "high": return "text-success";
    case "moderate": case "medium": return "text-warning";
    case "weak": case "low": return "text-destructive";
    default: return "text-muted-foreground";
  }
}

function VerdictPanel({ verdict }: { verdict: any }) {
  const confidence = Math.max(0, Math.min(100, Number(verdict?.confidence ?? 0)));
  return (
    <div className="glass-strong relative overflow-hidden rounded-[2rem] p-8 lg:col-span-2">
      <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Startup Verdict™</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight leading-tight">{verdict?.label ?? "—"}</div>
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-[0.2em] text-muted-foreground">Confidence</span>
          <span className="font-bold">{confidence}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-card/60">
          <motion.div initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 1 }}
            className="h-full bg-gradient-neon" />
        </div>
      </div>
      <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">{verdict?.reasoning ?? "—"}</p>
    </div>
  );
}

function TopPriorities({ items }: { items: any[] }) {
  if (!items?.length) return null;
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-card/60 text-primary">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">What To Do Next</div>
          <h2 className="text-3xl font-extrabold tracking-tight">Top 3 Priorities™</h2>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.slice(0, 3).map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="card-hover relative overflow-hidden rounded-2xl border border-primary/30 bg-card/60 p-6 backdrop-blur">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-neon opacity-20 blur-3xl" />
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Priority #{i + 1}</div>
            <div className="mt-2 text-xl font-bold">{p.title}</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.detail}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] font-bold">
              <TrendingUp className="h-3 w-3" /> Impact: <span className={impactTone(p.impact)}>{p.impact ?? "Medium"}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function impactTone(v?: string) {
  switch ((v ?? "").toLowerCase()) {
    case "high": return "text-success";
    case "medium": return "text-warning";
    default: return "text-muted-foreground";
  }
}

/* -------------- TABS -------------- */

function OverviewTab({ report }: { report: any }) {
  const counts = {
    strengths: report.strengths?.length ?? 0,
    risks: report.risks?.length ?? 0,
    blind: report.blind_spots?.length ?? 0,
    opps: report.opportunities?.length ?? 0,
  };
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Stat label="Strengths" value={counts.strengths} tone="text-success" />
      <Stat label="Risks" value={counts.risks} tone="text-destructive" />
      <Stat label="Blind Spots" value={counts.blind} tone="text-warning" />
      <Stat label="Opportunities" value={counts.opps} tone="text-accent" />
      <div className="glass-strong md:col-span-4 rounded-2xl p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Snapshot</div>
        <h3 className="mt-2 text-2xl font-bold">All sections at a glance</h3>
        <p className="mt-2 text-muted-foreground">Use the navigation above to drill into any dimension. Every section is now restructured into a focused, scannable view so founders can move from insight to action without endless scrolling.</p>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: any) {
  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-5xl font-extrabold ${tone}`}>{value}</div>
    </div>
  );
}

function StrengthsTab({ items }: { items: any[] }) {
  return (
    <Grid items={items} render={(i) => (
      <ToneCard tone="success" title={i.title} detail={i.detail}
        meta={<MetaChip label="Impact" value={i.impact ?? "Medium"} tone={impactTone(i.impact)} />} />
    )} />
  );
}

function RisksTab({ items }: { items: any[] }) {
  return (
    <Grid items={items} render={(i) => (
      <ToneCard tone="destructive" title={i.title} detail={i.detail} pulse
        right={<SeverityBadge severity={i.severity} />}
        meta={<MetaChip label="Category" value={i.category ?? "—"} tone="text-destructive" />} />
    )} />
  );
}

function BlindSpotsTab({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((i: any, idx: number) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="card-hover relative overflow-hidden rounded-2xl border border-warning/40 bg-warning/5 p-6 backdrop-blur">
          <div className="flex items-center gap-2 text-warning">
            <span className="h-2 w-2 rounded-full bg-warning pulse-soft" />
            <div className="text-base font-bold">{i.title}</div>
          </div>
          <Sub label="Why it matters">{i.why_it_matters ?? i.detail}</Sub>
          <Sub label="Potential consequence">{i.consequence ?? "—"}</Sub>
          <Sub label="Recommended action">{i.action ?? "—"}</Sub>
        </motion.div>
      ))}
    </div>
  );
}

function Sub({ label, children }: any) {
  return (
    <div className="mt-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <p className="mt-1 text-[15px] leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

function OpportunitiesTab({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((o: any, idx: number) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="card-hover relative overflow-hidden rounded-2xl border border-accent/40 bg-accent/5 p-6 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="text-base font-bold text-accent">{o.title}</div>
            {o.quick_win && (
              <Badge className="border-0 bg-gradient-neon text-background"><Zap className="mr-1 h-3 w-3" /> Quick Win</Badge>
            )}
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{o.detail}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <MetaChip label="Revenue" value={o.revenue_impact ?? "—"} tone={impactTone(o.revenue_impact)} />
            <MetaChip label="Growth" value={o.growth_potential ?? "—"} tone={impactTone(o.growth_potential)} />
            <MetaChip label="Difficulty" value={o.difficulty ?? "—"} tone={difficultyTone(o.difficulty)} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function difficultyTone(v?: string) {
  switch ((v ?? "").toLowerCase()) {
    case "low": return "text-success";
    case "medium": return "text-warning";
    case "high": return "text-destructive";
    default: return "text-muted-foreground";
  }
}

function RoadmapTab({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  return (
    <div className="relative space-y-5 border-l-2 border-accent/30 pl-8">
      {items.map((w: any, idx: number) => (
        <motion.div key={idx} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }}
          className="relative">
          <div className="absolute -left-[37px] top-3 h-4 w-4 rounded-full bg-gradient-neon glow-cyan" />
          <div className="card-hover rounded-2xl border border-border bg-card/50 p-6 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Week {w.week}</div>
              {w.success_metric && (
                <span className="chip text-success border-success/40"><ShieldCheck className="h-3 w-3" /> {w.success_metric}</span>
              )}
            </div>
            <div className="mt-2 text-xl font-bold">{w.goal ?? w.title}</div>
            <ul className="mt-4 space-y-2 text-[15px] text-muted-foreground">
              {(w.tasks ?? w.actions)?.map((a: string, i: number) => (
                <li key={i} className="flex gap-3"><span className="text-accent">→</span><span>{a}</span></li>
              ))}
            </ul>
            {w.expected_outcome && (
              <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-3 text-sm">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">Expected outcome</span>
                <div className="mt-1 text-foreground/90">{w.expected_outcome}</div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PlaybookTab({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((r: any, idx: number) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="card-hover relative overflow-hidden rounded-2xl border border-accent/40 bg-card/60 p-6 backdrop-blur">
          <div className="text-base font-bold text-accent">{r.title}</div>
          <Sub label="What to do">{r.what_to_do ?? r.detail}</Sub>
          <Sub label="Why it matters">{r.why_it_matters ?? "—"}</Sub>
          <div className="mt-4 flex flex-wrap gap-2">
            <MetaChip label="Impact" value={r.expected_impact ?? "—"} tone={impactTone(r.expected_impact)} />
            <MetaChip label="Difficulty" value={r.difficulty ?? "—"} tone={difficultyTone(r.difficulty)} />
            <MetaChip label="Time" value={r.time_required ?? "—"} tone="text-muted-foreground" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function InvestorTab({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  // items may be array of strings (legacy) or { category, question }
  const normalized = items.map((it: any) =>
    typeof it === "string" ? { category: "General", question: it } : it
  );
  const groups = normalized.reduce<Record<string, any[]>>((acc, q) => {
    const k = q.category ?? "General";
    (acc[k] = acc[k] ?? []).push(q);
    return acc;
  }, {});
  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-2xl p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Investor Challenge Room™</div>
        <h3 className="mt-2 text-2xl font-bold">Prepare for the toughest questions in the room</h3>
        <p className="mt-2 text-muted-foreground">Grouped by the angles top-tier investors actually use to pressure-test founders.</p>
      </div>
      {Object.entries(groups).map(([cat, qs]) => (
        <div key={cat}>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{cat}</div>
          <div className="grid gap-3 md:grid-cols-2">
            {qs.map((q: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="card-hover relative overflow-hidden rounded-2xl border border-primary/30 bg-card/60 p-6 backdrop-blur">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">VC Question · {String(i + 1).padStart(2, "0")}</div>
                <p className="mt-3 text-lg font-semibold leading-snug">{q.question}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------- shared -------------- */

function ToneCard({ tone, title, detail, right, pulse, meta }: any) {
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
          {pulse && <span className={`h-2 w-2 rounded-full ${t.ring} pulse-soft`} />}
          <div className={`text-base font-bold ${t.text}`}>{title}</div>
        </div>
        {right}
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{detail}</p>
      {meta && <div className="mt-4 flex flex-wrap gap-2">{meta}</div>}
    </div>
  );
}

function MetaChip({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] font-bold">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className={tone}>{value}</span>
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 90, c = 2 * Math.PI * r, dash = c * (score / 100);
  return (
    <svg width="220" height="220" viewBox="0 0 240 240">
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

function Grid<T>({ items, render }: { items: T[]; render: (i: T) => React.ReactNode }) {
  if (!items?.length) return <Empty />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((i, idx) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
          {render(i)}
        </motion.div>
      ))}
    </div>
  );
}

function Empty() {
  return <div className="text-sm text-muted-foreground">No items.</div>;
}

function SeverityBadge({ severity }: { severity?: string }) {
  const s = (severity ?? "Medium").toLowerCase();
  const cls = s === "high" ? "bg-destructive text-destructive-foreground"
    : s === "medium" ? "bg-warning text-warning-foreground"
    : "bg-muted text-foreground";
  return <Badge className={`${cls} border-0`}>{severity ?? "Medium"}</Badge>;
}
