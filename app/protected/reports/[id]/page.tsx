export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <h1 className="text-2xl font-bold">주간업무 상세</h1>
      <p className="text-sm text-muted-foreground">
        일지 ID: {id}
      </p>
    </div>
  );
}
