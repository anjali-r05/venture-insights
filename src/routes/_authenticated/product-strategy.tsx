import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Sparkles, Loader2, ArrowRight, ArrowLeft, Plus, FileText } from "lucide-react";
import { generateProductStrategy, listProductStrategies } from "@/lib/product-strategy.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/product-strategy")({
  component: ProductStrategyIndex,
});

const STAGES = ["Idea", "Validation", "MVP", "Beta", "Launched"];

type Form = {
  product_name: string; industry: string; stage: string;
  description: string; target_users: string; current_features: string;
};

const STEPS = [
  { key: "basics", title: "Product Basics" },
  { key: "describe", title: "Describe The Product" },
  { key: "users", title: "Target Users" },
  { key: "features", title: "Existing Features" },
];

function ProductStrategyIndex() {
  const navigate = useNavigate();
  const generate = useServerFn(generateProductStrategy);
  const listFn = useServerFn(listProductStrategies);

  const list = useQuery({
    queryKey: ["product-strategies"],
    queryFn: () => listFn(),
  });

  const [mode, setMode] = useState<"list" | "wizard">("list");
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Form>({
    product_name: "", industry: "", stage: "Idea",
    description: "", target_users: "", current_features: "",
  });
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    switch (step) {
      case 0: return form.product_name.trim() && form.industry.trim();
      case 1: return form.description.trim().length >= 10;
      case 2: return form.target_users.trim().length >= 3;
      case 3: return true;
      default: return true;
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const { id } = await generate({ data: form });
      toast.success("Your Product Strategy is ready.");
      navigate({ to: "/product-strategy/$strategyId", params: { strategyId: id } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  if (submitting) return <LoadingScreen />;

  if (mode === "list") {
    return (
      <div className="mx-auto max-w-5xl fade-up">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="chip text-accent border-accent/40"><Compass className="h-3.5 w-3.5" /> AI Product Strategy</div>
            <h1 className="mt-5 text-5xl font-extrabold tracking-tight md:text-6xl">Your CPO in the room.</h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              Get a full Product Strategy blueprint — vision, MVP, roadmap, tech stack, and the features to cut ruthlessly.
            </p>
          </div>
          <Button onClick={() => { setMode("wizard"); setStep(0); }} className="btn-neon h-12 px-6 font-semibold">
            <Plus className="mr-2 h-4 w-4" /> New Product Strategy
          </Button>
        </div>

        <div className="glass-strong rounded-3xl p-8">
          <h2 className="text-xl font-bold">Recent strategies</h2>
          {list.isLoading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : !list.data?.length ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No product strategies yet. Generate your first one.</p>
              <Button onClick={() => { setMode("wizard"); setStep(0); }} className="mt-6 btn-neon">
                <Sparkles className="mr-2 h-4 w-4" /> Generate Strategy
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {list.data.map(row => (
                <Link key={row.id} to="/product-strategy/$strategyId" params={{ strategyId: row.id }}
                  className="card-hover glass rounded-2xl p-5 transition hover:border-accent/40">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-2 text-lg font-bold">{row.product_name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {row.industry ?? "—"} · {row.stage ?? "—"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl fade-up">
      <div className="mb-10">
        <button onClick={() => setMode("list")} className="mb-4 text-sm text-muted-foreground hover:text-foreground">
          ← Back to strategies
        </button>
        <div className="chip text-accent border-accent/40"><Compass className="h-3.5 w-3.5" /> Product Strategy Engine</div>
        <h1 className="mt-5 text-5xl font-extrabold tracking-tight md:text-6xl">{STEPS[step].title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">Four prompts. One CPO-grade product blueprint.</p>
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
                <Field label="Product name">
                  <Input value={form.product_name} onChange={e => set("product_name", e.target.value)} placeholder="e.g. Lumen Health" />
                </Field>
                <Field label="Industry">
                  <Input value={form.industry} onChange={e => set("industry", e.target.value)} placeholder="e.g. Digital Health, B2B SaaS" />
                </Field>
                <Field label="Stage">
                  <Select value={form.stage} onValueChange={(v) => set("stage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </>
            )}
            {step === 1 && (
              <Field label="Describe the product">
                <Textarea rows={8} value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="What is it? What does it do? What is the core promise to users?" />
              </Field>
            )}
            {step === 2 && (
              <Field label="Who will use it?">
                <Textarea rows={6} value={form.target_users} onChange={e => set("target_users", e.target.value)}
                  placeholder="Segments, roles, contexts. Be specific — 'busy solo founders' beats 'entrepreneurs'." />
              </Field>
            )}
            {step === 3 && (
              <Field label="Existing or planned features (optional)">
                <Textarea rows={8} value={form.current_features} onChange={e => set("current_features", e.target.value)}
                  placeholder="List any features you already have or plan to build. The AI will challenge and reprioritize them. Leave blank to design from scratch." />
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
              <Sparkles className="mr-2 h-4 w-4 text-accent" /> Generate Product Strategy
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
    "Interviewing your product…",
    "Sketching the blueprint…",
    "Cutting the MVP to the bone…",
    "Prioritizing every feature…",
    "Drawing your 5-phase roadmap…",
    "Choosing the smartest tech stack…",
    "Flagging the risks founders miss…",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % messages.length), 2400);
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
      <div className="chip mt-10 text-accent border-accent/40"><Compass className="h-3.5 w-3.5" /> Product Strategy Engine</div>
      <h2 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">Designing your product…</h2>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Estimated · 20–35 seconds</p>
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
