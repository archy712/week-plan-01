import { Skeleton } from "@/components/ui/skeleton";

// weekly-report-form.tsx의 실제 필드 구성(주차 선택 + 업무 내용 textarea + 목표
// 종료일 + 저장/취소 버튼)과 형태를 맞춘 스켈레톤.
export default function Loading() {
  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-full sm:w-64" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-40 w-full" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full sm:w-64" />
        </div>

        <div className="flex justify-end gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  );
}
