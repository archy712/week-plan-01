import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      <span className="max-w-[10rem] truncate sm:max-w-none">
        Hey, {user.email}!
      </span>
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/protected/profile">Profile</Link>
      </Button>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
