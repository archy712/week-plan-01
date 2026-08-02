// 라우트 가드 (Task 003에서 시그니처 정의, Task 010에서 requireUser/requireDepartment 구현)

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export interface RequireUserResult {
  userId: string;
  email: string | null;
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
 */
export async function requireUser(): Promise<RequireUserResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return { userId: data.claims.sub, email: data.claims.email ?? null };
}

/**
 * 인증 + 부서 선택 완료 여부를 확인한다. 부서 미선택이면 `/protected/profile`로
 * redirect()한다.
 */
export async function requireDepartment(): Promise<RequireDepartmentResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("department_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!profile?.department_id) {
    redirect("/protected/profile");
  }

  return { userId, departmentId: profile.department_id };
}

/**
 * 인증 + 관리자(role = 'admin') 여부를 확인한다. 관리자가 아니면
 * `/protected/reports`로 redirect()한다.
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (profile?.role !== "admin") {
    redirect("/protected/reports");
  }

  return { userId };
}
