// 라우트 가드 시그니처 정의 (Task 003)
//
// 이 파일은 함수 시그니처와 반환 타입만 확정한다. 실제 구현(Supabase 세션/프로필 조회,
// redirect() 호출)은 아래 각 함수에 명시된 후속 Task에서 채운다.
// 지금은 어떤 Server Component/레이아웃에서도 호출하지 않는다.

export interface RequireUserResult {
  userId: string;
}

export interface RequireDepartmentResult {
  userId: string;
  departmentId: string;
}

export interface RequireAdminResult {
  userId: string;
}

/**
 * 인증 여부만 확인한다. 세션이 없으면 `/auth/login`으로 redirect()한다.
 * 실제 구현은 Task 010에서 채운다.
 */
export async function requireUser(): Promise<RequireUserResult> {
  throw new Error(
    "requireUser()는 아직 구현되지 않았습니다 (Task 010에서 구현 예정)",
  );
}

/**
 * 인증 + 부서 선택 완료 여부를 확인한다. 부서 미선택이면 `/protected/profile`로
 * redirect()한다. 실제 구현은 Task 010에서 채운다.
 */
export async function requireDepartment(): Promise<RequireDepartmentResult> {
  throw new Error(
    "requireDepartment()는 아직 구현되지 않았습니다 (Task 010에서 구현 예정)",
  );
}

/**
 * 인증 + 관리자(role = 'admin') 여부를 확인한다. 아니면 `/protected/reports`로
 * redirect()한다. 실제 구현은 Task 012에서 채운다.
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
  throw new Error(
    "requireAdmin()는 아직 구현되지 않았습니다 (Task 012에서 구현 예정)",
  );
}
