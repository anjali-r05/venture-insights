import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, Activity, AlertTriangle, Lightbulb, MessageSquareWarning,
  CheckCircle2, Eye, Target, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VentureBots — Stop Guessing. Start Validating." },
      { name: "description", content: "Startup X-Ray helps founders uncover hidden risks, blind spots, opportunities, and validation gaps in their startup ideas — before they invest serious time or money." },
      { property: "og:title", content: "VentureBots — The AI Startup Operating System" },
      { property: "og:description", content: "Investor-grade startup intelligence for ambitious founders." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#features" className="hover:text-foreground">Features</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/auth">
            <Button className="bg-gradient-primary text-primary-foreground">
              Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-radial)" }} />
      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          The AI Startup Operating System
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
        >
          Stop Guessing.<br />
          <span className="text-gradient">Start Validating.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Startup X-Ray helps founders uncover hidden risks, blind spots, opportunities,
          and validation gaps — before you invest serious time and resources.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground glow">
              Run Startup X-Ray <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="#how">
            <Button size="lg" variant="outline" className="glass">Watch Demo</Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="mx-auto mt-20 max-w-5xl"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="glass relative rounded-3xl p-6 shadow-card md:p-10">
      <div className="absolute inset-x-10 -top-12 -z-10 h-32 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 rounded-2xl border border-border/60 bg-card/60 p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Startup Health</div>
          <div className="mt-4 flex items-center justify-center">
            <ScoreRing score={82} />
          </div>
          <div className="mt-4 text-center text-sm font-medium text-gradient">High Potential</div>
        </div>
        <div className="md:col-span-2 grid gap-4 grid-cols-2">
          <MetricCard label="Risks" value="6" tone="destructive" icon={AlertTriangle} />
          <MetricCard label="Opportunities" value="5" tone="info" icon={Lightbulb} />
          <MetricCard label="Blind Spots" value="4" tone="warning" icon={Eye} />
          <MetricCard label="Investor Qs" value="8" tone="accent" icon={MessageSquareWarning} />
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 56, c = 2 * Math.PI * r, dash = c * (score / 100);
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r={r} stroke="oklch(1 0 0 / 8%)" strokeWidth="12" fill="none" />
      <circle cx="80" cy="80" r={r} stroke="url(#g)" strokeWidth="12" fill="none"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 80 80)" />
      <text x="80" y="86" textAnchor="middle" className="fill-foreground" fontSize="32" fontWeight="700">{score}</text>
    </svg>
  );
}

function MetricCard({ label, value, tone, icon: Icon }: any) {
  const toneClass: Record<string, string> = {
    destructive: "text-destructive", info: "text-info", warning: "text-warning", accent: "text-accent",
  };
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
      <Icon className={`h-5 w-5 ${toneClass[tone]}`} />
      <div className="mt-3 text-3xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Describe Your Startup", body: "Tell us about your idea, problem, audience, and revenue model in a guided wizard.", icon: Target },
    { n: "02", title: "AI Analysis", body: "Our analyst engine reviews your startup like a Y Combinator partner and VC.", icon: Activity },
    { n: "03", title: "Receive Your X-Ray Report", body: "Get a health score, risks, blind spots, opportunities, and an investor-grade roadmap.", icon: TrendingUp },
  ];
  return (
    <section id="how" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="How it works" title="From idea to investor-ready in minutes" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="glass rounded-3xl p-8"
            >
              <div className="text-xs font-semibold text-gradient">{s.n}</div>
              <s.icon className="mt-4 h-7 w-7 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { title: "Startup Health Score", desc: "A single, weighted score that benchmarks your venture across viability, risk, and opportunity.", icon: Activity },
    { title: "Risk Detection", desc: "Surface market, execution, and competitive risks before investors do.", icon: AlertTriangle },
    { title: "Opportunity Discovery", desc: "Uncover adjacent markets, wedge angles, and growth levers you may have missed.", icon: Lightbulb },
    { title: "Investor Questions", desc: "Anticipate the sharp questions a VC will ask in your next pitch meeting.", icon: MessageSquareWarning },
    { title: "Validation Roadmap", desc: "A 4-week plan with concrete steps to validate demand and de-risk assumptions.", icon: CheckCircle2 },
    { title: "Blind Spot Detection", desc: "Catch the second-order risks you can't see when you're too close to your idea.", icon: Eye },
  ];
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="What you get" title="Investor-grade intelligence for founders" />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {items.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="group rounded-3xl border border-border/60 bg-card/40 p-7 backdrop-blur transition hover:border-primary/40 hover:bg-card/60"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gradient">{eyebrow}</div>
      <h2 className="mt-3 text-4xl font-bold md:text-5xl">{title}</h2>
    </div>
  );
}

function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl glass rounded-3xl p-12 text-center shadow-card">
        <h2 className="text-3xl font-bold md:text-4xl">Ready to X-Ray your startup?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Find what's working, what's broken, and what to validate next — in under a minute.
        </p>
        <Link to="/auth">
          <Button size="lg" className="mt-8 bg-gradient-primary text-primary-foreground glow">
            Run Startup X-Ray <ArrowRight className="ml-2 h-4 w-4" />
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
        <div>© {new Date().getFullYear()} VentureBots. All rights reserved.</div>
      </div>
    </footer>
  );
}
