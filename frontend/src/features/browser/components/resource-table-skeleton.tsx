type ResourceTableSkeletonProps = {
  rows?: number;
};

export function ResourceTableSkeleton({ rows = 4 }: ResourceTableSkeletonProps) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
      <div className="grid grid-cols-[minmax(0,1fr)_7rem_8rem_2.5rem] border-b bg-muted/30 px-4 py-3">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="ml-auto h-4 w-4 animate-pulse rounded bg-muted" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          className="grid grid-cols-[minmax(0,1fr)_7rem_8rem_2.5rem] items-center gap-4 border-b px-4 py-3 last:border-b-0"
          key={index}
        >
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-4 w-4 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
