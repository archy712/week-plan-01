"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import type { Department } from "@/lib/types/department";
import { cn } from "@/lib/utils";

type Profile = Pick<
  Tables<"profiles">,
  | "id"
  | "email"
  | "username"
  | "full_name"
  | "avatar_url"
  | "department_id"
>;

const profileFormSchema = z.object({
  username: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.length >= 3, {
      message: "3자 이상 입력해주세요",
    }),
  fullName: z.string().trim(),
  avatarUrl: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || z.url().safeParse(value).success,
      { message: "올바른 URL 형식이 아닙니다" },
    ),
  departmentId: z.string().min(1, "부서를 선택해주세요"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({
  profile,
  departments,
  className,
  ...props
}: {
  profile: Profile;
  departments: Department[];
} & React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile.username ?? "",
      fullName: profile.full_name ?? "",
      avatarUrl: profile.avatar_url ?? "",
      departmentId: profile.department_id ?? "",
    },
  });

  const departmentId = useWatch({
    control: form.control,
    name: "departmentId",
  });
  const hasDepartment = departmentId.length > 0;

  const onSubmit = async (values: ProfileFormValues) => {
    setError(null);
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: values.username.trim() || null,
        full_name: values.fullName.trim() || null,
        avatar_url: values.avatarUrl.trim() || null,
        department_id: values.departmentId,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/protected/reports");
    router.refresh();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {!hasDepartment && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          부서를 선택해야 서비스를 이용할 수 있습니다.
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">프로필 수정</CardTitle>
          <CardDescription>회원 프로필 정보를 수정합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, () => setError(null))}
              className="flex flex-col gap-6"
            >
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email ?? ""}
                  disabled
                />
              </div>

              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>부서</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="부서를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사용자 이름</FormLabel>
                    <FormControl>
                      <Input placeholder="3자 이상 입력해주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>프로필 이미지 URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/avatar.png"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "저장 중..." : "저장"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
