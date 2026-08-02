import { Suspense } from "react";

import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth/guards";
import { listDepartments } from "@/lib/data/departments";
import { createClient } from "@/lib/supabase/server";

async function ProfileContent() {
  const { userId, email } = await requireUser();
  const supabase = await createClient();

  const [{ data: profile, error: profileError }, departments] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, username, full_name, avatar_url, department_id")
        .eq("id", userId)
        .maybeSingle(),
      listDepartments(),
    ]);

  if (profileError) {
    throw profileError;
  }

  return (
    <ProfileForm
      profile={
        profile ?? {
          id: userId,
          email,
          username: null,
          full_name: null,
          avatar_url: null,
          department_id: null,
        }
      }
      departments={departments}
    />
  );
}

export default function ProfilePage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <Suspense>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
