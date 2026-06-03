import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, Compass, Trophy, Users, Briefcase, Brain, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/premium")({
  component: PremiumPage,
});

const MODULES = [
  { name: "Founder GPS™", desc: "Personalized weekly direction-setting for ambitious founders.", icon: Compass },
  { name: "VentureScore™", desc: "Track how investable your startup becomes over time.", icon: Trophy },
  { name: "AI Founder Boardroom™", desc: "Get advice from a panel of AI experts simulating your board.", icon: Users },
  { name: "Investor Simulator™", desc: "Pitch your startup to a simulated VC and get sharp feedback.", icon: Briefcase },
  { name: "Startup Memory™", desc: "Long-term context so your AI advisor remembers your journey.", icon: Brain },
  { name: "Venture Twin™", desc: "An AI twin of your startup, modeled to test strategic decisions.", icon: Layers },
];

function PremiumPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gradient">Coming soon</div>
        <h1 className="mt-2 text-4xl font-bold">Premium Modules</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          The next layer of VentureBots — strategic AI tools that compound your founder edge over time.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m, i) => (
          <motion.div key={m.name}
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden glass rounded-3xl p-7"
          >
            <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Lock className="h-3 w-3" /> Locked
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary opacity-70">
              <m.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mt-5 text-xl font-bold">{m.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
            <Button variant="outline" disabled className="mt-6 w-full opacity-70">
              Upgrade to Premium
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
