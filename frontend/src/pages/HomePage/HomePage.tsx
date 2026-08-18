import { useQuery } from "@tanstack/react-query";
import { FileText, FolderPlus, Upload } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  dataRoomContentsQueryOptions,
  dataRoomsQueryOptions,
} from "@/features/data-rooms/data-room-queries";

function BrowserLoadingState() {
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

function BrowserErrorState() {
  return (
    <Empty className="min-h-0 flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText aria-hidden />
        </EmptyMedia>
        <EmptyTitle>This item is unavailable</EmptyTitle>
        <EmptyDescription>
          It may have been deleted or your access may have been removed.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function EmptyDataRoomState() {
  return (
    <Empty className="min-h-0 flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText aria-hidden />
        </EmptyMedia>
        <EmptyTitle>No files or folders yet</EmptyTitle>
        <EmptyDescription>
          Create a folder or import files to start organizing this Data Room.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="sm:flex-row">
        <Button disabled type="button">
          <FolderPlus aria-hidden className="h-4 w-4" />
          Create Folder
        </Button>
        <Button disabled type="button" variant="outline">
          <Upload aria-hidden className="h-4 w-4" />
          Import File
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function HomePage() {
  const dataRoomsQuery = useQuery(dataRoomsQueryOptions());
  const dataRoom = dataRoomsQuery.data?.[0] ?? null;
  const contentsQuery = useQuery({
    ...dataRoomContentsQueryOptions(dataRoom?.id ?? ""),
    enabled: Boolean(dataRoom),
  });
  const isLoading =
    dataRoomsQuery.isLoading || (Boolean(dataRoom) && contentsQuery.isLoading);
  const isError = dataRoomsQuery.isError || contentsQuery.isError;
  const items = contentsQuery.data?.items ?? [];
  const breadcrumbTitle = dataRoom?.name ?? "Data Room";

  return (
    <section className="flex min-h-full w-full flex-col">
      <header className="px-6 pt-4 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList className="overflow-x-auto whitespace-nowrap">
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate">
                {breadcrumbTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4 border-b" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-6 py-5 lg:px-8">
        {isLoading ? <BrowserLoadingState /> : null}

        {!isLoading && (isError || !dataRoom) ? <BrowserErrorState /> : null}

        {!isLoading && !isError && dataRoom ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between py-1">
              <p className="text-sm text-muted-foreground">
                {items.length ? `${items.length} items` : null}
              </p>
            </div>

            {items.length ? (
              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-[1fr_auto] border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                  <span>Name</span>
                  <span>Updated</span>
                </div>
                {items.map((item) => (
                  <div
                    className="grid grid-cols-[1fr_auto] items-center gap-4 border-b px-4 py-3 last:border-b-0"
                    key={`${item.type}-${item.id}`}
                  >
                    <span className="truncate text-sm font-medium">
                      {item.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyDataRoomState />
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
