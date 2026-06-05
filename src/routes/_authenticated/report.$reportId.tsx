import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setReportPublic } from "@/lib/xray.functions";
import { ReportView } from "@/components/report/ReportView";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/report/$reportId")({
  component: ReportPage,
});

function ReportPage() {
  const { reportId } = Route.useParams();
  const togglePublic = useServerFn(setReportPublic);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("startup_reports")
        .select("*, startups(startup_name, industry, startup_stage)")
        .eq("id", reportId)
        .single();
      if (error) throw error;
      return data;
    },
  });
  const [busy, setBusy] = useState(false);

  if (isLoading) return <div className="py-24 text-center font-mono text-sm uppercase tracking-[0.25em] text-accent">Loading intelligence…</div>;
  if (!data) return <div className="py-24 text-center text-muted-foreground">Report not found.</div>;

  const onShare = async () => {
    setBusy(true);
    try {
      const next = !(data as any).is_public;
      await togglePublic({ data: { reportId, isPublic: next } });
      await refetch();
      if (next) {
        const url = `${window.location.origin}/r/${reportId}`;
        await navigator.clipboard.writeText(url);
        toast.success("Public link copied to clipboard");
      } else {
        toast.success("Sharing disabled");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async () => {
    if (!(data as any).is_public) {
      toast.info("Enable sharing first to get a public link.");
      return;
    }
    await navigator.clipboard.writeText(`${window.location.origin}/r/${reportId}`);
    toast.success("Link copied");
  };

  return (
    <ReportView
      report={data}
      isPublic={(data as any).is_public}
      onShare={onShare}
      onCopy={onCopy}
      busy={busy}
      backHref="/history"
    />
  );
}
