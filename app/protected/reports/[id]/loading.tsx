import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// weekly-report-detail.tsx의 실제 레이아웃(제목/설명 + 카드 내부 필드 2열 + 본문 +
// 액션 버튼 3개)과 형태를 맞춘 스켈레톤.
export default function Loading() {
  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-52" />
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
