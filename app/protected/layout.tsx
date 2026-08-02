import { Suspense } from "react";

import { EnvVarWarning } from "@/components/env-var-warning";
import { MainNav } from "@/components/main-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

async function MainNavServer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  let hasDepartment = false;
  let isAdmin = false;

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("department_id, role")
      .eq("id", userId)
      .maybeSingle();

    hasDepartment = Boolean(profile?.department_id);
    isAdmin = profile?.role === "admin";
  }

  return <MainNav hasDepartment={hasDepartment} isAdmin={isAdmin} />;
}

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
            <MainNavServer />
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
