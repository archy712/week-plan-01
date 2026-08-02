import { WeeklyReportCreate } from "@/components/weekly-report-create";
import { requireDepartment } from "@/lib/auth/guards";

export default async function NewReportPage() {
  const { userId, departmentId } = await requireDepartment();

  return <WeeklyReportCreate departmentId={departmentId} authorId={userId} />;
}
