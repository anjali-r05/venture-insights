import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { analyzeStartup } from "@/lib/xray.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/xray")({
  component: XrayWizard,
});

const STAGES = ["Idea", "Validation", "MVP", "Beta", "Launched"];
const REVENUE = ["Subscription", "Marketplace", "Freemium", "Ads", "Enterprise", "Other"];

type Form = {
  startup_name: string; industry: string; startup_stage: string;
  description: string; problem: string; target_audience: string;
  revenue_model: string; competitors: string;
};

const STEPS = [
  { key: "basics", title: "Startup Basics" },
  { key: "describe", title: "Describe Your Startup" },
  { key: "problem", title: "The Problem" },
  { key: "audience", title: "Target Audience" },
  { key: "revenue", title: "Revenue Model" },
  { key: "competitors", title: "Competitors" },
];

function XrayWizard() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeStartup);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Form>({
    startup_name: "", industry: "", startup_stage: "Idea",
    description: "", problem: "", target_audience: "",
    revenue_model: "Subscription", competitors: "",
  });
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    switch (step) {
      case 0: return form.startup_name.trim() && form.industry.trim();
      case 1: return form.description.trim().length >= 10;
      case 2: return form.problem.trim().length >= 5;
      case 3: return form.target_audience.trim().length >= 3;
      case 4: return !!form.revenue_model;
      case 5: return form.competitors.trim().length >= 1;
      default: return true;
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const { reportId } = await analyze({ data: form });
      toast.success("Your Startup X-Ray is ready!");
      navigate({ to: "/report/$reportId", params: { reportId } });
    } catch (e: any) {
      toast.error(e?.message ?? "Analysis failed");
      setSubmitting(false);
    }
  };

  if (submitting) return <LoadingScreen />;

  return (
    <div className="mx-auto max-w-4xl fade-up">
      <div className="mb-10">
        <div className="chip text-accent border-accent/40"><Sparkles className="h-3.5 w-3.5" /> Startup X-Ray Intelligence System</div>
        <h1 className="mt-5 text-5xl font-extrabold tracking-tight md:text-6xl">{STEPS[step].title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">Six prompts. One investor-grade diagnostic.</p>
        <Progress current={step} total={STEPS.length} />
      </div>

      <div className="glass-strong rounded-3xl p-10">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }} className="space-y-6"
          >
            {step === 0 && (
              <>
                <Field label="Startup name">
                  <Input value={form.startup_name} onChange={e => set("startup_name", e.target.value)} placeholder="e.g. Lumen Health" />
                </Field>
                <Field label="Industry">
                  <Input value={form.industry} onChange={e => set("industry", e.target.value)} placeholder="e.g. Digital Health, B2B SaaS" />
                </Field>
                <Field label="Stage">
                  <Select value={form.startup_stage} onValueChange={(v) => set("startup_stage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </>
            )}
            {step === 1 && (
              <Field label="Describe your startup idea">
                <Textarea rows={8} value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="What does it do, how does it work, what makes it different?" />
              </Field>
            )}
            {step === 2 && (
              <Field label="What problem are you solving?">
                <Textarea rows={6} value={form.problem} onChange={e => set("problem", e.target.value)}
                  placeholder="Be specific about who has this problem and how painful it is." />
              </Field>
            )}
            {step === 3 && (
              <Field label="Who are your customers?">
                <Textarea rows={6} value={form.target_audience} onChange={e => set("target_audience", e.target.value)}
                  placeholder="Describe the ideal customer profile, segment, and buyer." />
              </Field>
            )}
            {step === 4 && (
              <Field label="Revenue model">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {REVENUE.map(r => (
                    <button type="button" key={r} onClick={() => set("revenue_model", r)}
                      className={`card-hover rounded-2xl border p-5 text-left transition ${
                        form.revenue_model === r
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-card/40 hover:border-accent/40"
                      }`}>
                      <div className="font-semibold">{r}</div>
                    </button>
                  ))}
                </div>
              </Field>
            )}
            {step === 5 && (
              <Field label="Who are your competitors?">
                <Textarea rows={6} value={form.competitors} onChange={e => set("competitors", e.target.value)}
                  placeholder="Direct, indirect, and alternative solutions customers use today." />
              </Field>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="btn-neon h-12 px-6 font-semibold">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={!canNext()}
              className="btn-neon h-12 px-6 font-semibold glow">
              <Sparkles className="mr-2 h-4 w-4 text-accent" /> Run Diagnostic
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2.5"><Label className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{label}</Label>{children}</div>;
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mt-8">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div className="h-full bg-gradient-neon"
          initial={{ width: 0 }}
          animate={{ width: `${((current + 1) / total) * 100}%` }}
          transition={{ duration: 0.4 }} />
      </div>
      <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Step {current + 1} / {total}</div>
    </div>
  );
}

function LoadingScreen() {
  const messages = [
    "Analyzing market potential…",
    "Identifying risks…",
    "Finding blind spots…",
    "Discovering opportunities…",
    "Generating investor questions…",
    "Creating strategic recommendations…",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % messages.length), 2500);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center fade-up">
      <div className="relative">
        <div className="absolute inset-0 -m-16 rounded-full bg-gradient-neon opacity-30 blur-3xl animate-pulse" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-accent/40 bg-card glow">
          <Loader2 className="h-12 w-12 animate-spin text-accent" strokeWidth={1.5} />
        </div>
      </div>
      <div className="chip mt-10 text-accent border-accent/40"><Sparkles className="h-3.5 w-3.5" /> X-Ray Intelligence System</div>
      <h2 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">Running diagnostics…</h2>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Estimated · 15–30 seconds</p>
      <AnimatePresence mode="wait">
        <motion.div key={i}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="mt-10 text-2xl font-bold text-gradient">
          {messages[i]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
