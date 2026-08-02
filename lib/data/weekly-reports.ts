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

// 부서 소속 사용자는 자기 부서 일지를, 관리자는 지정한 부서의 일지를 조회한다
// (권한 판단은 RLS에서 수행하므로 이 함수는 department_id로 필터링만 한다).
export async function listReportsByDepartment(
  departmentId: string,
  weekStart?: string,
): Promise<WeeklyReportListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("weekly_reports")
    .select(SELECT_WITH_RELATIONS)
    .eq("department_id", departmentId)
    .order("week_start_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (weekStart) {
    query = query.eq("week_start_date", weekStart);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as unknown as RawWeeklyReportRow[] | null ?? []).map(
    toListItem,
  );
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
