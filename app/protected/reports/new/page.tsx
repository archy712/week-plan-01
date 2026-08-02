"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { WeeklyReportForm } from "@/components/weekly-report-form";
import type { WeeklyReportInput } from "@/lib/types/weekly-report";

export default function NewReportPage() {
  const router = useRouter();

  // TODO(Task 011): lib/supabase/client.ts 기반 실제 insert로 교체
  const handleSubmit = async (values: WeeklyReportInput) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("[dummy submit] new weekly report:", values);
    toast.success("주간업무 일지를 저장했습니다.");
    router.push("/protected/reports");
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <PageHeader
        title="주간업무 작성"
        description="이번 주 업무 내용을 작성하는 화면입니다."
      />
      <WeeklyReportForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/protected/reports")}
      />
    </div>
  );
}
