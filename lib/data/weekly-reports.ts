import { createClient } from "@/lib/supabase/server";
import type { WeeklyReportListItem } from "@/lib/types/weekly-report";

const SELECT_WITH_RELATIONS =
  "id, department_id, author_id, week_start_date, content, target_end_date, notion_page_id, created_at, updated_at, profiles(full_name), departments(name)";

interface RawWeeklyReportRow {
  id: string;
  department_id: string;
  author_id: string;
  week_start_date: string;
  content: string;
  target_end_date: string | null;
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string | null } | null;
  departments: { name: string } | null;
}

function toListItem(row: RawWeeklyReportRow): WeeklyReportListItem {
  return {
    id: row.id,
    department_id: row.department_id,
    author_id: row.author_id,
    week_start_date: row.week_start_date,
    content: row.content,
    target_end_date: row.target_end_date,
    notion_page_id: row.notion_page_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_name: row.profiles?.full_name ?? null,
    department_name: row.departments?.name ?? "",
  };
}

export const DEFAULT_REPORTS_PAGE_SIZE = 10;

export interface ListReportsOptions {
  // 주차 시작일(YYYY-MM-DD) 필터. 미지정 시 전체 주차를 조회한다.
  weekStart?: string;
  // 1-based 페이지 번호. 기본값 1.
  page?: number;
  pageSize?: number;
}

export interface ListReportsResult {
  items: WeeklyReportListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// 부서 소속 사용자는 자기 부서 일지를, 관리자는 지정한 부서의 일지를 조회한다
// (권한 판단은 RLS에서 수행하므로 이 함수는 department_id로 필터링만 한다).
// 목록이 길어질 경우를 대비해 간단한 offset 기반 페이지네이션을 지원한다.
export async function listReportsByDepartment(
  departmentId: string,
  options: ListReportsOptions = {},
): Promise<ListReportsResult> {
  const { weekStart, page = 1, pageSize = DEFAULT_REPORTS_PAGE_SIZE } = options;
  const safePage = Math.max(1, page);

  const supabase = await createClient();

  let query = supabase
    .from("weekly_reports")
    .select(SELECT_WITH_RELATIONS, { count: "exact" })
    .eq("department_id", departmentId)
    .order("week_start_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (weekStart) {
    query = query.eq("week_start_date", weekStart);
  }

  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    items: (data as unknown as RawWeeklyReportRow[] | null ?? []).map(
      toListItem,
    ),
    totalCount: count ?? 0,
    page: safePage,
    pageSize,
  };
}

export async function getReportById(
  id: string,
): Promise<WeeklyReportListItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weekly_reports")
    .select(SELECT_WITH_RELATIONS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return toListItem(data as unknown as RawWeeklyReportRow);
}
