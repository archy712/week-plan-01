import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { ReportsPagination } from "@/components/reports-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekFilter } from "@/components/week-filter";
import { WeeklyReportList } from "@/components/weekly-report-list";
import { requireDepartment } from "@/lib/auth/guards";
import { getDepartmentById } from "@/lib/data/departments";
import { listReportsByDepartment } from "@/lib/data/weekly-reports";
import { ALL_WEEKS_VALUE, getCurrentWeekStartISO } from "@/lib/utils/week";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; page?: string }>;
}) {
  const { week, page } = await searchParams;
  const { departmentId } = await requireDepartment();

  // 주차 필터 기본값은 "이번 주". week=all이면 전체 주차, 그 외에는 지정된 주차로 필터링한다.
  const weekFilter =
    week === ALL_WEEKS_VALUE ? undefined : (week ?? getCurrentWeekStartISO());
  const pageNumber = Number(page) > 0 ? Number(page) : 1;

  const [department, reportsResult] = await Promise.all([
    getDepartmentById(departmentId),
    listReportsByDepartment(departmentId, {
      weekStart: weekFilter,
      page: pageNumber,
    }),
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

      <WeeklyReportList reports={reportsResult.items} />

      <Suspense>
        <ReportsPagination
          page={reportsResult.page}
          pageSize={reportsResult.pageSize}
          totalCount={reportsResult.totalCount}
        />
      </Suspense>
    </div>
  );
}
