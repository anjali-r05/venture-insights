import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, ArrowLeft, Download, Copy, Target, Users, Route as RouteIcon,
  ListChecks, Cpu, ShieldAlert, Sparkles, CheckCircle2, XCircle, Clock,
  ChevronDown, RefreshCw, AlertTriangle,
} from "lucide-react";
import { getProductStrategy, type ProductStrategyPayload } from "@/lib/product-strategy.functions";
import { exportProductStrategyPDF } from "@/lib/product-strategy-pdf";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/product-strategy/$strategyId")({
  component: StrategyDashboard,
});

function StrategyDashboard() {
  const { strategyId } = Route.useParams();
  const navigate = useNavigate();
  const getFn = useServerFn(getProductStrategy);

  const q = useQuery({
    queryKey: ["product-strategy", strategyId],
    queryFn: () => getFn({ data: { id: strategyId } }),
    staleTime: 1000 * 60 * 10,
  });

  if (q.isLoading) return <SkeletonDashboard />;

  if (q.isError || !q.data) {
    return (
      <div className="mx-auto max-w-xl fade-up py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/40 bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Couldn't load this strategy</h1>
        <p className="mt-2 text-muted-foreground">It may not exist, or you don't have access.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" onClick={() => q.refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
          <Button asChild className="btn-neon"><Link to="/product-strategy">Back to strategies</Link></Button>
        </div>
      </div>
    );
  }

  const row = q.data;
  const s = row.strategy;

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(strategyToText(row.product_name, s));
      toast.success("Strategy copied to clipboard");
    } catch { toast.error("Copy failed"); }
  };

  return (
    <div className="mx-auto max-w-5xl fade-up">
      <StickyHeader
        productName={row.product_name}
        onBack={() => navigate({ to: "/product-strategy" })}
        onExport={() => {
          try { exportProductStrategyPDF(row.product_name, s); toast.success("PDF downloaded"); }
          catch { toast.error("Could not export PDF"); }
        }}
        onCopy={copyAll}
      />

      <div className="mt-8">
        <div className="chip text-accent border-accent/40"><Compass className="h-3.5 w-3.5" /> AI Product Strategy</div>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight md:text-6xl">{row.product_name}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
          {row.industry && <span>{row.industry}</span>}
          {row.stage && <><span>·</span><span>{row.stage}</span></>}
          <span>·</span><span>{new Date(row.created_at).toLocaleDateString()}</span>
        </div>

        {/* AI Recommendation — hero card at the top */}
        <div className="glass-strong mt-8 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-neon opacity-20 blur-3xl" />
          <div className="relative">
            <div className="chip text-accent border-accent/40"><Sparkles className="h-3.5 w-3.5" /> AI Recommendation</div>
            <p className="mt-4 text-2xl font-semibold leading-relaxed text-foreground/95">{s.ai_recommendation}</p>
          </div>
        </div>

        {/* Sections — all collapsible */}
        <div className="mt-8 space-y-4">
          <Collapsible defaultOpen title="Product Vision" icon={Target}>
            <p className="text-lg leading-relaxed text-foreground/90">{s.product_vision}</p>
          </Collapsible>

          <Collapsible defaultOpen title="Target Users" icon={Users} count={s.target_users.length}>
            <div className="grid gap-4 md:grid-cols-3">
              {s.target_users.map((u, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card/40 p-5">
                  <div className="text-xs font-mono uppercase tracking-widest text-accent">Segment {i + 1}</div>
                  <div className="mt-1 text-lg font-bold">{u.segment}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{u.description}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible defaultOpen title="MVP Features" icon={ListChecks} count={s.mvp_features.length}>
            <MvpBoard features={s.mvp_features} />
          </Collapsible>

          <Collapsible title="Recommended Tech Stack" icon={Cpu} count={s.tech_stack.length}>
            <div className="grid gap-3 md:grid-cols-2">
              {s.tech_stack.map((t, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-card/40 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-accent">{t.layer}</div>
                  <div className="mt-1 font-semibold">{t.recommendation}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.reason}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="30-Day Launch Plan" icon={RouteIcon}>
            <div className="relative space-y-4">
              <div className="absolute left-6 top-2 bottom-2 hidden w-px bg-gradient-to-b from-accent/60 via-accent/30 to-transparent md:block" />
              {s.launch_plan_30_days.map(w => (
                <div key={w.week} className="relative flex flex-col gap-4 md:flex-row">
                  <div className="flex items-start md:w-12 md:shrink-0">
                    <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-background text-sm font-bold text-accent glow">
                      W{w.week}
                    </div>
                  </div>
                  <div className="flex-1 rounded-2xl border border-border/60 bg-card/40 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-xl font-bold">{w.focus}</h3>
                      <div className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        <Clock className="h-3 w-3" /> Week {w.week}
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-sm text-foreground/90">
                      {w.tasks.map((t, i) => (
                        <li key={i} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Top 3 Risks" icon={ShieldAlert} count={s.top_risks.length}>
            <div className="grid gap-3 md:grid-cols-3">
              {s.top_risks.map((r, i) => (
                <div key={i} className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono uppercase tracking-widest text-destructive">Risk {i + 1}</div>
                    <SeverityBadge s={r.severity} />
                  </div>
                  <div className="mt-2 text-base font-semibold">{r.risk}</div>
                  <p className="mt-3 text-sm text-muted-foreground"><b className="text-accent">Mitigation · </b>{r.mitigation}</p>
                </div>
              ))}
            </div>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}

/* -------- Sub-components -------- */

function StickyHeader({ productName, onBack, onExport, onCopy }: {
  productName: string; onBack: () => void; onExport: () => void; onCopy: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-border/40 bg-background/70 px-4 py-3 backdrop-blur-xl md:-mx-8 md:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All strategies
        </button>
        <div className="hidden truncate text-sm font-semibold md:block">{productName}</div>
        <div className="flex gap-2">
          <Button onClick={onCopy} size="sm" variant="outline"><Copy className="mr-2 h-4 w-4" /> Copy</Button>
          <Button onClick={onExport} size="sm" className="btn-neon"><Download className="mr-2 h-4 w-4" /> PDF</Button>
        </div>
      </div>
    </div>
  );
}

function Collapsible({ title, icon: Icon, children, defaultOpen = false, count }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean; count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-3 p-6 text-left transition hover:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold">{title}</h2>
          {typeof count === "number" && <Badge variant="outline" className="border-accent/30 text-accent">{count}</Badge>}
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-6 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MvpBoard({ features }: { features: ProductStrategyPayload["mvp_features"] }) {
  const cols: Array<{ key: ProductStrategyPayload["mvp_features"][number]["priority"]; tone: string; icon: React.ElementType }> = [
    { key: "Build First", tone: "border-emerald-500/30 text-emerald-300", icon: CheckCircle2 },
    { key: "Build Later", tone: "border-amber-500/30 text-amber-300", icon: Clock },
    { key: "Skip for Now", tone: "border-destructive/30 text-destructive", icon: XCircle },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {cols.map(col => {
        const items = features.filter(f => f.priority === col.key);
        const Icon = col.icon;
        return (
          <div key={col.key} className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className={`chip ${col.tone}`}><Icon className="h-3.5 w-3.5" /> {col.key}</div>
            <div className="mt-4 space-y-3">
              {items.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
              {items.map((f, i) => (
                <div key={i} className="rounded-xl border border-border/40 bg-background/30 p-3">
                  <div className="font-semibold">{f.name}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SeverityBadge({ s }: { s: "High" | "Medium" | "Low" }) {
  const tone = s === "High" ? "bg-destructive/15 text-destructive border-destructive/30"
    : s === "Medium" ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  return <Badge variant="outline" className={tone}>{s}</Badge>;
}

/* -------- Skeleton (feels instant) -------- */

function SkeletonDashboard() {
  return (
    <div className="mx-auto max-w-5xl fade-up">
      <div className="mt-8 space-y-4">
        <div className="h-4 w-40 animate-pulse rounded-full bg-muted/40" />
        <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-muted/30" />
        <div className="glass-strong h-36 animate-pulse rounded-3xl bg-muted/10" />
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="glass h-24 animate-pulse rounded-3xl bg-muted/10" />
        ))}
      </div>
    </div>
  );
}

/* -------- Helpers -------- */

function strategyToText(name: string, s: ProductStrategyPayload) {
  const lines: string[] = [];
  lines.push(`# ${name} — Product Strategy`, "");
  lines.push(`## AI Recommendation`, s.ai_recommendation, "");
  lines.push(`## Product Vision`, s.product_vision, "");
  lines.push(`## Target Users`);
  s.target_users.forEach(u => lines.push(`- ${u.segment}: ${u.description}`));
  lines.push("", `## MVP Features`);
  s.mvp_features.forEach(f => lines.push(`- [${f.priority}] ${f.name} — ${f.description}`));
  lines.push("", `## Tech Stack`);
  s.tech_stack.forEach(t => lines.push(`- ${t.layer}: ${t.recommendation} — ${t.reason}`));
  lines.push("", `## 30-Day Launch Plan`);
  s.launch_plan_30_days.forEach(w => {
    lines.push(`Week ${w.week} — ${w.focus}`);
    w.tasks.forEach(t => lines.push(`  • ${t}`));
  });
  lines.push("", `## Top Risks`);
  s.top_risks.forEach(r => lines.push(`- ${r.risk} (${r.severity}) — Mitigation: ${r.mitigation}`));
  return lines.join("\n");
}
