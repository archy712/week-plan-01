"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { WeeklyReportInput } from "@/lib/types/weekly-report";
import { formatWeekRange, toWeekOptions, type WeekOption } from "@/lib/utils/week";

const WEEK_OPTIONS_COUNT = 8;

const weeklyReportFormSchema = z
  .object({
    week_start_date: z.string().min(1, "주차를 선택해주세요"),
    content: z.string().trim().min(10, "10자 이상 입력해주세요"),
    // 폼 내부에서는 미입력 상태를 빈 문자열로 다루고, 제출 시 null로 변환한다.
    target_end_date: z.string(),
  })
  .refine(
    (data) =>
      data.target_end_date === "" ||
      data.target_end_date >= data.week_start_date,
    {
      message: "목표 종료일은 주차 시작일 이후여야 합니다",
      path: ["target_end_date"],
    },
  );

type WeeklyReportFormValues = z.infer<typeof weeklyReportFormSchema>;

interface WeeklyReportFormDefaultValues {
  week_start_date: string;
  content: string;
  target_end_date: string | null;
}

interface WeeklyReportFormProps {
  defaultValues?: WeeklyReportFormDefaultValues;
  onSubmit: (values: WeeklyReportInput) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
}

function buildWeekOptions(
  selectedWeekStartDate?: string,
): WeekOption[] {
  const options = toWeekOptions(WEEK_OPTIONS_COUNT);
  if (
    selectedWeekStartDate &&
    !options.some((option) => option.value === selectedWeekStartDate)
  ) {
    // 수정 화면에서 기존 주차가 최근 N주 범위 밖이면 목록 맨 앞에 추가한다.
    options.unshift({
      value: selectedWeekStartDate,
      label: formatWeekRange(selectedWeekStartDate),
    });
  }
  return options;
}

export function WeeklyReportForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "저장",
}: WeeklyReportFormProps) {
  const weekOptions = useMemo(
    () => buildWeekOptions(defaultValues?.week_start_date),
    [defaultValues?.week_start_date],
  );

  const form = useForm<WeeklyReportFormValues>({
    resolver: zodResolver(weeklyReportFormSchema),
    defaultValues: {
      week_start_date:
        defaultValues?.week_start_date ?? weekOptions[0]?.value ?? "",
      content: defaultValues?.content ?? "",
      target_end_date: defaultValues?.target_end_date ?? "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      week_start_date: values.week_start_date,
      content: values.content,
      target_end_date: values.target_end_date || null,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="week_start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>주차</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="주차를 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {weekOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>업무 내용</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="이번 주 진행한 업무를 작성해주세요"
                  className="min-h-40"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target_end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>목표 종료일 (선택)</FormLabel>
              <FormControl>
                <Input type="date" className="w-full sm:w-64" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "저장 중..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
