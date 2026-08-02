import { Building2 } from "lucide-react";
import { Suspense } from "react";

import { DepartmentFilter } from "@/components/department-filter";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { ReportsPagination } from "@/components/reports-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekFilter } from "@/components/week-filter";
import { WeeklyReportList } from "@/components/weekly-report-list";
import { listDepartments } from "@/lib/data/departments";
import {
  listReportsByDepartment,
  type ListReportsResult,
} from "@/lib/data/weekly-reports";
import { ALL_WEEKS_VALUE, getCurrentWeekStartISO } from "@/lib/utils/week";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; week?: string; page?: string }>;
}) {
  const { department, week, page } = await searchParams;

  const departments = await listDepartments();

  if (departments.length === 0) {
    return (
      <div className="flex-1 w-full flex flex-col gap-6">
        <PageHeader
          title="전체 부서 조회"
          description="관리자는 모든 부서의 주간업무 일지를 조회·수정·삭제할 수 있습니다."
        />
        <EmptyState
          icon={Building2}
          title="등록된 부서가 없습니다"
          description="Supabase 대시보드에서 부서를 먼저 등록해주세요."
        />
      </div>
    );
  }

  const selectedDepartment =
    departments.find((item) => item.id === department) ?? departments[0];

  // 주차 필터 기본값은 "이번 주". week=all이면 전체 주차, 그 외에는 지정된 주차로 필터링한다.
  const weekFilter =
    week === ALL_WEEKS_VALUE ? undefined : (week ?? getCurrentWeekStartISO());
  const pageNumber = Number(page) > 0 ? Number(page) : 1;

  const reportsResult: ListReportsResult = selectedDepartment
    ? await listReportsByDepartment(selectedDepartment.id, {
        weekStart: weekFilter,
        page: pageNumber,
      })
    : { items: [], totalCount: 0, page: 1, pageSize: 10 };

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
              departments={departments}
              defaultDepartmentId={departments[0]?.id ?? ""}
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-9 w-full sm:w-56" />}>
            <WeekFilter />
          </Suspense>
        </div>
        {selectedDepartment && (
          <PdfDownloadButton departmentName={selectedDepartment.name} />
        )}
      </div>

      <WeeklyReportList reports={reportsResult.items} fromParam="admin" />

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
