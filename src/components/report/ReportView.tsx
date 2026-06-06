import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  CheckCircle2, AlertTriangle, Eye, Lightbulb,
  Sparkles, ArrowLeft, Calendar, Download, Share2, Link2, Save, Printer,
  Target, Zap, TrendingUp, ShieldCheck, Clock, Gauge, Package,
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
  { id: "opportunities", label: "Opportunity Intelligence", icon: Lightbulb },
  { id: "roadmap", label: "30-Day Action Plan", icon: Calendar },
  { id: "playbook", label: "Recommendations", icon: Target },
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
      <ExecutiveSummary text={report.executive_summary} />

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

function ExecutiveSummary({ text }: { text?: string }) {
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
        {text || "VentureBots is preparing your executive summary."}
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
            <ReadinessRow label="Risk Level" value={readiness.risk_level} tone={levelTone(readiness.risk_level)} />
            <ReadinessRow label="Market Readiness" value={readiness.market_readiness} tone={levelTone(readiness.market_readiness)} />
            <ReadinessRow label="Execution Readiness" value={readiness.execution_readiness} tone={levelTone(readiness.execution_readiness)} />
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

function levelTone(v?: string) {
  switch ((v ?? "").toLowerCase()) {
    case "excellent": case "high": case "strong": return "text-success";
    case "medium": case "moderate": return "text-warning";
    case "low": case "very low": case "weak": case "critical": return "text-destructive";
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
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Priority #{i + 1}</div>
              {p.priority_level && <PriorityBadge level={p.priority_level} />}
            </div>
            <div className="mt-2 text-xl font-bold">{p.title}</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.reason ?? p.detail}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip label="Impact" value={p.impact ?? "Medium"} tone={impactTone(p.impact)} icon={TrendingUp} />
              <MetaChip label="Difficulty" value={p.difficulty ?? "Medium"} tone={difficultyTone(p.difficulty)} icon={Gauge} />
              <MetaChip label="Time" value={p.time_required ?? "—"} tone="text-muted-foreground" icon={Clock} />
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
  if (!items?.length) return <Empty />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((s: any, idx: number) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="card-hover relative overflow-hidden rounded-2xl border border-success/40 bg-success/5 p-6 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              <div className="text-base font-bold">{s.title}</div>
            </div>
            <MetaChip label="Impact" value={s.impact ?? "Medium"} tone={impactTone(s.impact)} />
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{s.detail}</p>
          {s.strategic_importance && <Sub label="Strategic importance">{s.strategic_importance}</Sub>}
        </motion.div>
      ))}
    </div>
  );
}

function RisksTab({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((r: any, idx: number) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="card-hover relative overflow-hidden rounded-2xl border border-destructive/40 bg-destructive/5 p-6 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-destructive">
              <span className="h-2 w-2 rounded-full bg-destructive pulse-soft" />
              <div className="text-base font-bold">{r.title}</div>
            </div>
            <SeverityBadge severity={r.severity} />
          </div>
          <div className="mt-2"><MetaChip label="Category" value={r.category ?? "—"} tone="text-destructive" /></div>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{r.detail}</p>
          {r.business_impact && <Sub label="Business impact">{r.business_impact}</Sub>}
          {r.mitigation && (
            <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">Mitigation strategy</div>
              <div className="mt-1 text-sm text-foreground/90">{r.mitigation}</div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function BlindSpotsTab({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((i: any, idx: number) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="card-hover relative overflow-hidden rounded-2xl border border-warning/40 bg-warning/5 p-6 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-warning">
              <span className="h-2 w-2 rounded-full bg-warning pulse-soft" />
              <div className="text-base font-bold">{i.title}</div>
            </div>
            {i.risk_level && <MetaChip label="Risk" value={i.risk_level} tone={difficultyTone(i.risk_level)} />}
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
          {o.suggested_action && (
            <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">Suggested action</div>
              <div className="mt-1 text-sm text-foreground/90">{o.suggested_action}</div>
            </div>
          )}
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
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Tasks</div>
                <ul className="mt-2 space-y-1.5 text-[15px] text-foreground/90">
                  {(w.tasks ?? w.actions)?.map((a: string, i: number) => (
                    <li key={i} className="flex gap-2"><span className="text-accent">→</span><span>{a}</span></li>
                  ))}
                </ul>
              </div>
              {w.deliverables?.length > 0 && (
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Deliverables</div>
                  <ul className="mt-2 space-y-1.5 text-[15px] text-foreground/90">
                    {w.deliverables.map((d: string, i: number) => (
                      <li key={i} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /><span>{d}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
          <div className="flex items-start justify-between gap-3">
            <div className="text-base font-bold text-accent">{r.title}</div>
            {r.priority_level && <PriorityBadge level={r.priority_level} />}
          </div>
          <Sub label="What to do">{r.what_to_do ?? r.detail}</Sub>
          <Sub label="Why it matters">{r.why_it_matters ?? "—"}</Sub>
          <div className="mt-4 flex flex-wrap gap-2">
            <MetaChip label="Impact" value={r.expected_impact ?? "—"} tone={impactTone(r.expected_impact)} />
            <MetaChip label="Difficulty" value={r.difficulty ?? "—"} tone={difficultyTone(r.difficulty)} />
            <MetaChip label="Time" value={r.time_required ?? "—"} tone="text-muted-foreground" icon={Clock} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PriorityBadge({ level }: { level: string }) {
  const l = level.toLowerCase();
  const cls = l === "high" ? "bg-gradient-neon text-background"
    : l === "medium" ? "bg-warning text-warning-foreground"
    : "bg-muted text-foreground";
  return <Badge className={`${cls} border-0`}>Priority · {level}</Badge>;
}

/* -------------- Investor Attractiveness (radar) -------------- */

function InvestorAttractivenessTab({ readiness, verdict }: { readiness: any; verdict: any }) {
  const fallback = [
    { dimension: "Market Size", score: 0, note: "Not assessed." },
    { dimension: "Differentiation", score: 0, note: "Not assessed." },
    { dimension: "Business Model", score: 0, note: "Not assessed." },
    { dimension: "Scalability", score: 0, note: "Not assessed." },
    { dimension: "Founder-Market Fit", score: 0, note: "Not assessed." },
    { dimension: "Investment Potential", score: 0, note: "Not assessed." },
  ];
  const breakdown: { dimension: string; score: number; note?: string }[] =
    (readiness?.breakdown?.length ? readiness.breakdown : fallback);
  const avg = breakdown.reduce((s, d) => s + (Number(d.score) || 0), 0) / breakdown.length;

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-2xl p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Investor Attractiveness Breakdown™</div>
        <h3 className="mt-2 text-2xl font-bold">VC scorecard across six dimensions</h3>
        <p className="mt-2 text-muted-foreground">How a top-tier investor would score this startup. {verdict?.label ? `Aligned with verdict: ${verdict.label}.` : ""}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="glass-strong relative flex items-center justify-center overflow-hidden rounded-2xl p-6 lg:col-span-2">
          <RadarChart data={breakdown} />
          <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">VC Scorecard</div>
          <div className="absolute bottom-4 right-4 text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Average</div>
            <div className="text-3xl font-extrabold text-gradient">{avg.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span></div>
          </div>
        </div>
        <div className="space-y-3 lg:col-span-3">
          {breakdown.map((d, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="card-hover rounded-2xl border border-border bg-card/50 p-5 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold">{d.dimension}</div>
                <div className="font-mono text-sm font-bold text-accent">{d.score}/10</div>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-card/70">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (Number(d.score) || 0) * 10)}%` }} transition={{ duration: 0.9 }}
                  className="h-full bg-gradient-neon" />
              </div>
              {d.note && <p className="mt-2 text-sm text-muted-foreground">{d.note}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RadarChart({ data }: { data: { dimension: string; score: number }[] }) {
  const size = 320;
  const cx = size / 2, cy = size / 2;
  const radius = 110;
  const n = data.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, value: number) => {
    const r = (Math.max(0, Math.min(10, value)) / 10) * radius;
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))] as const;
  };
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const polygon = data.map((d, i) => point(i, Number(d.score) || 0)).map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="radarFill" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="radarStroke" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* grid rings */}
      {gridLevels.map((lvl, i) => {
        const pts = Array.from({ length: n }, (_, k) => {
          const r = lvl * radius;
          const a = angle(k);
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ");
        return <polygon key={i} points={pts} fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth={1} />;
      })}
      {/* axes */}
      {data.map((_, i) => {
        const [x, y] = point(i, 10);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="oklch(1 0 0 / 6%)" strokeWidth={1} />;
      })}
      {/* polygon */}
      <motion.polygon
        points={polygon}
        fill="url(#radarFill)"
        stroke="url(#radarStroke)"
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* points */}
      {data.map((d, i) => {
        const [x, y] = point(i, Number(d.score) || 0);
        return <circle key={i} cx={x} cy={y} r={4} fill="#fff" stroke="url(#radarStroke)" strokeWidth={2} />;
      })}
      {/* labels */}
      {data.map((d, i) => {
        const [x, y] = point(i, 12.6);
        const anchor = Math.abs(x - cx) < 6 ? "middle" : x > cx ? "start" : "end";
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
            className="fill-foreground/80" fontSize="10" fontFamily="ui-monospace,monospace" style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {d.dimension}
          </text>
        );
      })}
    </svg>
  );
}

/* -------------- shared -------------- */

function MetaChip({ label, value, tone, icon: Icon }: { label: string; value: string; tone: string; icon?: any }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] font-bold">
      {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
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
