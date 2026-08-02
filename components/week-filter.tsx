"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALL_WEEKS_VALUE,
  getCurrentWeekStartISO,
  toWeekOptions,
} from "@/lib/utils/week";

const WEEK_OPTIONS_COUNT = 8;

export function WeekFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const weekOptions = toWeekOptions(WEEK_OPTIONS_COUNT);
  // URL에 week 파라미터가 없으면 "이번 주"를 기본값으로 취급한다(서버 쪽
  // app/protected/reports|admin의 page.tsx와 동일한 기본값 로직).
  // "전체 주차"를 선택한 상태는 파라미터를 지우는 대신 week=all로 명시해
  // 기본값(이번 주)과 구분하고 새로고침 후에도 선택이 유지되게 한다.
  const currentWeek = searchParams.get("week") ?? getCurrentWeekStartISO();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", value);
    // 필터가 바뀌면 페이지네이션은 1페이지부터 다시 시작한다.
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <Select value={currentWeek} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-56" aria-label="주차 필터">
        <SelectValue placeholder="주차 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_WEEKS_VALUE}>전체 주차</SelectItem>
        {weekOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
