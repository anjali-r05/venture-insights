import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicReport } from "@/lib/xray.functions";
import { ReportView } from "@/components/report/ReportView";

export const Route = createFileRoute("/r/$reportId")({
  component: PublicReport,
});

function PublicReport() {
  const { reportId } = Route.useParams();
  const fetchReport = useServerFn(getPublicReport);
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-report", reportId],
    queryFn: () => fetchReport({ data: { reportId } }),
    retry: false,
  });

  if (isLoading) return <div className="py-24 text-center font-mono text-sm uppercase tracking-[0.25em] text-accent">Loading intelligence…</div>;
  if (error || !data) return <div className="py-24 text-center text-muted-foreground">This report is private or does not exist.</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ReportView report={data} isPublic readOnly />
    </div>
  );
}
