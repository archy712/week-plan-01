"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

interface ReportsPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
}

// 주간업무 목록의 간단한 offset 기반 페이지네이션.
// 데이터량이 크지 않은 MVP 특성상 무한 스크롤 대신 이전/다음 버튼만 제공한다.
export function ReportsPagination({
  page,
  pageSize,
  totalCount,
}: ReportsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
      <p>
        총 {totalCount}건 중 {page}/{totalPages}페이지
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          이전
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
