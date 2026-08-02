import { Suspense } from "react";

import { DepartmentFilter } from "@/components/department-filter";
import { PageHeader } from "@/components/page-header";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekFilter } from "@/components/week-filter";
import { WeeklyReportList } from "@/components/weekly-report-list";
import { listDepartments } from "@/lib/data/departments";
import { listReportsByDepartment } from "@/lib/data/weekly-reports";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; week?: string }>;
}) {
  const { department, week } = await searchParams;

  const departments = await listDepartments();
  const selectedDepartment =
    departments.find((item) => item.id === department) ?? departments[0];

  const reports = selectedDepartment
    ? await listReportsByDepartment(selectedDepartment.id, week)
    : [];

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

      <WeeklyReportList reports={reports} fromParam="admin" />
    </div>
  );
}
