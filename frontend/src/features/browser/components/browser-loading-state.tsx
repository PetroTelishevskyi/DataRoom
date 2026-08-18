export function BrowserLoadingState() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
      <div className="space-y-3 p-4">
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
