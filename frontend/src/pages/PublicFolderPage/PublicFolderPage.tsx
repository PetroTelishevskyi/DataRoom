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
import { usePublicFolder } from "@/features/sharing/hooks/use-public-folder";

import type { PublicShareContents } from "@/features/sharing/share.types";

function getPublicFolderTitle(publicFolder: PublicShareContents) {
  if (publicFolder.resource.type === "DATA_ROOM") {
    return publicFolder.resource.name;
  }

  return publicFolder.breadcrumbs[0]?.name ?? publicFolder.folder?.name ?? "Shared folder";
}

function getPublicFolderBreadcrumbs(publicFolder: PublicShareContents) {
  if (publicFolder.resource.type !== "FOLDER") {
    return publicFolder.breadcrumbs;
  }

  return publicFolder.breadcrumbs.slice(1);
}

export function PublicFolderPage() {
  const { folderId = "", token = "" } = useParams();
  const publicFolderQuery = usePublicFolder(token, folderId);

  if (publicFolderQuery.isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center text-sm text-muted-foreground">
        Loading shared folder...
      </div>
    );
  }

  if (publicFolderQuery.isError || !publicFolderQuery.data) {
    return (
      <Empty className="min-h-[calc(100vh-3.5rem)]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText aria-hidden />
          </EmptyMedia>
          <EmptyTitle>This shared folder is unavailable</EmptyTitle>
          <EmptyDescription>
            It may have been deleted, disabled, or moved outside this share.
          </EmptyDescription>
          <Button
            className="mt-5"
            onClick={() => void publicFolderQuery.refetch()}
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

  return (
    <ResourceBrowser
      accessRole="VIEWER"
      breadcrumbs={getPublicFolderBreadcrumbs(publicFolderQuery.data)}
      capabilities={getBrowserCapabilities("VIEWER")}
      getBreadcrumbHref={(breadcrumb) =>
        `/share/${token}/folders/${breadcrumb.id}`
      }
      getFileHref={(file) => `/share/${token}/files/${file.id}`}
      getFileState={(file) => ({ fileName: file.name })}
      getFolderHref={(folder) => `/share/${token}/folders/${folder.id}`}
      hasResource
      isError={false}
      isLoading={false}
      items={publicFolderQuery.data.items}
      rootHref={`/share/${token}`}
      title={getPublicFolderTitle(publicFolderQuery.data)}
    />
  );
}
