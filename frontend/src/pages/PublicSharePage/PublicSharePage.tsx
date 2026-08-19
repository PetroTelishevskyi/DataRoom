import { ArrowLeft, FileText, RefreshCcw } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { usePublicFolder } from "@/features/sharing/hooks/use-public-folder";
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
  fileName = "PDF file",
  fileId,
  publicShare,
  token,
}: {
  fileName?: string;
  fileId?: string;
  publicShare?: PublicFileShare;
  token: string;
}) {
  const navigate = useNavigate();
  const resolvedFileId = fileId ?? publicShare?.resource.id ?? "";
  const resolvedFileName = publicShare?.resource.name ?? fileName;
  const viewUrlQuery = usePublicFileViewUrl(token, resolvedFileId);

  return (
    <section className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
        <Button
          className="shrink-0 px-0 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
          type="button"
          variant="link"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Back
        </Button>
        <div className="flex min-w-0 items-center gap-3 border-l pl-4">
          <FileText
            aria-hidden
            className="h-4 w-4 shrink-0 text-muted-foreground"
          />
          <h1 className="truncate text-sm font-medium text-foreground">
            {resolvedFileName}
          </h1>
        </div>
      </header>

      <div className="h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden bg-muted/30">
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
            title={resolvedFileName}
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
  const linkRoot = `/?shareToken=${encodeURIComponent(token)}`;
  const getFolderLink = (folderId: string) =>
    `${linkRoot}&folderId=${encodeURIComponent(folderId)}`;
  const getFileLink = (fileId: string) =>
    `${linkRoot}&fileId=${encodeURIComponent(fileId)}`;

  return (
    <ResourceBrowser
      accessRole="VIEWER"
      breadcrumbs={getPublicBrowserBreadcrumbs(publicShare)}
      capabilities={getBrowserCapabilities("VIEWER")}
      getBreadcrumbHref={(breadcrumb) => getFolderLink(breadcrumb.id)}
      getFileHref={(file) => getFileLink(file.id)}
      getFileState={(file) => ({ fileName: file.name })}
      getFolderHref={(folder) => getFolderLink(folder.id)}
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
  const { token: pathToken = "" } = useParams();
  const [searchParams] = useSearchParams();
  const token =
    pathToken ||
    searchParams.get("shareToken") ||
    searchParams.get("token") ||
    "";
  const folderId = searchParams.get("folderId") || "";
  const fileId = searchParams.get("fileId") || "";
  const publicShareQuery = usePublicShare(folderId || fileId ? "" : token);
  const publicFolderQuery = usePublicFolder(token, folderId);
  const publicFileViewUrlQuery = usePublicFileViewUrl(token, fileId);

  if (fileId) {
    if (publicFileViewUrlQuery.isLoading) {
      return (
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center text-sm text-muted-foreground">
          Loading shared file...
        </div>
      );
    }

    if (publicFileViewUrlQuery.isError || !publicFileViewUrlQuery.data) {
      return (
        <PublicUnavailableState
          onRetry={() => void publicFileViewUrlQuery.refetch()}
        />
      );
    }

    return <PublicFileViewer fileId={fileId} token={token} />;
  }

  if (folderId) {
    if (publicFolderQuery.isLoading) {
      return (
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center text-sm text-muted-foreground">
          Loading shared folder...
        </div>
      );
    }

    if (publicFolderQuery.isError || !publicFolderQuery.data) {
      return (
        <PublicUnavailableState
          onRetry={() => void publicFolderQuery.refetch()}
        />
      );
    }

    return (
      <PublicBrowser publicShare={publicFolderQuery.data} token={token} />
    );
  }

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
