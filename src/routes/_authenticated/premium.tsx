import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock, Compass, Trophy, Users, Briefcase, Brain, Layers, ArrowRight, Sparkles, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumPricingModal } from "@/components/PremiumPricingModal";
import { useFounderGpsUnlocked } from "@/lib/founder-gps-unlock";

export const Route = createFileRoute("/_authenticated/premium")({
  component: PremiumPage,
});

const MODULES = [
  { name: "VentureScore™", desc: "Track how investable your startup becomes over time.", icon: Trophy },
  { name: "AI Founder Boardroom™", desc: "Get advice from a panel of AI experts simulating your board.", icon: Users },
  { name: "Investor Simulator™", desc: "Pitch your startup to a simulated VC and get sharp feedback.", icon: Briefcase },
  { name: "Startup Memory™", desc: "Long-term context so your AI advisor remembers your journey.", icon: Brain },
  { name: "Venture Twin™", desc: "An AI twin of your startup, modeled to test strategic decisions.", icon: Layers },
];

function PremiumPage() {
  const [open, setOpen] = useState(false);
  const unlocked = useFounderGpsUnlocked();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10">
        <div className="chip text-accent border-accent/40"><Crown className="h-3.5 w-3.5" /> VentureBots Premium</div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">Premium Modules</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The strategic AI layer that compounds your founder edge — starting with our flagship.
        </p>
      </div>

      {/* Founder GPS flagship card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative mb-10 overflow-hidden rounded-[2rem] neon-border p-10 shadow-[0_30px_120px_-30px_oklch(0.7_0.22_340/55%)]"
      >
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -right-16 top-10 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute inset-0 grid-bg" />
        </div>

        <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <div className="chip text-primary border-primary/40">
              {unlocked ? <><Sparkles className="h-3.5 w-3.5" /> Unlocked</> : <><Lock className="h-3.5 w-3.5" /> Flagship · Locked</>}
            </div>
            <h2 className="mt-4 text-5xl font-extrabold tracking-tight md:text-6xl">
              Founder <span className="text-gradient">GPS™</span>
            </h2>
            <div className="mt-2 text-lg font-semibold text-muted-foreground">Your AI Chief Strategy Officer</div>
            <p className="mt-4 max-w-xl text-[15px] italic text-foreground/80">
              "Never wonder what to do next."
            </p>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">
              Continuously understands you, your startup, goals, execution, and market — then tells you
              exactly what to focus on next. A YC partner, McKinsey consultant, COO and executive coach in one.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {unlocked ? (
                <Link to="/founder-gps">
                  <Button className="btn-neon h-12 px-6 font-semibold">
                    <Compass className="mr-2 h-4 w-4 text-accent" /> Open Founder GPS <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button onClick={() => setOpen(true)} className="btn-neon h-12 px-6 font-semibold">
                  <Crown className="mr-2 h-4 w-4 text-accent" /> Upgrade to Premium
                </Button>
              )}
              <Button variant="outline" className="glass h-12 px-6" onClick={() => setOpen(true)}>
                See pricing
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary">
                  <Compass className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-accent">This week</div>
                  <div className="text-lg font-bold">Validate pricing before building</div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniStat label="Confidence" value="96%" />
                <MiniStat label="Impact" value="High" />
                <MiniStat label="Effort" value="5h" />
              </div>
              <div className="mt-5 space-y-2">
                {["Decision Compass · Launch now", "Boardroom · 8 AI experts weighed in", "Risk Radar · Runway 4.2mo"].map((s) => (
                  <div key={s} className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-3 py-2 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent pulse-soft text-accent" />
                    <span className="text-muted-foreground">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Other locked premium modules */}
      <h3 className="mb-4 text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">More premium modules</h3>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m, i) => (
          <motion.div key={m.name}
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden glass rounded-3xl p-7"
          >
            <div className="absolute right-4 top-4 chip"><Lock className="h-3 w-3" /> Locked</div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary opacity-70">
              <m.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mt-5 text-xl font-bold">{m.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
            <Button onClick={() => setOpen(true)} variant="outline" className="mt-6 w-full">
              Upgrade to Premium
            </Button>
          </motion.div>
        ))}
      </div>

      <PremiumPricingModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-3">
      <div className="font-display text-lg font-extrabold">{value}</div>
      <div className="mt-0.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
