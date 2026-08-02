import { mockDepartments } from "@/lib/mock/departments";
import type { WeeklyReportListItem } from "@/lib/types/weekly-report";
import { getWeekStartDate, toISODateString } from "@/lib/utils/week";

// 하드코딩된 기준일 — new Date()를 쓰면 서버 렌더링 시점과 클라이언트 하이드레이션
// 시점의 "현재 주차"가 어긋나 하이드레이션 불일치가 생길 수 있으므로 고정값을 사용한다.
const REFERENCE_DATE = new Date("2026-08-02T00:00:00.000Z");
const WEEKS_PER_AUTHOR = 3;

interface MockAuthor {
  id: string;
  name: string;
  departmentId: string;
}

// 부서당 2명, 총 10명의 더미 작성자 (같은 부서 안에서 작성자가 섞이는 상황을 재현)
const MOCK_AUTHORS: MockAuthor[] = [
  { id: "author-kim-doyoon", name: "김도윤", departmentId: mockDepartments[0].id },
  { id: "author-lee-seoyeon", name: "이서연", departmentId: mockDepartments[0].id },
  { id: "author-park-jihoon", name: "박지훈", departmentId: mockDepartments[1].id },
  { id: "author-choi-yujin", name: "최유진", departmentId: mockDepartments[1].id },
  { id: "author-jung-minseo", name: "정민서", departmentId: mockDepartments[2].id },
  { id: "author-han-soyul", name: "한소율", departmentId: mockDepartments[2].id },
  { id: "author-oh-taeyang", name: "오태양", departmentId: mockDepartments[3].id },
  { id: "author-seo-jimin", name: "서지민", departmentId: mockDepartments[3].id },
  { id: "author-kang-haeun", name: "강하은", departmentId: mockDepartments[4].id },
  { id: "author-yoon-jaehyun", name: "윤재현", departmentId: mockDepartments[4].id },
];

const CONTENT_TEMPLATES = [
  "주간 스프린트 계획 수립 및 백로그 정리를 진행했습니다.",
  "고객 피드백을 반영해 기능 개선안을 작성했습니다.",
  "타 부서와 협업 회의를 진행하고 다음 액션 아이템을 정리했습니다.",
  "지난 주 이슈를 마무리하고 회고를 진행했습니다.",
  "신규 프로젝트 착수를 위한 요구사항을 정리했습니다.",
];

function buildMockWeeklyReports(): WeeklyReportListItem[] {
  const currentWeekStart = getWeekStartDate(REFERENCE_DATE);
  const reports: WeeklyReportListItem[] = [];

  MOCK_AUTHORS.forEach((author, authorIndex) => {
    const department = mockDepartments.find((d) => d.id === author.departmentId);
    if (!department) return;

    for (let weekOffset = 0; weekOffset < WEEKS_PER_AUTHOR; weekOffset++) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - weekOffset * 7);
      const weekStartDate = toISODateString(weekStart);

      // 이번 주(offset 0)는 아직 목표 종료일을 정하지 않은 경우도 섞는다
      let targetEndDate: string | null = null;
      if (weekOffset > 0) {
        const end = new Date(weekStart);
        end.setDate(weekStart.getDate() + 4); // 해당 주차의 금요일
        targetEndDate = toISODateString(end);
      }

      const createdAt = new Date(weekStart);
      createdAt.setDate(weekStart.getDate() + 1);

      reports.push({
        id: `wr-${author.id}-${weekStartDate}`,
        department_id: department.id,
        author_id: author.id,
        week_start_date: weekStartDate,
        content:
          CONTENT_TEMPLATES[(authorIndex + weekOffset) % CONTENT_TEMPLATES.length],
        target_end_date: targetEndDate,
        notion_page_id: null,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
        author_name: author.name,
        department_name: department.name,
      });
    }
  });

  return reports.sort((a, b) => (a.week_start_date < b.week_start_date ? 1 : -1));
}

export const mockWeeklyReports =
  buildMockWeeklyReports() satisfies WeeklyReportListItem[];
