import type { Department } from "@/lib/types/department";

export type UserRole = "user" | "admin";

export interface ProfileWithDepartment {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  department_id: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  department: Pick<Department, "id" | "name"> | null;
}
