"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toWeekOptions } from "@/lib/utils/week";

const WEEK_OPTIONS_COUNT = 8;
const ALL_WEEKS_VALUE = "all";

export function WeekFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const weekOptions = toWeekOptions(WEEK_OPTIONS_COUNT);
  const currentWeek = searchParams.get("week") ?? ALL_WEEKS_VALUE;

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL_WEEKS_VALUE) {
      params.delete("week");
    } else {
      params.set("week", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <Select value={currentWeek} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-56" aria-label="주차 필터">
        <SelectValue placeholder="주차 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_WEEKS_VALUE}>전체 주차</SelectItem>
        {weekOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
