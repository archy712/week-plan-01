"use client";

import { FileText, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import type { WeeklyReportListItem } from "@/lib/types/weekly-report";
import { formatDate } from "@/lib/utils/date";
import { formatWeekRange } from "@/lib/utils/week";

const CONTENT_SUMMARY_MAX_LENGTH = 40;

function summarizeContent(content: string) {
  if (content.length <= CONTENT_SUMMARY_MAX_LENGTH) return content;
  return `${content.slice(0, CONTENT_SUMMARY_MAX_LENGTH)}…`;
}

interface WeeklyReportListProps {
  reports: WeeklyReportListItem[];
  // 관리자 대시보드에서 재사용할 때 상세 페이지의 "목록으로" 복귀 경로를
  // 구분하기 위한 값. 예: "admin" → 상세로 이동 시 ?from=admin이 붙는다.
  fromParam?: string;
}

export function WeeklyReportList({ reports, fromParam }: WeeklyReportListProps) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] =
    useState<WeeklyReportListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRowClick = (id: string) => {
    const query = fromParam ? `?from=${fromParam}` : "";
    router.push(`/protected/reports/${id}${query}`);
  };

  const handleDeleteClick = (
    event: React.MouseEvent,
    report: WeeklyReportListItem,
  ) => {
    event.stopPropagation();
    setPendingDelete(report);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("weekly_reports")
      .delete()
      .eq("id", pendingDelete.id);

    setIsDeleting(false);
    setPendingDelete(null);

    if (error) {
      toast.error("일지를 삭제하지 못했습니다. 다시 시도해주세요.");
      return;
    }

    toast.success("일지를 삭제했습니다.");
    router.refresh();
  };

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="표시할 주간업무 일지가 없습니다"
        description="새 일지를 작성해 첫 주간업무를 기록해보세요."
      />
    );
  }

  return (
    <>
      {/* 데스크톱: 테이블 */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주차</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>내용</TableHead>
              <TableHead>목표 종료일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow
                key={report.id}
                onClick={() => handleRowClick(report.id)}
                className="cursor-pointer"
              >
                <TableCell className="whitespace-nowrap">
                  {formatWeekRange(report.week_start_date)}
                </TableCell>
                <TableCell>{report.author_name ?? "-"}</TableCell>
                <TableCell className="max-w-xs truncate whitespace-normal">
                  {summarizeContent(report.content)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(report.target_end_date)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="삭제"
                    onClick={(event) => handleDeleteClick(event, report)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 모바일: 카드 리스트 */}
      <div className="flex flex-col gap-3 md:hidden">
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => handleRowClick(report.id)}
            className="flex cursor-pointer flex-col gap-2 rounded-lg border p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {formatWeekRange(report.week_start_date)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="삭제"
                onClick={(event) => handleDeleteClick(event, report)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {report.author_name ?? "-"}
            </p>
            <p className="text-sm">{summarizeContent(report.content)}</p>
            <p className="text-xs text-muted-foreground">
              목표 종료일: {formatDate(report.target_end_date)}
            </p>
          </div>
        ))}
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>일지를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 삭제하면 목록에서 사라집니다.
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
    </>
  );
}
