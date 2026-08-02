// 주간업무 일지의 "주차" 계산 유틸.
// 이 서비스의 주 시작 요일은 월요일로 고정한다 (0 = 일요일 ... 6 = 토요일).
const WEEK_STARTS_ON = 1;

const weekRangeFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
});

function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 주어진 날짜가 속한 주차의 시작일(월요일)을 반환한다.
export function getWeekStartDate(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const diff = (day - WEEK_STARTS_ON + 7) % 7;
  result.setDate(result.getDate() - diff);
  return result;
}

// "8월 3일 ~ 8월 9일" 형식으로 주차 범위를 표시한다.
export function formatWeekRange(weekStartDate: string | Date): string {
  const start =
    typeof weekStartDate === "string" ? new Date(weekStartDate) : weekStartDate;
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${weekRangeFormatter.format(start)} ~ ${weekRangeFormatter.format(end)}`;
}

export interface WeekOption {
  // 주차 시작일 (YYYY-MM-DD, weekly_reports.week_start_date와 동일 포맷)
  value: string;
  label: string;
}

// 현재 주차부터 과거로 `count`개의 주차 선택 옵션을 만든다 (작성 폼의 주차 선택 드롭다운용).
export function toWeekOptions(
  count: number,
  referenceDate: Date = new Date(),
): WeekOption[] {
  const currentWeekStart = getWeekStartDate(referenceDate);

  return Array.from({ length: count }, (_, index) => {
    const start = new Date(currentWeekStart);
    start.setDate(currentWeekStart.getDate() - index * 7);

    return {
      value: toISODateString(start),
      label: formatWeekRange(start),
    };
  });
}

// "전체 주차" 필터를 나타내는 값. week-filter.tsx("use client")와 서버 컴포넌트
// (reports/admin의 page.tsx) 양쪽에서 동일한 상수를 참조해야 하는데, "use client"
// 모듈의 named export를 서버 컴포넌트에서 import하면 실제 값이 아니라 클라이언트
// 참조로 치환되어 비교가 깨진다. 그래서 순수 유틸 모듈인 이 파일에 둔다.
export const ALL_WEEKS_VALUE = "all";

// 오늘이 속한 주차의 시작일(월요일)을 YYYY-MM-DD 문자열로 반환한다.
// 주차 필터 기본값("이번 주")을 서버/클라이언트 양쪽에서 동일하게 계산할 때 사용한다.
export function getCurrentWeekStartISO(): string {
  return toISODateString(getWeekStartDate());
}

export { toISODateString };
