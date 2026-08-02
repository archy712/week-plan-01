"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Department } from "@/lib/types/department";

interface DepartmentFilterProps {
  departments: Department[];
  // 부서 미선택 시(searchParams에 department가 없을 때) 기본으로 보여줄 부서 id
  defaultDepartmentId: string;
}

export function DepartmentFilter({
  departments,
  defaultDepartmentId,
}: DepartmentFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentDepartment =
    searchParams.get("department") ?? defaultDepartmentId;

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("department", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentDepartment} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-48" aria-label="부서 선택">
        <SelectValue placeholder="부서를 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        {departments.map((department) => (
          <SelectItem key={department.id} value={department.id}>
            {department.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
