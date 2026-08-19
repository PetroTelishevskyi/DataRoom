import { Database, FileText, Folder, RefreshCcw, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useSharedWithMe } from "../hooks/use-shared-with-me";
import type { SharedWithMeItem } from "../share.types";

function getResourceHref(resource: SharedWithMeItem["resource"]) {
  if (resource.type === "DATA_ROOM") {
    return `/data-rooms/${resource.id}`;
  }

  if (resource.type === "FOLDER") {
    return `/folders/${resource.id}`;
  }

  return `/files/${resource.id}`;
}

function getResourceState(resource: SharedWithMeItem["resource"]) {
  const sharedWithMeRoot = {
    breadcrumbRootHref: "/shared-with-me",
    breadcrumbRootLabel: "Shared with me",
  };

  if (resource.type === "DATA_ROOM") {
    return {
      ...sharedWithMeRoot,
      dataRoomName: resource.name,
    };
  }

  if (resource.type === "FOLDER") {
    return sharedWithMeRoot;
  }

  if (resource.type === "FILE") {
    return {
      fileName: resource.name,
    };
  }

  return undefined;
}

function formatSharedDate(createdAt: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(createdAt));
}

function SharedFolderCard({ share }: { share: SharedWithMeItem }) {
  const resource = share.resource;

  if (resource.type === "DATA_ROOM") {
    return (
      <Link
        className="group flex min-w-0 items-start justify-between gap-3 rounded-lg border bg-white p-4 shadow-sm transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        state={getResourceState(resource)}
        to={getResourceHref(resource)}
      >
        <span className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/30">
            <Database aria-hidden className="h-4 w-4 text-primary" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-medium text-primary underline-offset-4 group-hover:underline">
              {resource.name}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {formatSharedDate(share.createdAt)}
            </span>
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      className="group flex min-w-0 items-start justify-between gap-3 rounded-lg border bg-white p-4 shadow-sm transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      state={getResourceState(resource)}
      to={getResourceHref(resource)}
    >
      <span className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/30">
          <Folder aria-hidden className="h-4 w-4 text-primary" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-medium text-primary underline-offset-4 group-hover:underline">
            {resource.name}
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {formatSharedDate(share.createdAt)}
          </span>
        </span>
      </span>
    </Link>
  );
}

function SharedFilesTable({ shares }: { shares: SharedWithMeItem[] }) {
  return (
    <section className="min-h-0">
      <h2 className="mb-3 text-lg font-semibold tracking-tight">
        Files ({shares.length})
      </h2>
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[minmax(0,1fr)_8rem_8rem] border-b bg-muted/40 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
          <span>Name</span>
          <span className="text-right">Size</span>
          <span className="text-right">Shared</span>
        </div>
        {shares.map((share) => (
          <Link
            className="group grid grid-cols-[minmax(0,1fr)_8rem_8rem] items-center gap-4 border-b px-4 py-5 transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            key={share.id}
            state={getResourceState(share.resource)}
            to={getResourceHref(share.resource)}
          >
            <span className="flex min-w-0 items-center gap-3">
              <FileText aria-hidden className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-medium text-primary underline-offset-4 group-hover:underline">
                {share.resource.name}
              </span>
            </span>
            <span className="text-right text-sm text-muted-foreground">-</span>
            <span className="text-right text-sm text-muted-foreground">
              {formatSharedDate(share.createdAt)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SharedResourceSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8">
      <section>
        <div className="mb-3 h-6 w-28 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-[78px] rounded-lg border bg-white p-4" key={index}>
              <div className="h-5 w-2/3 rounded bg-muted" />
              <div className="mt-2 h-4 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="mb-3 h-6 w-20 rounded bg-muted" />
        <div className="overflow-hidden rounded-lg border">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="border-b px-4 py-5 last:border-b-0" key={index}>
              <div className="h-5 w-1/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SharedBrowserSections({ shares }: { shares: SharedWithMeItem[] }) {
  const folderShares = shares.filter((share) => share.resource.type !== "FILE");
  const fileShares = shares.filter((share) => share.resource.type === "FILE");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8">
      {folderShares.length ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">
            Folders ({folderShares.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {folderShares.map((share) => (
              <SharedFolderCard key={share.id} share={share} />
            ))}
          </div>
        </section>
      ) : null}

      {fileShares.length ? <SharedFilesTable shares={fileShares} /> : null}
    </div>
  );
}

function SharedResourceIcon() {
  return <Users aria-hidden />;
}

function SharedResourceEmptyState() {
  return (
    <Empty className="min-h-[320px] rounded-lg border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SharedResourceIcon />
        </EmptyMedia>
        <EmptyTitle>Nothing has been shared with you yet.</EmptyTitle>
        <EmptyDescription>
          Resources shared directly with your account will appear here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function SharedResourceErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Empty className="min-h-[320px] rounded-lg border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SharedResourceIcon />
        </EmptyMedia>
        <EmptyTitle>Shared resources are unavailable</EmptyTitle>
        <EmptyDescription>
          Try again or check whether your access has changed.
        </EmptyDescription>
        <Button className="mt-5" onClick={onRetry} type="button" variant="outline">
          <RefreshCcw aria-hidden className="h-4 w-4" />
          Retry
        </Button>
      </EmptyHeader>
    </Empty>
  );
}

export function SharedResourceTable() {
  const sharedWithMeQuery = useSharedWithMe();

  if (sharedWithMeQuery.isLoading) {
    return <SharedResourceSkeleton />;
  }

  if (sharedWithMeQuery.isError) {
    return (
      <SharedResourceErrorState onRetry={() => void sharedWithMeQuery.refetch()} />
    );
  }

  if (!sharedWithMeQuery.data?.length) {
    return <SharedResourceEmptyState />;
  }

  return <SharedBrowserSections shares={sharedWithMeQuery.data} />;
}
