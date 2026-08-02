// 클라이언트 액션(저장/수정/삭제 등)의 성공·실패 토스트를 통일하기 위한 공용 유틸.
// weekly-report-* 컴포넌트에서 사용하며, Task 013(PDF 생성)이 구현될 때도
// 동일한 notifySuccess/notifyActionError를 그대로 재사용할 수 있도록 설계했다.
"use client";

import { toast } from "sonner";

interface RouterLike {
  push: (href: string) => void;
}

interface SupabaseLikeError {
  code?: string;
  message?: string;
  status?: number;
}

const SESSION_EXPIRED_MESSAGE = "세션이 만료되었습니다. 다시 로그인해주세요.";

// Supabase(PostgREST/GoTrue)가 세션 만료 시 흔히 내려주는 에러 형태를 감지한다.
// - PGRST301: PostgREST가 만료된 JWT를 거부할 때의 코드
// - status 401: GoTrue/PostgREST 공통 인증 실패 상태 코드
// - 메시지에 "JWT"/"expired"/refresh token 관련 문구가 포함된 경우
function isSessionExpiredError(error: SupabaseLikeError): boolean {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  return (
    code === "PGRST301" ||
    error.status === 401 ||
    message.includes("jwt") ||
    message.includes("refresh_token_not_found") ||
    (message.includes("session") && message.includes("expired"))
  );
}

export function notifySuccess(message: string) {
  toast.success(message);
}

/**
 * Supabase 액션 실패를 공통 처리한다.
 * 세션 만료로 판단되면 안내 토스트 후 로그인 페이지로 유도하고, 그 외에는
 * 지정된 실패 메시지를 토스트로 노출한다.
 *
 * @returns 세션 만료로 판단해 로그인 페이지로 유도했으면 true, 그 외 일반 에러
 *          토스트만 노출했으면 false. 호출부는 true일 때 추가 상태 변경(폼 초기화 등)을
 *          건너뛰는 것이 안전하다.
 */
export function notifyActionError(
  error: SupabaseLikeError,
  fallbackMessage: string,
  router: RouterLike,
): boolean {
  if (isSessionExpiredError(error)) {
    toast.error(SESSION_EXPIRED_MESSAGE);
    router.push("/auth/login");
    return true;
  }

  toast.error(fallbackMessage);
  return false;
}
