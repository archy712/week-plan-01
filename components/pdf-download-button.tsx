"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface PdfDownloadButtonProps {
  departmentName: string;
}

export function PdfDownloadButton({ departmentName }: PdfDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // TODO(Task 013): app/api/reports/pdf Route Handler(Notion 경유 PDF 생성) 호출로 교체
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.info(`${departmentName} 주간업무 PDF 다운로드 기능은 준비 중입니다.`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Download />
      )}
      PDF 다운로드
    </Button>
  );
}
