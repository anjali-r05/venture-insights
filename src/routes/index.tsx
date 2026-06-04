import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, Activity, AlertTriangle, Lightbulb, MessageSquareWarning,
  CheckCircle2, Eye, Target, TrendingUp, Radar, Zap, Shield, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VentureBots — The AI Startup Operating System" },
      { name: "description", content: "Startup X-Ray Intelligence System: uncover hidden risks, blind spots, validation gaps, and investor questions before you ship." },
      { property: "og:title", content: "VentureBots — The AI Startup Operating System" },
      { property: "og:description", content: "Investor-grade startup intelligence for ambitious founders." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Nav />
      <Hero />
      <IntelligencePanel />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-10 text-sm font-medium text-muted-foreground md:flex">
          <a href="#intel" className="hover:text-foreground transition">Intelligence</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#features" className="hover:text-foreground transition">Modules</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" className="font-semibold">Sign in</Button></Link>
          <Link to="/auth">
            <Button className="btn-neon font-semibold">
              Launch OS <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-32 md:pt-28">
      <div className="absolute inset-0 -z-10 grid-bg opacity-60" />
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-secondary/30 blur-[120px]" />

      <div className="mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-card/60 px-4 py-2 text-xs font-mono font-medium uppercase tracking-[0.2em] text-accent backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          The AI Startup Operating System · v1.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-balance text-6xl font-extrabold leading-[0.95] tracking-tight md:text-8xl lg:text-9xl"
        >
          Stop guessing.<br />
          <span className="text-gradient">Start validating.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mx-auto mt-8 max-w-3xl text-balance text-xl text-muted-foreground md:text-2xl"
        >
          The diagnostic intelligence platform that x-rays your startup like a
          <span className="text-foreground font-semibold"> YC partner</span>,
          <span className="text-foreground font-semibold"> VC analyst</span>, and
          <span className="text-foreground font-semibold"> strategist</span> — in under 60 seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/auth">
            <Button size="lg" className="btn-neon h-14 px-8 text-base font-semibold glow">
              <Zap className="mr-2 h-5 w-5 text-accent" />
              Run Startup X-Ray
            </Button>
          </Link>
          <a href="#intel">
            <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold glass">
              See Intelligence Panel
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="mx-auto mt-24 max-w-5xl"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="glass-strong relative rounded-3xl p-6 shadow-card md:p-10">
      <div className="absolute inset-x-10 -top-16 -z-10 h-40 rounded-full bg-gradient-neon opacity-40 blur-3xl" />
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-destructive/70" />
          <span className="h-3 w-3 rounded-full bg-warning/70" />
          <span className="h-3 w-3 rounded-full bg-success/70" />
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          startup-x-ray › lumen-health.report
        </div>
        <div className="h-3 w-3" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 rounded-2xl border border-accent/30 bg-card/60 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Startup Health</div>
          <div className="mt-4 flex items-center justify-center">
            <ScoreRing score={82} />
          </div>
          <div className="mt-4 text-center text-base font-bold text-gradient">High Potential</div>
        </div>
        <div className="md:col-span-2 grid gap-4 grid-cols-2">
          <MetricCard label="Hidden Risks" value="6" tone="destructive" icon={AlertTriangle} />
          <MetricCard label="Opportunities" value="5" tone="cyan" icon={Lightbulb} />
          <MetricCard label="Blind Spots" value="4" tone="warning" icon={Eye} />
          <MetricCard label="Investor Qs" value="8" tone="primary" icon={MessageSquareWarning} />
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 60, c = 2 * Math.PI * r, dash = c * (score / 100);
  return (
    <svg width="170" height="170" viewBox="0 0 170 170">
      <defs>
        <linearGradient id="hg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <circle cx="85" cy="85" r={r} stroke="oklch(1 0 0 / 6%)" strokeWidth="10" fill="none" />
      <circle cx="85" cy="85" r={r} stroke="url(#hg)" strokeWidth="10" fill="none"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 85 85)" />
      <text x="85" y="92" textAnchor="middle" className="fill-foreground font-display" fontSize="40" fontWeight="800">{score}</text>
    </svg>
  );
}

function MetricCard({ label, value, tone, icon: Icon }: any) {
  const map: Record<string, { text: string; bg: string; border: string }> = {
    destructive: { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
    cyan: { text: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
    warning: { text: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
    primary: { text: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  };
  const t = map[tone];
  return (
    <div className={`rounded-2xl border ${t.border} bg-card/60 p-5`}>
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${t.bg}`}>
        <Icon className={`h-4 w-4 ${t.text}`} strokeWidth={1.75} />
      </div>
      <div className="mt-3 font-display text-4xl font-extrabold">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  );
}

/* ---------------- Intelligence Panel (Startup X-Ray) ---------------- */

function IntelligencePanel() {
  const cards = [
    {
      icon: Radar, tone: "destructive",
      eyebrow: "Hidden Risks", severity: "Critical",
      title: "What investors will tear apart.",
      body: "Market, execution, defensibility, and team risks surfaced with severity scoring.",
      chips: ["Market", "Execution", "Defensibility"],
      progress: 78,
    },
    {
      icon: Eye, tone: "warning",
      eyebrow: "Blind Spots", severity: "High",
      title: "The risks you can't see.",
      body: "Second-order assumptions and category-level gaps that founders consistently miss.",
      chips: ["Assumption", "Category", "Buyer"],
      progress: 64,
    },
    {
      icon: CheckCircle2, tone: "accent",
      eyebrow: "Validation Gaps", severity: "Medium",
      title: "Evidence you still owe yourself.",
      body: "A precise list of demand signals, conversations, and tests required to de-risk.",
      chips: ["Demand", "Pricing", "ICP"],
      progress: 52,
    },
  ];

  return (
    <section id="intel" className="relative px-6 py-28">
      <div className="absolute inset-0 -z-10 grid-bg opacity-30" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <div className="chip text-accent border-accent/40">
            <Brain className="h-3.5 w-3.5" /> Startup X-Ray Intelligence System
          </div>
          <h2 className="mt-6 text-5xl font-extrabold tracking-tight md:text-7xl">
            Diagnostic intelligence,<br />
            <span className="text-gradient">at investor grade.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            Three AI-powered diagnostic modules x-ray your startup in real time — color-coded
            by severity, ranked by impact, and pitch-ready out of the box.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => (
            <DiagnosticCard key={c.eyebrow} {...c} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

const TONE_MAP: Record<string, { text: string; bg: string; border: string; ring: string; glow: string }> = {
  destructive: { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/40", ring: "bg-destructive", glow: "shadow-[0_0_40px_-10px_oklch(0.65_0.25_25/0.6)]" },
  warning:     { text: "text-warning",     bg: "bg-warning/10",     border: "border-warning/40",     ring: "bg-warning",     glow: "shadow-[0_0_40px_-10px_oklch(0.82_0.17_75/0.55)]" },
  accent:      { text: "text-accent",      bg: "bg-accent/10",      border: "border-accent/40",      ring: "bg-accent",      glow: "shadow-[0_0_40px_-10px_oklch(0.78_0.18_200/0.65)]" },
  primary:     { text: "text-primary",     bg: "bg-primary/10",     border: "border-primary/40",     ring: "bg-primary",     glow: "shadow-[0_0_40px_-10px_oklch(0.7_0.22_340/0.6)]" },
};

function DiagnosticCard({
  icon: Icon, tone, eyebrow, severity, title, body, chips, progress, delay,
}: any) {
  const t = TONE_MAP[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay, duration: 0.5 }}
      className={`group card-hover relative overflow-hidden rounded-3xl border ${t.border} bg-card/60 p-7 backdrop-blur-xl`}
    >
      <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${t.bg} blur-3xl opacity-60 transition group-hover:opacity-100`} />

      <div className="flex items-start justify-between">
        <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border ${t.border} ${t.bg} ${t.text} ${t.glow}`}>
          <Icon className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${t.ring} pulse-soft ${t.text}`} />
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${t.text}`}>{severity}</span>
        </div>
      </div>

      <div className={`mt-6 font-mono text-[10px] uppercase tracking-[0.25em] ${t.text}`}>{eyebrow}</div>
      <h3 className="mt-2 text-2xl font-bold leading-tight">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{body}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {chips.map((c: string) => (
          <span key={c} className="chip text-muted-foreground">{c}</span>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-wider text-muted-foreground">Signal strength</span>
          <span className={`font-mono font-semibold ${t.text}`}>{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }} whileInView={{ width: `${progress}%` }} viewport={{ once: true }}
            transition={{ duration: 1.1, delay: delay + 0.2, ease: "easeOut" }}
            className={`h-full ${t.ring}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- How it works ---------------- */

function HowItWorks() {
  const steps = [
    { n: "01", title: "Describe your startup", body: "Six guided prompts capture idea, problem, audience, and revenue model.", icon: Target },
    { n: "02", title: "AI runs diagnostics", body: "The X-Ray engine analyzes like a YC partner and a top-tier VC, in parallel.", icon: Activity },
    { n: "03", title: "Receive your X-Ray", body: "A health score, risk map, validation roadmap, and investor question deck.", icon: TrendingUp },
  ];
  return (
    <section id="how" className="px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="The flow" title={<>From idea to <span className="text-gradient">investor-ready</span> in minutes.</>} />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="card-hover glass rounded-3xl p-8"
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-xl font-bold text-gradient">{s.n}</div>
                <s.icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="mt-8 text-2xl font-bold">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Modules / Features ---------------- */

function Features() {
  const items = [
    { title: "Startup Health Score", desc: "Weighted score across viability, defensibility, and execution risk.", icon: Activity, tone: "primary" },
    { title: "Risk Detection", desc: "Market, execution, and competitive risks surfaced before investors do.", icon: AlertTriangle, tone: "destructive" },
    { title: "Opportunity Engine", desc: "Adjacent markets, wedge angles, and growth levers you may have missed.", icon: Lightbulb, tone: "accent" },
    { title: "Investor Question Deck", desc: "The sharpest VC questions, pre-loaded for your next pitch.", icon: MessageSquareWarning, tone: "primary" },
    { title: "4-Week Validation Map", desc: "Concrete steps to validate demand and de-risk assumptions, week by week.", icon: CheckCircle2, tone: "accent" },
    { title: "Blind Spot Radar", desc: "Catch the second-order risks you can't see when you're too close.", icon: Shield, tone: "warning" },
  ];
  return (
    <section id="features" className="px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Modules" title={<>Investor-grade intelligence,<br /><span className="text-gradient">module by module.</span></>} />
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => {
            const t = TONE_MAP[f.tone];
            return (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`group card-hover rounded-3xl border ${t.border} bg-card/40 p-8 backdrop-blur`}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${t.bg} ${t.text} ${t.glow}`}>
                  <f.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <div className="chip text-accent border-accent/40">{eyebrow}</div>
      <h2 className="mt-5 text-5xl font-extrabold tracking-tight md:text-6xl">{title}</h2>
    </div>
  );
}

function CTA() {
  return (
    <section className="px-6 py-28">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-accent/30 bg-card/60 p-14 text-center shadow-card backdrop-blur-xl">
        <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
        <div className="absolute inset-x-20 -top-24 -z-10 h-48 rounded-full bg-gradient-neon opacity-30 blur-3xl" />
        <div className="chip mx-auto text-accent border-accent/40"><Sparkles className="h-3.5 w-3.5" /> Ready when you are</div>
        <h2 className="mt-6 text-balance text-5xl font-extrabold tracking-tight md:text-7xl">
          X-Ray your startup.<br />
          <span className="text-gradient">Pitch with proof.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground">
          Find what's working, what's broken, and what to validate next — in under 60 seconds.
        </p>
        <Link to="/auth">
          <Button size="lg" className="btn-neon mt-10 h-14 px-10 text-base font-semibold glow">
            <Zap className="mr-2 h-5 w-5 text-accent" />
            Run Startup X-Ray
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 px-6 py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <Logo />
        <div className="font-mono text-xs uppercase tracking-[0.2em]">© {new Date().getFullYear()} VentureBots · Founder OS</div>
      </div>
    </footer>
  );
}
