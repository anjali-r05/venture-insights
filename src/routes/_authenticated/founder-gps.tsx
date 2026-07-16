import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Compass, Sparkles, Zap, TrendingUp, Trophy, Users, Brain, Layers, Briefcase,
  Radar, AlertTriangle, Rocket, Target, CheckCircle2, Circle, Calendar, Clock,
  MessageSquare, Send, Bot, Award, Flame, Gauge, Activity, ArrowRight, ArrowUp,
  ArrowDown, ShieldCheck, Bell, LineChart, PieChart, Lightbulb, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { isFounderGpsUnlocked } from "@/lib/founder-gps-unlock";

export const Route = createFileRoute("/_authenticated/founder-gps")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isFounderGpsUnlocked()) {
      throw redirect({ to: "/premium" });
    }
  },
  component: FounderGpsPage,
});

// ---------- helpers ----------
function useGreeting(name: string) {
  const hour = new Date().getHours();
  const g = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${g} ${name}`;
}

function Radial({ value, size = 140, label, sub }: { value: number; size?: number; label: string; sub?: string }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`g-${label}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ec4899" />
            <stop offset="0.5" stopColor="#a855f7" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(1 0 0 / 8%)" strokeWidth={10} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={`url(#g-${label})`} strokeWidth={10} fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-3xl font-extrabold">{value}</div>
        {sub && <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{sub}</div>}
      </div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
    </div>
  );
}

function Bar({ label, value, tone = "primary" }: { label: string; value: number; tone?: "primary" | "accent" | "warning" | "success" }) {
  const cls =
    tone === "accent" ? "from-accent to-cyan"
    : tone === "warning" ? "from-warning to-primary"
    : tone === "success" ? "from-success to-accent"
    : "from-primary to-secondary";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }}
          className={`h-full rounded-full bg-gradient-to-r ${cls}`}
        />
      </div>
    </div>
  );
}

// ---------- mock strategic intelligence ----------
const northStar = {
  sentence: "Validate willingness-to-pay with 15 paid design-partner conversations before building another feature.",
  why: "Your product velocity is high but revenue signal is weak. Without validated pricing you'll ship a feature roadmap that no one will pay for.",
  ifIgnored: "You lose ~3 weeks of runway and enter your seed round with zero commercial evidence — the #1 reason pre-seed decks are rejected.",
};

const health = [
  { k: "Product", v: 82, tone: "accent" as const },
  { k: "Market Fit", v: 61, tone: "primary" as const },
  { k: "Customers", v: 48, tone: "warning" as const },
  { k: "Growth", v: 55, tone: "primary" as const },
  { k: "Brand", v: 71, tone: "accent" as const },
  { k: "Finance", v: 64, tone: "primary" as const },
  { k: "Operations", v: 78, tone: "accent" as const },
  { k: "Execution", v: 88, tone: "success" as const },
  { k: "Funding", v: 42, tone: "warning" as const },
  { k: "Hiring", v: 58, tone: "primary" as const },
  { k: "Legal", v: 74, tone: "accent" as const },
];

const ventureScore = [
  { k: "Market", v: 78 }, { k: "Problem", v: 82 }, { k: "Traction", v: 54 },
  { k: "Execution", v: 88 }, { k: "Team", v: 76 }, { k: "Product", v: 81 },
  { k: "Revenue", v: 44 }, { k: "Financials", v: 62 }, { k: "Competition", v: 66 },
  { k: "Technology", v: 84 },
];

const priorities = [
  { title: "Interview 15 target buyers about pricing", impact: 95, urgency: 92, hours: 8, conf: 96, diff: "Medium" },
  { title: "Rewrite landing page around 'time saved'", impact: 78, urgency: 74, hours: 4, conf: 88, diff: "Low" },
  { title: "Draft a 12-slide seed teaser deck", impact: 71, urgency: 60, hours: 6, conf: 82, diff: "Medium" },
  { title: "Ship usage-based pricing experiment", impact: 84, urgency: 80, hours: 12, conf: 74, diff: "High" },
  { title: "Set up weekly cohort retention tracking", impact: 68, urgency: 55, hours: 3, conf: 90, diff: "Low" },
];

const risks = [
  { name: "Weak product-market fit signal", sev: "High", prob: 62, mitig: "Run pricing interviews this week." },
  { name: "Runway < 5 months", sev: "High", prob: 78, mitig: "Prepare bridge SAFE + cut two non-critical tools." },
  { name: "Solo-founder burnout risk", sev: "Medium", prob: 55, mitig: "Block Sat/Sun off; hire a fractional ops lead." },
  { name: "Competitor raised $6M last week", sev: "Medium", prob: 48, mitig: "Sharpen differentiation on one wedge." },
];

const roadmap = [
  { day: "Mon", goal: "Draft pricing interview script + book 5 calls", eff: "3h", out: "Calendar filled" },
  { day: "Tue", goal: "3 buyer calls · log willingness-to-pay", eff: "3h", out: "Pricing hypothesis" },
  { day: "Wed", goal: "Rewrite hero + pricing page", eff: "4h", out: "Live copy shipped" },
  { day: "Thu", goal: "3 more calls + investor update draft", eff: "4h", out: "Draft ready" },
  { day: "Fri", goal: "Ship pricing experiment + analytics", eff: "5h", out: "Live A/B test" },
  { day: "Sat", goal: "Rest · read 1 strategy essay", eff: "1h", out: "Recharge" },
  { day: "Sun", goal: "Weekly review · plan next sprint", eff: "1h", out: "New North Star" },
];

const compass = {
  decision: "Delay the mobile app 4 weeks and double-down on paid design partners.",
  reasoning: "You have 3 warm inbound buyers and no paying customer. Mobile ships to a 0-revenue base.",
  roi: "+₹4.2L ARR probability within 60 days",
  risk: "Slower brand momentum on Product Hunt",
  conf: 92,
  alts: ["Ship mobile as PWA-lite in 1 week", "Hire contractor to build in parallel"],
};

const boardroom = [
  { role: "CEO", advice: "Focus. Kill 40% of your backlog this week.", tone: "primary" },
  { role: "CTO", advice: "PWA over native — 10x cheaper validation.", tone: "accent" },
  { role: "CMO", advice: "Lead with a wedge story, not a platform story.", tone: "primary" },
  { role: "CFO", advice: "Extend runway 2 months by pausing 3 SaaS tools.", tone: "warning" },
  { role: "VC", advice: "Show me revenue traction before Series terms.", tone: "primary" },
  { role: "Product", advice: "Pricing page = product #1 this week.", tone: "accent" },
  { role: "Growth", advice: "Warm intros > paid ads at your stage.", tone: "accent" },
  { role: "Legal", advice: "Get SAFE templates in India + US ready.", tone: "warning" },
];

const predictive = [
  { k: "Probability of success (12mo)", v: "62%", trend: "up" },
  { k: "Projected burn (₹/mo)", v: "₹4.8L", trend: "down" },
  { k: "Runway", v: "4.2 mo", trend: "down" },
  { k: "Revenue in 90 days", v: "₹3.6L", trend: "up" },
  { k: "Funding probability (seed)", v: "48%", trend: "up" },
];

const opportunities = [
  { name: "Y Combinator W27", type: "Accelerator", fit: 84 },
  { name: "AngelList India Seed Syndicate", type: "Investor", fit: 78 },
  { name: "TiE Global Pitch 2026", type: "Competition", fit: 72 },
  { name: "SIDBI Startup Grant", type: "Grant", fit: 65 },
  { name: "AWS Activate Portfolio", type: "Credits · $100k", fit: 90 },
];

const dna = {
  score: 84,
  traits: [
    { k: "Leadership", v: 82 }, { k: "Decision speed", v: 88 }, { k: "Execution", v: 91 },
    { k: "Risk appetite", v: 74 }, { k: "Communication", v: 68 }, { k: "Learning", v: 92 },
  ],
  strengths: ["Ships fast", "High-agency", "Product intuition"],
  weaknesses: ["Delegation", "Financial modeling"],
  blindspots: ["Over-indexes on features vs. pricing", "Under-invests in narrative"],
};

const timeline = [
  { m: "MVP complete", when: "3 weeks" },
  { m: "First 10 paying users", when: "6 weeks" },
  { m: "100 users", when: "10 weeks" },
  { m: "1,000 users", when: "5 months" },
  { m: "₹10L ARR", when: "7 months" },
  { m: "Seed round closed", when: "9 months" },
];

const notifications = [
  { icon: Bell, text: "Investor update due tomorrow", tone: "warning" },
  { icon: Trophy, text: "New match: Sequsurge Accelerator (fit 88%)", tone: "accent" },
  { icon: AlertTriangle, text: "Runway crossed 5-month threshold", tone: "destructive" },
  { icon: Sparkles, text: "You hit a 12-week execution streak 🔥", tone: "primary" },
];

// ---------- component ----------
function FounderGpsPage() {
  const { user } = Route.useRouteContext();
  const name = (user.user_metadata as any)?.full_name?.split(" ")?.[0] ?? "Founder";
  const greeting = useGreeting(name);

  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    const n = new Set(checked); n.has(i) ? n.delete(i) : n.add(i); setChecked(n);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 fade-up">
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] neon-border p-8 md:p-12"
      >
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -right-16 top-10 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute inset-0 grid-bg" />
        </div>
        <div className="relative">
          <div className="chip text-accent border-accent/40"><Crown className="h-3.5 w-3.5" /> Founder GPS™ · Chief Strategy Officer</div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">
            {greeting} <span className="inline-block">👋</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            This week your startup needs <span className="text-gradient font-semibold">clarity, not complexity</span>.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <div className="md:col-span-2 rounded-2xl glass p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-accent">Today's Mission</div>
              <div className="mt-2 text-2xl font-bold text-balance">Validate pricing before building another feature.</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip text-success border-success/40"><Gauge className="h-3 w-3" /> Impact · High</span>
                <span className="chip text-accent border-accent/40"><Clock className="h-3 w-3" /> 5 hours</span>
              </div>
            </div>
            <MiniStat big label="AI Confidence" value="96%" icon={Sparkles} />
            <MiniStat big label="Momentum" value="+18%" icon={Flame} tone="primary" />
          </div>
        </div>
      </motion.section>

      {/* NORTH STAR */}
      <section className="relative overflow-hidden rounded-3xl glass p-8">
        <div className="chip text-primary border-primary/40"><Target className="h-3.5 w-3.5" /> AI Weekly North Star</div>
        <h2 className="mt-4 text-3xl font-extrabold text-balance md:text-4xl">"{northStar.sentence}"</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoBlock title="Why this matters" tone="accent" text={northStar.why} />
          <InfoBlock title="If ignored" tone="destructive" text={northStar.ifIgnored} />
        </div>
      </section>

      {/* SCORE CLUSTER */}
      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl glass p-8 md:col-span-1">
          <div className="chip text-accent border-accent/40"><Trophy className="h-3.5 w-3.5" /> VentureScore™</div>
          <div className="mt-6 flex flex-col items-center">
            <Radial value={73} size={180} label="Investable" sub="/ 100" />
            <div className="mt-3 inline-flex items-center gap-1 text-xs text-success">
              <ArrowUp className="h-3 w-3" /> +6 this week — driven by execution & product
            </div>
          </div>
          <div className="mt-6 space-y-2.5">
            {ventureScore.slice(0, 5).map((s) => (
              <Bar key={s.k} label={s.k} value={s.v} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl glass p-8 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="chip text-primary border-primary/40"><Activity className="h-3.5 w-3.5" /> Startup Health</div>
            <div className="font-mono text-xs text-muted-foreground">Overall <span className="font-display text-lg font-extrabold text-foreground">66</span>/100</div>
          </div>
          <div className="mt-6 grid gap-x-8 gap-y-3 md:grid-cols-2">
            {health.map((h) => (
              <Bar key={h.k} label={h.k} value={h.v} tone={h.tone} />
            ))}
          </div>
        </div>
      </section>

      {/* TABS */}
      <Tabs defaultValue="compass" className="w-full">
        <TabsList className="glass !h-auto flex w-full flex-wrap gap-1 rounded-2xl p-1.5">
          <TabsTrigger value="compass"><Compass className="mr-1.5 h-3.5 w-3.5" /> Decision Compass</TabsTrigger>
          <TabsTrigger value="priorities"><Zap className="mr-1.5 h-3.5 w-3.5" /> Priorities</TabsTrigger>
          <TabsTrigger value="roadmap"><Calendar className="mr-1.5 h-3.5 w-3.5" /> Weekly Roadmap</TabsTrigger>
          <TabsTrigger value="dna"><Brain className="mr-1.5 h-3.5 w-3.5" /> Founder DNA</TabsTrigger>
          <TabsTrigger value="boardroom"><Users className="mr-1.5 h-3.5 w-3.5" /> Boardroom</TabsTrigger>
          <TabsTrigger value="risks"><Radar className="mr-1.5 h-3.5 w-3.5" /> Risks</TabsTrigger>
          <TabsTrigger value="predict"><LineChart className="mr-1.5 h-3.5 w-3.5" /> Predictive</TabsTrigger>
          <TabsTrigger value="opps"><Rocket className="mr-1.5 h-3.5 w-3.5" /> Opportunities</TabsTrigger>
          <TabsTrigger value="twin"><Layers className="mr-1.5 h-3.5 w-3.5" /> Startup Twin</TabsTrigger>
          <TabsTrigger value="investor"><Briefcase className="mr-1.5 h-3.5 w-3.5" /> Investor</TabsTrigger>
        </TabsList>

        {/* Decision Compass */}
        <TabsContent value="compass" className="mt-6">
          <div className="rounded-3xl glass p-8">
            <div className="chip text-primary border-primary/40"><Compass className="h-3.5 w-3.5" /> Strategic Decision</div>
            <h3 className="mt-4 text-3xl font-extrabold text-balance">{compass.decision}</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <StatMini label="Confidence" value={`${compass.conf}%`} tone="accent" />
              <StatMini label="Expected ROI" value={compass.roi} tone="success" />
              <StatMini label="Risk" value={compass.risk} tone="warning" />
              <StatMini label="Recommendation" value="Act now" tone="primary" />
            </div>
            <div className="mt-6 rounded-2xl border border-border/50 bg-card/40 p-5">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Reasoning</div>
              <p className="mt-2 text-sm">{compass.reasoning}</p>
              <div className="mt-5 text-xs font-mono uppercase tracking-widest text-muted-foreground">Alternatives</div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {compass.alts.map((a) => (
                  <li key={a} className="flex items-start gap-2"><ArrowRight className="mt-0.5 h-3.5 w-3.5 text-accent" /> {a}</li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* Priorities */}
        <TabsContent value="priorities" className="mt-6 space-y-3">
          {priorities.map((p, i) => (
            <motion.div key={p.title}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card-hover rounded-2xl glass p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary font-display font-extrabold text-primary-foreground">#{i + 1}</div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.title}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span className="chip"><TrendingUp className="h-3 w-3" /> Impact {p.impact}</span>
                      <span className="chip"><Flame className="h-3 w-3 text-primary" /> Urgency {p.urgency}</span>
                      <span className="chip"><Clock className="h-3 w-3" /> {p.hours}h</span>
                      <span className="chip"><Sparkles className="h-3 w-3 text-accent" /> {p.conf}% conf</span>
                      <span className="chip">{p.diff}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="glass"><CheckCircle2 className="mr-2 h-4 w-4 text-success" /> Commit</Button>
              </div>
            </motion.div>
          ))}
        </TabsContent>

        {/* Weekly Roadmap */}
        <TabsContent value="roadmap" className="mt-6">
          <div className="grid gap-3 md:grid-cols-7">
            {roadmap.map((d, i) => (
              <button key={d.day} onClick={() => toggle(i)}
                className={`text-left rounded-2xl p-5 transition ${checked.has(i) ? "border-success/40 bg-success/10" : "glass"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-accent">{d.day}</div>
                  {checked.has(i) ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="mt-3 text-sm font-semibold text-balance">{d.goal}</div>
                <div className="mt-3 text-[11px] text-muted-foreground">Effort · {d.eff}</div>
                <div className="text-[11px] text-muted-foreground">Output · {d.out}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl glass p-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold">Weekly completion</span>
              <span className="font-mono">{checked.size}/{roadmap.length}</span>
            </div>
            <Progress value={(checked.size / roadmap.length) * 100} />
          </div>
        </TabsContent>

        {/* DNA */}
        <TabsContent value="dna" className="mt-6">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl glass p-8 md:col-span-1">
              <div className="chip text-primary border-primary/40"><Brain className="h-3.5 w-3.5" /> Founder DNA Score</div>
              <div className="mt-6 flex justify-center">
                <Radial value={dna.score} label="DNA" sub="Executor-visionary" />
              </div>
              <div className="mt-6 space-y-2.5">
                {dna.traits.map((t) => <Bar key={t.k} label={t.k} value={t.v} />)}
              </div>
            </div>
            <div className="rounded-3xl glass p-8 md:col-span-2 space-y-5">
              <TraitList title="Strengths" items={dna.strengths} tone="success" icon={Award} />
              <TraitList title="Weaknesses" items={dna.weaknesses} tone="warning" icon={AlertTriangle} />
              <TraitList title="Blind spots" items={dna.blindspots} tone="destructive" icon={Radar} />
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <div className="text-xs font-mono uppercase tracking-widest text-primary">Adaptive recommendation</div>
                <p className="mt-2 text-sm">You ship fast but skip narrative — invest 2h/week writing a public build log. Your investor conviction score jumps ~14 pts within 6 weeks.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Boardroom */}
        <TabsContent value="boardroom" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {boardroom.map((b, i) => (
              <motion.div key={b.role}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl glass p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground font-display font-extrabold">
                    {b.role[0]}
                  </div>
                  <div>
                    <div className="font-semibold">AI {b.role}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Advisor</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-balance">"{b.advice}"</p>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Risks */}
        <TabsContent value="risks" className="mt-6 space-y-3">
          {risks.map((r) => (
            <div key={r.name} className="rounded-2xl glass p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${r.sev === "High" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">Severity · {r.sev} · Probability {r.prob}%</div>
                  </div>
                </div>
                <div className="max-w-md text-right text-sm text-muted-foreground">→ {r.mitig}</div>
              </div>
              <div className="mt-3"><Progress value={r.prob} /></div>
            </div>
          ))}
        </TabsContent>

        {/* Predictive */}
        <TabsContent value="predict" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {predictive.map((p) => (
            <div key={p.k} className="rounded-2xl glass p-6">
              <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{p.k}</div>
              <div className="mt-3 flex items-end justify-between">
                <div className="font-display text-3xl font-extrabold">{p.v}</div>
                <div className={`inline-flex items-center gap-1 text-xs ${p.trend === "up" ? "text-success" : "text-destructive"}`}>
                  {p.trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />} weekly
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-2xl glass p-6 md:col-span-2 lg:col-span-3">
            <div className="chip text-accent border-accent/40"><PieChart className="h-3 w-3" /> Success Timeline</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {timeline.map((t) => (
                <div key={t.m} className="rounded-xl border border-border/60 bg-card/40 px-4 py-3">
                  <div className="text-xs text-muted-foreground">{t.when}</div>
                  <div className="font-semibold">{t.m}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Opportunities */}
        <TabsContent value="opps" className="mt-6 space-y-3">
          {opportunities.map((o) => (
            <div key={o.name} className="card-hover flex items-center justify-between rounded-2xl glass p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><Rocket className="h-5 w-5" /></div>
                <div>
                  <div className="font-semibold">{o.name}</div>
                  <div className="text-xs text-muted-foreground">{o.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden w-32 md:block"><Progress value={o.fit} /></div>
                <div className="chip text-accent border-accent/40">Fit {o.fit}%</div>
                <Button variant="outline" size="sm">Explore</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Twin / What-if */}
        <TabsContent value="twin" className="mt-6">
          <WhatIfSimulator />
        </TabsContent>

        {/* Investor Readiness */}
        <TabsContent value="investor" className="mt-6">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl glass p-8">
              <div className="chip text-accent border-accent/40"><ShieldCheck className="h-3.5 w-3.5" /> Investor Readiness</div>
              <div className="mt-6 flex justify-center"><Radial value={64} label="Ready" sub="/ 100" /></div>
            </div>
            <div className="rounded-3xl glass p-8 md:col-span-2">
              <div className="font-semibold">Missing requirements</div>
              <ul className="mt-3 space-y-2 text-sm">
                {["Financial model (3-year)", "Cap table snapshot", "10 customer testimonials", "12-slide narrative deck"].map((r) => (
                  <li key={r} className="flex items-center gap-2"><Circle className="h-3.5 w-3.5 text-warning" /> {r}</li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm">
                <div className="text-xs font-mono uppercase tracking-widest text-primary">AI Suggestion</div>
                <p className="mt-2">Prioritize the financial model + 3 lighthouse testimonials this sprint. Readiness jumps from 64 → 82 in 10 days.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* NOTIFICATIONS + GAMIFICATION */}
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl glass p-7 lg:col-span-2">
          <div className="chip text-primary border-primary/40"><Bell className="h-3.5 w-3.5" /> AI Notifications</div>
          <div className="mt-5 space-y-3">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 p-4">
                <n.icon className={`h-4 w-4 ${n.tone === "destructive" ? "text-destructive" : n.tone === "warning" ? "text-warning" : n.tone === "accent" ? "text-accent" : "text-primary"}`} />
                <div className="text-sm">{n.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl glass p-7">
          <div className="chip text-accent border-accent/40"><Award className="h-3.5 w-3.5" /> Founder Level</div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="font-display text-5xl font-extrabold text-gradient">Lv 7</div>
              <div className="text-xs text-muted-foreground">1,240 / 1,800 XP</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs">
              <Flame className="h-3.5 w-3.5 text-primary" /> 12-week streak
            </div>
          </div>
          <div className="mt-4"><Progress value={68} /></div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {["Shipped MVP", "5 investors", "First revenue"].map((b) => (
              <div key={b} className="rounded-xl border border-border/60 bg-card/40 p-3 text-center text-[11px]">
                <Award className="mx-auto h-4 w-4 text-accent" />
                <div className="mt-1">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOATING ASSISTANT */}
      <FloatingAssistant />
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, tone = "accent", big }: any) {
  return (
    <div className={`rounded-2xl glass p-6 ${big ? "" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
        {Icon && <Icon className={`h-4 w-4 ${tone === "primary" ? "text-primary" : "text-accent"}`} />}
      </div>
      <div className="mt-3 font-display text-3xl font-extrabold">{value}</div>
    </div>
  );
}

function InfoBlock({ title, text, tone }: { title: string; text: string; tone: "accent" | "destructive" }) {
  const cls = tone === "destructive" ? "border-destructive/40 bg-destructive/5 text-destructive" : "border-accent/40 bg-accent/5 text-accent";
  return (
    <div className={`rounded-2xl border p-5 ${cls}`}>
      <div className="text-[11px] font-mono uppercase tracking-widest">{title}</div>
      <p className="mt-2 text-sm text-foreground">{text}</p>
    </div>
  );
}

function StatMini({ label, value, tone }: { label: string; value: string; tone: "primary" | "accent" | "warning" | "success" }) {
  const map: any = {
    primary: "text-primary border-primary/30",
    accent: "text-accent border-accent/30",
    warning: "text-warning border-warning/30",
    success: "text-success border-success/30",
  };
  return (
    <div className={`rounded-2xl border bg-card/40 p-4 ${map[tone]}`}>
      <div className="text-[10px] font-mono uppercase tracking-widest">{label}</div>
      <div className="mt-1 text-lg font-bold text-foreground">{value}</div>
    </div>
  );
}

function TraitList({ title, items, tone, icon: Icon }: any) {
  const map: any = { success: "text-success", warning: "text-warning", destructive: "text-destructive" };
  return (
    <div>
      <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest ${map[tone]}`}>
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((i: string) => <span key={i} className="chip">{i}</span>)}
      </div>
    </div>
  );
}

function WhatIfSimulator() {
  const [pricing, setPricing] = useState(1999);
  const [hires, setHires] = useState(1);
  const [marketing, setMarketing] = useState(50);

  const rev = useMemo(() => Math.round((pricing * 40 * (1 + marketing / 100)) / 1000), [pricing, marketing]);
  const burn = useMemo(() => 4.8 + hires * 1.2 + marketing / 50, [hires, marketing]);
  const runway = useMemo(() => Math.max(1, Math.round((25 - marketing / 10) / burn * 10) / 10), [burn, marketing]);
  const success = useMemo(() => Math.min(96, Math.max(20, 40 + pricing / 100 - burn * 3 + marketing / 3)), [pricing, burn, marketing]);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl glass p-8">
        <div className="chip text-primary border-primary/40"><Layers className="h-3.5 w-3.5" /> Startup Twin · What-if</div>
        <div className="mt-6 space-y-5">
          <SliderRow label="Monthly pricing (₹)" value={pricing} min={499} max={9999} step={100} onChange={setPricing} />
          <SliderRow label="New hires" value={hires} min={0} max={8} step={1} onChange={setHires} />
          <SliderRow label="Marketing spend (₹L/mo)" value={marketing} min={0} max={200} step={5} onChange={setMarketing} />
        </div>
      </div>
      <div className="rounded-3xl glass p-8">
        <div className="chip text-accent border-accent/40"><Lightbulb className="h-3.5 w-3.5" /> Predicted outcome</div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <StatMini label="Revenue (₹L / mo)" value={`₹${rev}L`} tone="success" />
          <StatMini label="Burn (₹L / mo)" value={`₹${burn.toFixed(1)}L`} tone="warning" />
          <StatMini label="Runway" value={`${runway} mo`} tone="primary" />
          <StatMini label="Success probability" value={`${Math.round(success)}%`} tone="accent" />
        </div>
        <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
          <div className="text-xs font-mono uppercase tracking-widest text-primary">AI Verdict</div>
          <p className="mt-1">
            {success > 70 ? "Strong config — this scenario compounds." : success > 45 ? "Balanced — trim burn 15% for headroom." : "High-risk — cut hires or raise pricing."}
          </p>
        </div>
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange }: any) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[oklch(0.7_0.22_340)]"
      />
    </div>
  );
}

function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hey! I'm your Chief Strategy Officer. Ask me anything — pricing, hiring, fundraising, next move." },
  ]);
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    const q = text.trim();
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setText("");
    setTimeout(() => {
      setMsgs((m) => [...m, {
        role: "ai",
        text: `Given your current state (runway 4.2mo, weak pricing signal), the highest-leverage move around "${q}" is to run one focused pricing experiment this week and defer everything else. Confidence 89%.`,
      }]);
    }, 700);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-neon text-white shadow-[0_20px_60px_-10px_oklch(0.7_0.22_340/60%)]"
      >
        <Bot className="h-6 w-6" />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-24 right-6 z-40 flex h-[520px] w-[380px] flex-col rounded-3xl border border-primary/30 bg-background/95 backdrop-blur-2xl shadow-[0_30px_120px_-30px_oklch(0.7_0.22_340/55%)]"
        >
          <div className="flex items-center justify-between border-b border-border/50 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary"><Compass className="h-4 w-4 text-white" /></div>
              <div>
                <div className="text-sm font-semibold">Founder GPS</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent">Online</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground">Close</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-primary/20 text-foreground" : "glass"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border/50 p-3">
            <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask your strategist…" />
            <Button size="icon" onClick={send} className="btn-neon"><Send className="h-4 w-4" /></Button>
          </div>
        </motion.div>
      )}
    </>
  );
}
