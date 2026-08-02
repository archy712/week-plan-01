"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 py-24">
      <p className="text-sm text-muted-foreground">문제가 발생했습니다.</p>
      <Button onClick={() => reset()}>다시 시도</Button>
    </div>
  );
}
