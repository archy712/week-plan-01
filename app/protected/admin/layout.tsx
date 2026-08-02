import { Suspense } from "react";

import { requireDepartment } from "@/lib/auth/guards";

async function DepartmentGate({ children }: { children: React.ReactNode }) {
  // TODO(Task 012): role = 'admin' 확인(requireAdmin())을 추가한다.
  await requireDepartment();
  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <DepartmentGate>{children}</DepartmentGate>
    </Suspense>
  );
}
