const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// "8월 3일" 형식. 값이 없으면 "-"를 반환한다 (목표 종료일처럼 nullable한 필드용).
export function formatDate(date: string | null): string {
  if (!date) return "-";
  return dateFormatter.format(new Date(date));
}

// "2026년 8월 3일 오후 2:30" 형식 (생성/수정 일시처럼 항상 값이 있는 필드용).
export function formatDateTime(date: string): string {
  return dateTimeFormatter.format(new Date(date));
}
