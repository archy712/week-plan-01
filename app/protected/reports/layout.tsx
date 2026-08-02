import { Suspense } from "react";

import { requireDepartment } from "@/lib/auth/guards";

async function DepartmentGate({ children }: { children: React.ReactNode }) {
  await requireDepartment();
  return <>{children}</>;
}

export default function ReportsLayout({
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
