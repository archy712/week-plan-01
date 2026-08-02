"use client";

import { FileText, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { notifyActionError, notifySuccess } from "@/lib/utils/toast";
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
  // 서버에서 내려온 reports를 즉시 반영하기 위한 로컬 사본. 삭제 시 서버 응답을
  // 기다리지 않고 이 상태를 먼저 갱신해 낙관적 업데이트를 구현한다.
  const [items, setItems] = useState(reports);
  // 필터/페이지 변경 등으로 부모(Server Component)가 새로운 reports를 내려주면
  // (참조가 바뀌면) 렌더링 중에 로컬 상태를 동기화한다. useEffect로 동기화하면
  // 불필요한 추가 렌더가 발생하므로 React가 권장하는 "렌더 중 상태 조정" 패턴을 사용한다.
  const [prevReports, setPrevReports] = useState(reports);
  if (reports !== prevReports) {
    setPrevReports(reports);
    setItems(reports);
  }

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
    const target = pendingDelete;

    setIsDeleting(true);
    setPendingDelete(null);
    // 낙관적 업데이트: 서버 응답을 기다리지 않고 목록에서 즉시 제거한다.
    setItems((prev) => prev.filter((item) => item.id !== target.id));

    const supabase = createClient();
    const { error } = await supabase
      .from("weekly_reports")
      .delete()
      .eq("id", target.id);

    setIsDeleting(false);

    if (error) {
      // 실패 시 원래 목록으로 롤백한다. 동시에 다른 삭제가 진행되지 않으므로
      // isDeleting으로 잠긴 구간에서는 reports가 곧 원본 상태와 같다.
      setItems(reports);
      notifyActionError(
        error,
        "일지를 삭제하지 못했습니다. 다시 시도해주세요.",
        router,
      );
      return;
    }

    notifySuccess("일지를 삭제했습니다.");
    router.refresh();
  };

  if (items.length === 0) {
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
            {items.map((report) => (
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
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 모바일: 카드 리스트 */}
      <div className="flex flex-col gap-3 md:hidden">
        {items.map((report) => (
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
                <Trash2 className="h-4 w-4" aria-hidden="true" />
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
