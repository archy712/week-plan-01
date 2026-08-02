import { createClient } from "@/lib/supabase/server";
import type { Department } from "@/lib/types/department";

export async function listDepartments(): Promise<Department[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("id, name, created_at")
    .order("name");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getDepartmentById(
  id: string,
): Promise<Department | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("id, name, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
