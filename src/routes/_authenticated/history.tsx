import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("startup_reports")
        .select("id, health_score, created_at, startups(startup_name, industry)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (data ?? []).filter((r: any) =>
    !q || r.startups?.startup_name?.toLowerCase().includes(q.toLowerCase()) ||
    r.startups?.industry?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">History</h1>
          <p className="mt-1 text-muted-foreground">All your past Startup X-Ray reports.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or industry" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading…</div> :
        filtered.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">No reports yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Run your first Startup X-Ray to see it here.</p>
            <Link to="/xray"><Button className="mt-6 bg-gradient-primary text-primary-foreground">Run Startup X-Ray</Button></Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((r: any) => {
              const score = r.health_score ?? 0;
              const status = score >= 80 ? "High Potential" : score >= 65 ? "Promising" : score >= 45 ? "Needs Validation" : "High Risk";
              return (
                <Link key={r.id} to="/report/$reportId" params={{ reportId: r.id }}
                  className="group glass rounded-2xl p-5 transition hover:border-primary/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{r.startups?.startup_name ?? "Untitled"}</div>
                      <div className="text-xs text-muted-foreground">{r.startups?.industry} · {new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gradient">{score}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{status}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end text-sm text-primary opacity-0 transition group-hover:opacity-100">
                    View report <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
    </div>
  );
}
