import { Suspense } from "react";

import { requireAdmin, requireDepartment } from "@/lib/auth/guards";

async function AdminGate({ children }: { children: React.ReactNode }) {
  // 부서 온보딩 미완료 사용자는 /protected/profile로, 관리자가 아니면
  // /protected/reports로 리다이렉트된다(애플리케이션 레벨 이중 방어,
  // 실제 데이터 격리는 RLS가 담당한다).
  await requireDepartment();
  await requireAdmin();
  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
