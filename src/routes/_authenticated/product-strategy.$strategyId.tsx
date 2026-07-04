import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Compass, ArrowLeft, Download, Loader2, Target, Users, Route as RouteIcon,
  ListChecks, Layers, Cpu, ShieldAlert, Lightbulb, CheckCircle2, XCircle, Quote,
} from "lucide-react";
import { getProductStrategy, type ProductStrategyPayload } from "@/lib/product-strategy.functions";
import { exportProductStrategyPDF } from "@/lib/product-strategy-pdf";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  });

  if (q.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading strategy…
      </div>
    );
  }
  if (q.isError || !q.data) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-bold">Strategy not found</h1>
        <p className="mt-2 text-muted-foreground">This product strategy doesn't exist or you don't have access.</p>
        <Button asChild className="mt-6"><Link to="/product-strategy">Back to strategies</Link></Button>
      </div>
    );
  }

  const row = q.data;
  const s = row.strategy;

  return (
    <div className="mx-auto max-w-6xl fade-up">
      <StickyHeader
        productName={row.product_name}
        onBack={() => navigate({ to: "/product-strategy" })}
        onExport={() => {
          try { exportProductStrategyPDF(row.product_name, s); toast.success("PDF downloaded"); }
          catch { toast.error("Could not export PDF"); }
        }}
      />

      <div className="mt-8">
        <div className="chip text-accent border-accent/40"><Compass className="h-3.5 w-3.5" /> AI Product Strategy</div>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight md:text-6xl">{row.product_name}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
          {row.industry && <span>{row.industry}</span>}
          {row.stage && <><span>·</span><span>{row.stage}</span></>}
          <span>·</span><span>{new Date(row.created_at).toLocaleDateString()}</span>
        </div>

        <div className="glass-strong mt-8 rounded-3xl p-8">
          <div className="chip text-accent border-accent/40"><Target className="h-3.5 w-3.5" /> Executive Summary</div>
          <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-foreground/90">{s.executive_summary}</p>
        </div>

        <Tabs defaultValue="blueprint" className="mt-10">
          <TabsList className="glass sticky top-14 z-10 grid w-full grid-cols-4 gap-1 rounded-2xl p-1 md:grid-cols-8">
            <TabsTrigger value="blueprint"><Users className="mr-1 h-3.5 w-3.5" />Blueprint</TabsTrigger>
            <TabsTrigger value="mvp"><ListChecks className="mr-1 h-3.5 w-3.5" />MVP</TabsTrigger>
            <TabsTrigger value="priorities"><Layers className="mr-1 h-3.5 w-3.5" />Priorities</TabsTrigger>
            <TabsTrigger value="roadmap"><RouteIcon className="mr-1 h-3.5 w-3.5" />Roadmap</TabsTrigger>
            <TabsTrigger value="build-skip"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Build/Skip</TabsTrigger>
            <TabsTrigger value="tech"><Cpu className="mr-1 h-3.5 w-3.5" />Tech</TabsTrigger>
            <TabsTrigger value="ai"><Lightbulb className="mr-1 h-3.5 w-3.5" />AI Ideas</TabsTrigger>
            <TabsTrigger value="risks"><ShieldAlert className="mr-1 h-3.5 w-3.5" />Risks</TabsTrigger>
          </TabsList>

          <TabsContent value="blueprint" className="mt-8"><Blueprint s={s} /></TabsContent>
          <TabsContent value="mvp" className="mt-8"><MVP s={s} /></TabsContent>
          <TabsContent value="priorities" className="mt-8"><Priorities s={s} /></TabsContent>
          <TabsContent value="roadmap" className="mt-8"><Roadmap s={s} /></TabsContent>
          <TabsContent value="build-skip" className="mt-8"><BuildSkip s={s} /></TabsContent>
          <TabsContent value="tech" className="mt-8"><TechStack s={s} /></TabsContent>
          <TabsContent value="ai" className="mt-8"><AISuggestions s={s} /></TabsContent>
          <TabsContent value="risks" className="mt-8"><Risks s={s} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StickyHeader({ productName, onBack, onExport }: { productName: string; onBack: () => void; onExport: () => void }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-border/40 bg-background/70 px-4 py-3 backdrop-blur-xl md:-mx-8 md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All strategies
        </button>
        <div className="hidden truncate text-sm font-semibold md:block">{productName}</div>
        <Button onClick={onExport} size="sm" className="btn-neon">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>
    </div>
  );
}

/* ---------- Sections ---------- */

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-6 md:p-8"
    >
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-5 w-5 text-accent" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function Blueprint({ s }: { s: ProductStrategyPayload }) {
  const b = s.blueprint;
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Product Vision" icon={Target}>
          <p className="text-lg leading-relaxed text-foreground/90">{b.product_vision}</p>
        </SectionCard>
        <SectionCard title="Core Problem" icon={ShieldAlert}>
          <p className="text-lg leading-relaxed text-foreground/90">{b.core_problem}</p>
        </SectionCard>
      </div>

      <SectionCard title="Target User Segments" icon={Users}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {b.target_users.map((u, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="text-xs font-mono uppercase tracking-widest text-accent">Segment</div>
              <div className="mt-1 text-lg font-bold">{u.segment}</div>
              <p className="mt-2 text-sm text-muted-foreground">{u.who_they_are}</p>
              <div className="mt-3 rounded-lg bg-accent/10 p-3 text-sm">
                <span className="font-semibold text-accent">Core need · </span>{u.core_need}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="User Personas" icon={Users}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {b.personas.map((p, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/60 to-card/20 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-neon text-lg font-bold text-primary-foreground">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.role}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.context}</p>
              <div className="mt-3 text-sm"><b className="text-accent">Goal:</b> {p.primary_goal}</div>
              <div className="mt-1 text-sm"><b className="text-destructive">Frustration:</b> {p.biggest_frustration}</div>
              <div className="mt-4 flex gap-2 rounded-lg bg-white/5 p-3 italic text-sm text-foreground/80">
                <Quote className="h-4 w-4 shrink-0 text-accent" />"{p.quote}"
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="User Journey" icon={RouteIcon}>
        <div className="space-y-3">
          {b.user_journey.map((j, i) => (
            <div key={i} className="grid gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 md:grid-cols-[auto_1fr_1fr_auto] md:items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">{i + 1}</div>
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{j.stage}</div>
                <div className="mt-1 text-sm font-semibold">{j.user_action}</div>
              </div>
              <div className="text-sm text-muted-foreground">→ {j.product_response}</div>
              <Badge variant="outline" className="border-accent/40 text-accent">{j.emotion}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Product Goals" icon={Target}>
        <div className="grid gap-4 md:grid-cols-3">
          {b.product_goals.map((g, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="text-lg font-bold">{g.goal}</div>
              <p className="mt-2 text-sm text-muted-foreground">{g.why_it_matters}</p>
              <div className="mt-3 rounded-lg bg-accent/10 p-3 text-xs">
                <span className="font-mono uppercase tracking-widest text-accent">Metric · </span>{g.success_metric}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function MVP({ s }: { s: ProductStrategyPayload }) {
  const m = s.mvp;
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="MVP Hypothesis" icon={Target}>
          <p className="text-lg leading-relaxed">{m.hypothesis}</p>
        </SectionCard>
        <SectionCard title="Core Value Loop" icon={RouteIcon}>
          <p className="text-lg leading-relaxed">{m.core_value_loop}</p>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <FeatureColumn title="Must Have" tone="critical" items={m.must_have.map(f => ({
          feature: f.feature, top: f.why_in_mvp, bottom: `Risk if missing: ${f.risk_if_missing}`,
        }))} />
        <FeatureColumn title="Nice To Have" tone="warn" items={m.nice_to_have.map(f => ({
          feature: f.feature, top: f.why_deferred, bottom: `Build when: ${f.trigger_to_build}`,
        }))} />
        <FeatureColumn title="Future Features" tone="cool" items={m.future_features.map(f => ({
          feature: f.feature, top: f.why_later, bottom: `Unlocks: ${f.unlocks}`,
        }))} />
      </div>
    </div>
  );
}

function FeatureColumn({ title, tone, items }: {
  title: string; tone: "critical" | "warn" | "cool";
  items: { feature: string; top: string; bottom: string }[];
}) {
  const toneMap = {
    critical: "border-destructive/40 text-destructive",
    warn: "border-yellow-400/40 text-yellow-300",
    cool: "border-accent/40 text-accent",
  };
  return (
    <div className="glass rounded-3xl p-5">
      <div className={`chip ${toneMap[tone]}`}>{title}</div>
      <div className="mt-4 space-y-3">
        {items.map((f, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card/40 p-4">
            <div className="font-semibold">{f.feature}</div>
            <p className="mt-1 text-sm text-muted-foreground">{f.top}</p>
            <div className="mt-2 text-xs font-mono uppercase tracking-widest text-accent/80">{f.bottom}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Priorities({ s }: { s: ProductStrategyPayload }) {
  const [filter, setFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const list = useMemo(
    () => filter === "All" ? s.feature_priorities : s.feature_priorities.filter(f => f.priority === filter),
    [filter, s.feature_priorities],
  );
  const impactTone = (t: string) =>
    t === "High" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" :
    t === "Medium" ? "bg-amber-500/15 text-amber-300 border-amber-500/30" :
    "bg-slate-500/15 text-slate-300 border-slate-500/30";
  const priorityTone = (t: string) =>
    t === "High" ? "bg-destructive/15 text-destructive border-destructive/30" :
    t === "Medium" ? "bg-accent/15 text-accent border-accent/30" :
    "bg-muted text-muted-foreground border-border";
  const complexityTone = (t: string) =>
    t === "High" ? "bg-purple-500/15 text-purple-300 border-purple-500/30" :
    t === "Medium" ? "bg-blue-500/15 text-blue-300 border-blue-500/30" :
    "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";

  return (
    <SectionCard title="Feature Priority Matrix" icon={Layers}>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", "High", "Medium", "Low"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              filter === f ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/40"
            }`}>{f}</button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-3">Feature</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Complexity</th>
              <th className="p-3">Impact</th>
            </tr>
          </thead>
          <tbody>
            {list.map((f, i) => (
              <tr key={i} className="border-t border-border/40 align-top">
                <td className="p-3">
                  <div className="font-semibold">{f.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{f.purpose}</div>
                  <div className="mt-2 text-xs italic text-muted-foreground/80">Why: {f.reason}</div>
                </td>
                <td className="p-3"><Badge variant="outline" className={priorityTone(f.priority)}>{f.priority}</Badge></td>
                <td className="p-3"><Badge variant="outline" className={complexityTone(f.complexity)}>{f.complexity}</Badge></td>
                <td className="p-3"><Badge variant="outline" className={impactTone(f.business_impact)}>{f.business_impact}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function Roadmap({ s }: { s: ProductStrategyPayload }) {
  return (
    <SectionCard title="Product Roadmap" icon={RouteIcon}>
      <div className="relative space-y-6">
        <div className="absolute left-6 top-2 bottom-2 hidden w-px bg-gradient-to-b from-accent/60 via-accent/30 to-transparent md:block" />
        {s.roadmap.map((ph) => (
          <div key={ph.phase} className="relative flex flex-col gap-4 md:flex-row">
            <div className="flex items-start md:w-12 md:shrink-0">
              <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-background text-lg font-bold text-accent glow">
                {ph.phase}
              </div>
            </div>
            <div className="flex-1 rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-bold">{ph.name}</h3>
                <div className="font-mono text-xs uppercase tracking-widest text-accent">{ph.timeline}</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{ph.objective}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ph.features.map((f, i) => (
                  <span key={i} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs">{f}</span>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-white/5 p-3 text-sm">
                <span className="font-semibold text-accent">Success · </span>{ph.success_criteria}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function BuildSkip({ s }: { s: ProductStrategyPayload }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Build Now" icon={CheckCircle2}>
        <div className="space-y-3">
          {s.build_vs_skip.build_now.map((b, i) => (
            <div key={i} className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                <div>
                  <div className="font-semibold">{b.feature}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{b.why}</p>
                  <div className="mt-2 text-xs font-mono uppercase tracking-widest text-emerald-300">
                    Outcome · {b.expected_outcome}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Skip For Now" icon={XCircle}>
        <div className="space-y-3">
          {s.build_vs_skip.skip_for_now.map((b, i) => (
            <div key={i} className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <div className="font-semibold">{b.feature}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{b.why_skip}</p>
                  <div className="mt-2 text-xs font-mono uppercase tracking-widest text-destructive/80">
                    Revisit · {b.when_to_revisit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function TechStack({ s }: { s: ProductStrategyPayload }) {
  const t = s.technical_suggestions;
  return (
    <div className="grid gap-6">
      <SectionCard title="Recommended Tech Stack" icon={Cpu}>
        <div className="grid gap-3 md:grid-cols-2">
          {t.tech_stack.map((row, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card/40 p-4">
              <div className="text-xs font-mono uppercase tracking-widest text-accent">{row.layer}</div>
              <div className="mt-1 text-lg font-bold">{row.recommendation}</div>
              <p className="mt-1 text-sm text-muted-foreground">{row.reason}</p>
              <div className="mt-2 text-xs text-muted-foreground/80">Alt: {row.alternative}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Architecture" icon={Layers}>
          <div className="text-lg font-bold">{t.architecture.pattern}</div>
          <p className="mt-2 text-sm text-muted-foreground">{t.architecture.reason}</p>
          <div className="mt-3 rounded-lg bg-white/5 p-3 text-sm text-foreground/80">{t.architecture.diagram_notes}</div>
        </SectionCard>
        <SectionCard title="Database" icon={Layers}>
          <div className="text-lg font-bold">{t.database.type}</div>
          <p className="mt-2 text-sm text-muted-foreground">{t.database.reason}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {t.database.key_tables.map((k, i) => (
              <span key={i} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs">{k}</span>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="APIs" icon={Cpu}>
          <div className="space-y-2">
            {t.apis.map((a, i) => (
              <div key={i} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-sm text-muted-foreground">{a.purpose}</div>
                </div>
                <Badge variant="outline" className="border-accent/40 text-accent">{a.priority}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="AI Models" icon={Lightbulb}>
          <div className="space-y-2">
            {t.ai_models.map((m, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card/40 p-3">
                <div className="text-xs font-mono uppercase tracking-widest text-accent">{m.use_case}</div>
                <div className="mt-1 font-semibold">{m.model_recommendation}</div>
                <p className="mt-1 text-sm text-muted-foreground">{m.reason}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function AISuggestions({ s }: { s: ProductStrategyPayload }) {
  const typeTone: Record<string, string> = {
    "Missing": "border-yellow-400/40 text-yellow-300",
    "Competitor Parity": "border-blue-400/40 text-blue-300",
    "Retention": "border-emerald-400/40 text-emerald-300",
    "UX": "border-pink-400/40 text-pink-300",
    "AI-Powered": "border-purple-400/40 text-purple-300",
  };
  return (
    <SectionCard title="AI Product Suggestions" icon={Lightbulb}>
      <div className="grid gap-4 md:grid-cols-2">
        {s.ai_suggestions.map((sg, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card/40 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={typeTone[sg.type] ?? "border-accent/40 text-accent"}>{sg.type}</Badge>
              <Badge variant="outline" className="border-accent/40 text-accent">Impact: {sg.expected_impact}</Badge>
            </div>
            <div className="mt-2 text-lg font-bold">{sg.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{sg.detail}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function Risks({ s }: { s: ProductStrategyPayload }) {
  const sevTone = (t: string) =>
    t === "High" ? "border-destructive/40 text-destructive" :
    t === "Medium" ? "border-amber-400/40 text-amber-300" :
    "border-emerald-400/40 text-emerald-300";
  return (
    <SectionCard title="Product Risks" icon={ShieldAlert}>
      <div className="grid gap-4 md:grid-cols-2">
        {s.risks.map((r, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card/40 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-lg font-bold">{r.risk}</div>
              <Badge variant="outline" className={sevTone(r.severity)}>{r.severity}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.why_it_applies}</p>
            <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm">
              <span className="font-semibold text-destructive">Consequence · </span>{r.consequence}
            </div>
            <div className="mt-2 rounded-lg bg-emerald-500/10 p-3 text-sm">
              <span className="font-semibold text-emerald-300">How to avoid · </span>{r.how_to_avoid}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
