import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekFilter } from "@/components/week-filter";
import { WeeklyReportList } from "@/components/weekly-report-list";
import { requireDepartment } from "@/lib/auth/guards";
import { getDepartmentById } from "@/lib/data/departments";
import { listReportsByDepartment } from "@/lib/data/weekly-reports";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const { departmentId } = await requireDepartment();

  const [department, reports] = await Promise.all([
    getDepartmentById(departmentId),
    listReportsByDepartment(departmentId, week),
  ]);

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <PageHeader
        title="주간업무 목록"
        description={`${department?.name ?? ""}의 주간업무 일지 목록입니다.`}
        action={
          <Button asChild>
            <Link href="/protected/reports/new">새 일지 작성</Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={<Skeleton className="h-9 w-full sm:w-56" />}>
          <WeekFilter />
        </Suspense>
        <PdfDownloadButton departmentName={department?.name ?? ""} />
      </div>

      <WeeklyReportList reports={reports} />
    </div>
  );
}
