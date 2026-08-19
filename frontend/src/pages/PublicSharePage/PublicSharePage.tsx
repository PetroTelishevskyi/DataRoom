import { FileText, RefreshCcw } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getBrowserCapabilities } from "@/features/browser/browser-capabilities";
import { ResourceBrowser } from "@/features/browser/components/resource-browser";
import { usePublicFileViewUrl } from "@/features/sharing/hooks/use-public-file-view-url";
import { usePublicShare } from "@/features/sharing/hooks/use-public-share";
import type {
  PublicFileShare,
  PublicShareContents,
  PublicShareData,
} from "@/features/sharing/share.types";

function isPublicShareContents(
  publicShare: PublicShareData,
): publicShare is PublicShareContents {
  return "items" in publicShare;
}

function getPublicBrowserTitle(publicShare: PublicShareContents) {
  if (publicShare.resource.type === "DATA_ROOM") {
    return publicShare.resource.name;
  }

  return publicShare.breadcrumbs[0]?.name ?? publicShare.folder?.name ?? "Shared folder";
}

function getPublicBrowserBreadcrumbs(publicShare: PublicShareContents) {
  if (publicShare.resource.type !== "FOLDER") {
    return publicShare.breadcrumbs;
  }

  return publicShare.breadcrumbs.slice(1);
}

function PublicUnavailableState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <Empty className="min-h-[calc(100vh-3.5rem)]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText aria-hidden />
        </EmptyMedia>
        <EmptyTitle>This shared link is unavailable</EmptyTitle>
        <EmptyDescription>
          It may have been deleted, disabled, or moved outside this share.
        </EmptyDescription>
        <Button className="mt-5" onClick={onRetry} type="button" variant="outline">
          <RefreshCcw aria-hidden className="h-4 w-4" />
          Retry
        </Button>
      </EmptyHeader>
    </Empty>
  );
}

function PublicFileViewer({
  publicShare,
  token,
}: {
  publicShare: PublicFileShare;
  token: string;
}) {
  const viewUrlQuery = usePublicFileViewUrl(token, publicShare.resource.id);

  return (
    <section className="flex h-full min-h-0 flex-col px-6 py-6">
      <div className="mb-4 flex min-w-0 shrink-0 items-center gap-3">
        <FileText aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
        <h1 className="truncate text-lg font-semibold tracking-tight">
          {publicShare.resource.name}
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-muted/30">
        {viewUrlQuery.isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading PDF...
          </div>
        ) : null}

        {viewUrlQuery.isError ? (
          <PublicUnavailableState onRetry={() => void viewUrlQuery.refetch()} />
        ) : null}

        {viewUrlQuery.data ? (
          <iframe
            className="h-full w-full"
            src={viewUrlQuery.data.url}
            title={publicShare.resource.name}
          />
        ) : null}
      </div>
    </section>
  );
}

function PublicBrowser({
  publicShare,
  token,
}: {
  publicShare: PublicShareContents;
  token: string;
}) {
  const linkRoot = `/shared-link/${token}`;

  return (
    <ResourceBrowser
      accessRole="VIEWER"
      breadcrumbs={getPublicBrowserBreadcrumbs(publicShare)}
      capabilities={getBrowserCapabilities("VIEWER")}
      getBreadcrumbHref={(breadcrumb) =>
        `${linkRoot}/folders/${breadcrumb.id}`
      }
      getFileHref={(file) => `${linkRoot}/files/${file.id}`}
      getFileState={(file) => ({ fileName: file.name })}
      getFolderHref={(folder) => `${linkRoot}/folders/${folder.id}`}
      hasResource
      isError={false}
      isLoading={false}
      items={publicShare.items}
      rootHref={linkRoot}
      title={getPublicBrowserTitle(publicShare)}
    />
  );
}

export function PublicSharePage() {
  const { token = "" } = useParams();
  const publicShareQuery = usePublicShare(token);

  if (publicShareQuery.isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center text-sm text-muted-foreground">
        Loading shared item...
      </div>
    );
  }

  if (publicShareQuery.isError || !publicShareQuery.data) {
    return (
      <PublicUnavailableState onRetry={() => void publicShareQuery.refetch()} />
    );
  }

  if (isPublicShareContents(publicShareQuery.data)) {
    return <PublicBrowser publicShare={publicShareQuery.data} token={token} />;
  }

  return <PublicFileViewer publicShare={publicShareQuery.data} token={token} />;
}
