import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Shield, Sparkles, Zap, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { unlockFounderGps } from "@/lib/founder-gps-unlock";
import { useNavigate } from "@tanstack/react-router";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

const PLANS = [
  {
    id: "starter",
    name: "Starter Pro",
    price: "₹999",
    tagline: "Perfect for student founders",
    highlight: false,
    features: [
      "Weekly Founder GPS",
      "AI Strategic Mentor",
      "Startup Health Score",
      "Weekly Roadmap",
      "Priority AI",
    ],
  },
  {
    id: "founder",
    name: "Founder Pro",
    price: "₹1,999",
    tagline: "Most Popular",
    highlight: true,
    features: [
      "Everything in Starter",
      "AI Founder DNA",
      "VentureScore",
      "Startup Memory",
      "AI Boardroom",
      "Investor Readiness",
      "Startup Twin",
      "Predictive Analytics",
      "Unlimited Reports",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    tagline: "Incubators · Universities · Accelerators",
    highlight: false,
    features: [
      "Everything in Founder Pro",
      "Team seats & admin",
      "SSO & audit logs",
      "Custom AI models",
      "Dedicated success mgr",
      "SLA + Priority support",
    ],
  },
];

const PAYMENTS = [
  "UPI", "Google Pay", "PhonePe", "Paytm", "Debit Card", "Credit Card",
  "Net Banking", "Apple Pay", "International Cards", "Stripe", "Razorpay",
];

export function PremiumPricingModal({ open, onOpenChange }: Props) {
  const [processing, setProcessing] = useState<string | null>(null);
  const navigate = useNavigate();

  const activate = async (planId: string) => {
    if (planId === "enterprise") {
      window.location.href = "mailto:sales@venturebots.ai?subject=Enterprise%20plan%20inquiry";
      return;
    }
    setProcessing(planId);
    // Simulated secure payment gateway
    await new Promise((r) => setTimeout(r, 1400));
    unlockFounderGps();
    toast.success("Payment successful — Founder GPS unlocked");
    setProcessing(null);
    onOpenChange(false);
    navigate({ to: "/founder-gps" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl overflow-hidden border-primary/30 bg-background/95 p-0 backdrop-blur-2xl">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -right-16 top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          </div>

          <div className="relative px-8 pt-10 text-center">
            <div className="chip mx-auto text-accent border-accent/40">
              <Crown className="h-3.5 w-3.5" /> VentureBots Premium
            </div>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              Unlock <span className="text-gradient">Founder GPS™</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Your AI Chief Strategy Officer. Weekly direction, decision compass, and
              a boardroom of AI experts — 24/7.
            </p>
          </div>

          <div className="relative grid gap-5 px-8 py-10 md:grid-cols-3">
            {PLANS.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`relative flex flex-col rounded-3xl p-7 ${
                  p.highlight
                    ? "neon-border shadow-[0_20px_80px_-20px_oklch(0.7_0.22_340/45%)]"
                    : "glass"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-neon px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow">
                    Most Popular
                  </div>
                )}
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {p.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <div className="text-4xl font-extrabold tracking-tight">{p.price}</div>
                  {p.id !== "enterprise" && (
                    <div className="text-sm text-muted-foreground">/month</div>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => activate(p.id)}
                  disabled={!!processing}
                  className={`mt-7 h-11 w-full font-semibold ${
                    p.highlight ? "btn-neon" : ""
                  }`}
                  variant={p.highlight ? "default" : "outline"}
                >
                  {processing === p.id ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                  ) : p.id === "enterprise" ? (
                    <>Contact Sales <ArrowRight className="ml-2 h-4 w-4" /></>
                  ) : (
                    <><Zap className="mr-2 h-4 w-4" /> Upgrade Now</>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="relative border-t border-border/50 bg-card/30 px-8 py-6">
            <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Accepted Payment Methods
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {PAYMENTS.map((m) => (
                <span key={m} className="chip !uppercase !tracking-wider">{m}</span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent" /> 256-bit SSL Secure Payment</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-accent" /> 7-Day Money Back Guarantee</span>
              <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-accent" /> Cancel Anytime</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
