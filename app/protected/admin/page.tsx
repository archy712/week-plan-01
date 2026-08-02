import { Suspense } from "react";

import { DepartmentFilter } from "@/components/department-filter";
import { PageHeader } from "@/components/page-header";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekFilter } from "@/components/week-filter";
import { WeeklyReportList } from "@/components/weekly-report-list";
import { mockDepartments } from "@/lib/mock/departments";
import { mockWeeklyReports } from "@/lib/mock/weekly-reports";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; week?: string }>;
}) {
  const { department, week } = await searchParams;

  const selectedDepartment =
    mockDepartments.find((item) => item.id === department) ??
    mockDepartments[0];

  const reports = mockWeeklyReports
    .filter((report) => report.department_id === selectedDepartment.id)
    .filter((report) => !week || report.week_start_date === week);

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <PageHeader
        title="전체 부서 조회"
        description="관리자는 모든 부서의 주간업무 일지를 조회·수정·삭제할 수 있습니다."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Suspense fallback={<Skeleton className="h-9 w-full sm:w-48" />}>
            <DepartmentFilter
              departments={mockDepartments}
              defaultDepartmentId={mockDepartments[0].id}
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-9 w-full sm:w-56" />}>
            <WeekFilter />
          </Suspense>
        </div>
        <PdfDownloadButton departmentName={selectedDepartment.name} />
      </div>

      {/* 부서/주차가 바뀔 때마다 리마운트해 목록의 로컬 삭제 상태를 새 필터 결과로 초기화한다 */}
      <WeeklyReportList
        key={`${selectedDepartment.id}:${week ?? "all"}`}
        reports={reports}
        fromParam="admin"
      />
    </div>
  );
}
