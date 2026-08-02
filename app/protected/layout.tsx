import { Suspense } from "react";

import { EnvVarWarning } from "@/components/env-var-warning";
import { MainNav } from "@/components/main-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";

// TODO(Task 010/012): 아래 하드코딩된 값을 lib/auth/guards.ts의
// requireDepartment()/requireAdmin() 조회 결과로 교체한다.
const TEMP_HAS_DEPARTMENT = true;
const TEMP_IS_ADMIN = false;

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        {!hasEnvVars ? (
          <div className="flex h-16 w-full items-center justify-center border-b border-b-foreground/10 px-5">
            <EnvVarWarning />
          </div>
        ) : (
          <Suspense fallback={<div className="h-16 w-full" />}>
            <MainNav
              hasDepartment={TEMP_HAS_DEPARTMENT}
              isAdmin={TEMP_IS_ADMIN}
            />
          </Suspense>
        )}
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>부서 주간업무 일지 서비스</p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
