import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageSquareWarning, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/founder-readiness")({
  component: FounderReadinessPage,
});

function FounderReadinessPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["latest-report-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("startup_reports")
        .select("id, investor_questions, startups(startup_name)")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const questions: any[] = ((data as any)?.investor_questions ?? []).map((it: any) =>
    typeof it === "string" ? { category: "General", question: it } : it
  );

  const groups = questions.reduce<Record<string, any[]>>((acc, q) => {
    const k = q.category ?? "General";
    (acc[k] = acc[k] ?? []).push(q);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl space-y-10 fade-up">
      <div>
        <div className="chip text-primary border-primary/40"><MessageSquareWarning className="h-3.5 w-3.5" /> Founder Readiness Test™</div>
        <h1 className="mt-5 text-5xl font-extrabold tracking-tight md:text-6xl">Can you handle the room?</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          Startup X-Ray evaluates the company. Founder Readiness Test evaluates <span className="text-foreground font-semibold">you</span>.
          Prepare for the toughest questions a Tier-1 investor will throw at you, grouped by the angles top VCs actually use to pressure-test founders.
        </p>
      </div>

      {isLoading && (
        <div className="py-24 text-center font-mono text-sm uppercase tracking-[0.25em] text-accent">Loading challenge room…</div>
      )}

      {!isLoading && questions.length === 0 && (
        <div className="glass-strong rounded-3xl p-12 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-accent" />
          <h2 className="mt-6 text-2xl font-bold">Run your first Startup X-Ray</h2>
          <p className="mt-2 text-muted-foreground">Your Founder Readiness questions are generated alongside each X-Ray report.</p>
          <Link to="/xray">
            <Button className="btn-neon mt-6 h-12 px-6 font-semibold">Run Startup X-Ray <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      )}

      {!isLoading && questions.length > 0 && (
        <div className="space-y-8">
          <div className="glass-strong rounded-2xl p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Investor Challenge Room™</div>
            <h3 className="mt-2 text-2xl font-bold">Pressure-test from {((data as any)?.startups?.startup_name) ?? "your latest startup"}</h3>
            <p className="mt-2 text-muted-foreground">{questions.length} VC-grade questions across {Object.keys(groups).length} dimensions.</p>
          </div>
          {Object.entries(groups).map(([cat, qs]) => (
            <div key={cat}>
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{cat}</div>
              <div className="grid gap-3 md:grid-cols-2">
                {qs.map((q: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="card-hover relative overflow-hidden rounded-2xl border border-primary/30 bg-card/60 p-6 backdrop-blur">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">VC Question · {String(i + 1).padStart(2, "0")}</div>
                    <p className="mt-3 text-lg font-semibold leading-snug">{q.question}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
