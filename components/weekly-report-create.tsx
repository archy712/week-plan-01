"use client";

import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { WeeklyReportForm } from "@/components/weekly-report-form";
import { createClient } from "@/lib/supabase/client";
import type { WeeklyReportInput } from "@/lib/types/weekly-report";
import { notifyActionError, notifySuccess } from "@/lib/utils/toast";

interface WeeklyReportCreateProps {
  departmentId: string;
  authorId: string;
}

export function WeeklyReportCreate({
  departmentId,
  authorId,
}: WeeklyReportCreateProps) {
  const router = useRouter();

  const handleSubmit = async (values: WeeklyReportInput) => {
    const supabase = createClient();
    const { error } = await supabase.from("weekly_reports").insert({
      department_id: departmentId,
      author_id: authorId,
      week_start_date: values.week_start_date,
      content: values.content,
      target_end_date: values.target_end_date,
    });

    if (error) {
      notifyActionError(
        error,
        "주간업무 일지를 저장하지 못했습니다. 다시 시도해주세요.",
        router,
      );
      return;
    }

    notifySuccess("주간업무 일지를 저장했습니다.");
    router.push("/protected/reports");
    router.refresh();
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
