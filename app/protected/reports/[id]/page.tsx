import { notFound } from "next/navigation";

import { WeeklyReportDetail } from "@/components/weekly-report-detail";
import { mockWeeklyReports } from "@/lib/mock/weekly-reports";

export default async function ReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;

  const report = mockWeeklyReports.find((item) => item.id === id);

  if (!report) {
    notFound();
  }

  const backHref = from === "admin" ? "/protected/admin" : "/protected/reports";

  return <WeeklyReportDetail report={report} backHref={backHref} />;
}
