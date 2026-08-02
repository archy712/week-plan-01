import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekFilter } from "@/components/week-filter";
import { WeeklyReportList } from "@/components/weekly-report-list";
import { mockDepartments } from "@/lib/mock/departments";
import { mockWeeklyReports } from "@/lib/mock/weekly-reports";

// TODO(Task 010/011): 로그인한 사용자의 실제 department_id(guards.requireDepartment())로 교체
const TEMP_CURRENT_DEPARTMENT = mockDepartments[0];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;

  const reports = mockWeeklyReports
    .filter((report) => report.department_id === TEMP_CURRENT_DEPARTMENT.id)
    .filter((report) => !week || report.week_start_date === week);

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <PageHeader
        title="주간업무 목록"
        description={`${TEMP_CURRENT_DEPARTMENT.name}의 주간업무 일지 목록입니다.`}
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
        <PdfDownloadButton departmentName={TEMP_CURRENT_DEPARTMENT.name} />
      </div>

      {/* week가 바뀔 때마다 리마운트해 WeeklyReportList의 로컬 삭제 상태를 새 필터 결과로 초기화한다 */}
      <WeeklyReportList key={week ?? "all"} reports={reports} />
    </div>
  );
}
