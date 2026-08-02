"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WeeklyReportForm } from "@/components/weekly-report-form";
import { createClient } from "@/lib/supabase/client";
import type {
  WeeklyReportInput,
  WeeklyReportListItem,
} from "@/lib/types/weekly-report";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import { notifyActionError, notifySuccess } from "@/lib/utils/toast";
import { formatWeekRange } from "@/lib/utils/week";

interface WeeklyReportDetailProps {
  report: WeeklyReportListItem;
  backHref: string;
}

export function WeeklyReportDetail({
  report,
  backHref,
}: WeeklyReportDetailProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (values: WeeklyReportInput) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("weekly_reports")
      .update({
        week_start_date: values.week_start_date,
        content: values.content,
        target_end_date: values.target_end_date,
      })
      .eq("id", report.id);

    if (error) {
      notifyActionError(
        error,
        "주간업무 일지를 수정하지 못했습니다. 다시 시도해주세요.",
        router,
      );
      return;
    }

    notifySuccess("주간업무 일지를 수정했습니다.");
    setMode("view");
    router.refresh();
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("weekly_reports")
      .delete()
      .eq("id", report.id);

    setIsDeleting(false);
    setIsDeleteDialogOpen(false);

    if (error) {
      notifyActionError(
        error,
        "일지를 삭제하지 못했습니다. 다시 시도해주세요.",
        router,
      );
      return;
    }

    notifySuccess("일지를 삭제했습니다.");
    router.push(backHref);
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <PageHeader
        title="주간업무 상세"
        description={formatWeekRange(report.week_start_date)}
      />

      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <dl className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="inline font-medium text-foreground">작성자 </dt>
              <dd className="inline">{report.author_name ?? "-"}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">부서 </dt>
              <dd className="inline">{report.department_name}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">
                목표 종료일{" "}
              </dt>
              <dd className="inline">{formatDate(report.target_end_date)}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">
                작성일 / 수정일{" "}
              </dt>
              <dd className="inline">
                {formatDateTime(report.created_at)} /{" "}
                {formatDateTime(report.updated_at)}
              </dd>
            </div>
          </dl>

          {mode === "view" ? (
            <>
              <p className="whitespace-pre-wrap text-sm">{report.content}</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setMode("edit")}>수정</Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  삭제
                </Button>
                <Button variant="outline" asChild>
                  <Link href={backHref}>목록으로</Link>
                </Button>
              </div>
            </>
          ) : (
            <WeeklyReportForm
              defaultValues={{
                week_start_date: report.week_start_date,
                content: report.content,
                target_end_date: report.target_end_date,
              }}
              submitLabel="저장"
              onSubmit={handleUpdate}
              onCancel={() => setMode("view")}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>일지를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 삭제하면 목록으로 이동합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
