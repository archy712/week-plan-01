export interface WeeklyReport {
  id: string;
  department_id: string;
  author_id: string;
  week_start_date: string;
  content: string;
  target_end_date: string | null;
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
}

// 목록 화면용 조인 뷰 — 작성자 이름/부서명 포함 (author_id는 표시용, 권한 판단에는 사용하지 않음)
export interface WeeklyReportListItem extends WeeklyReport {
  author_name: string | null;
  department_name: string;
}

// 작성/수정 폼 입력 타입 — department_id/author_id는 서버에서 주입하므로 폼 입력에 포함하지 않음
export interface WeeklyReportInput {
  week_start_date: string;
  content: string;
  target_end_date: string | null;
}
