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

export { toISODateString };
