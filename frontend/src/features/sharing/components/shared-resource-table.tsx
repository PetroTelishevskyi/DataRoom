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

function getResourceTypeLabel(resource: SharedWithMeItem["resource"]) {
  if (resource.type === "DATA_ROOM") {
    return "Data Room";
  }

  if (resource.type === "FOLDER") {
    return "Folder";
  }

  return "PDF";
}

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
  if (resource.type === "DATA_ROOM") {
    return {
      dataRoomName: resource.name,
    };
  }

  if (resource.type === "FILE") {
    return {
      fileName: resource.name,
    };
  }

  return undefined;
}

function ResourceIcon({ resource }: { resource: SharedWithMeItem["resource"] }) {
  if (resource.type === "DATA_ROOM") {
    return <Database aria-hidden className="h-4 w-4 text-muted-foreground" />;
  }

  if (resource.type === "FOLDER") {
    return <Folder aria-hidden className="h-4 w-4 text-muted-foreground" />;
  }

  return <FileText aria-hidden className="h-4 w-4 text-muted-foreground" />;
}

export function SharedResourceTable() {
  const sharedWithMeQuery = useSharedWithMe();

  if (sharedWithMeQuery.isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[minmax(0,1fr)_8rem_12rem] border-b bg-muted/40 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
          <span>Name</span>
          <span>Type</span>
          <span>Shared by</span>
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_8rem_12rem] gap-4 border-b px-4 py-4 last:border-b-0"
            key={index}
          >
            <div className="h-5 rounded bg-muted" />
            <div className="h-5 rounded bg-muted" />
            <div className="h-5 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (sharedWithMeQuery.isError) {
    return (
      <Empty className="min-h-[320px] rounded-lg border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Shared resources are unavailable</EmptyTitle>
          <EmptyDescription>
            Try again or check whether your access has changed.
          </EmptyDescription>
          <Button
            className="mt-5"
            onClick={() => void sharedWithMeQuery.refetch()}
            type="button"
            variant="outline"
          >
            <RefreshCcw aria-hidden className="h-4 w-4" />
            Retry
          </Button>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!sharedWithMeQuery.data?.length) {
    return (
      <Empty className="min-h-[320px] rounded-lg border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Nothing has been shared with you yet.</EmptyTitle>
          <EmptyDescription>
            Resources shared directly with your account will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-[minmax(0,1fr)_8rem_12rem] border-b bg-muted/40 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
        <span>Name</span>
        <span>Type</span>
        <span>Shared by</span>
      </div>
      {sharedWithMeQuery.data.map((share) => (
        <Link
          className="grid grid-cols-[minmax(0,1fr)_8rem_12rem] items-center gap-4 border-b px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          key={share.id}
          state={getResourceState(share.resource)}
          to={getResourceHref(share.resource)}
        >
          <span className="flex min-w-0 items-center gap-3">
            <ResourceIcon resource={share.resource} />
            <span className="truncate text-sm font-medium">
              {share.resource.name}
            </span>
          </span>
          <span className="text-sm text-muted-foreground">
            {getResourceTypeLabel(share.resource)}
          </span>
          <span className="truncate text-sm text-muted-foreground">
            {share.sharedBy.name?.trim() || share.sharedBy.email}
          </span>
        </Link>
      ))}
    </div>
  );
}
