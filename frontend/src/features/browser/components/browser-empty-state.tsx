import { FileText, FolderPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CreateFolderDialog } from "@/features/folders/components/create-folder-dialog";
import type { BrowserCapabilities } from "../browser.types";

type BrowserEmptyStateProps = {
  capabilities: BrowserCapabilities;
  onCreateFolder?: (name: string) => Promise<void>;
};

export function BrowserEmptyState({
  capabilities,
  onCreateFolder,
}: BrowserEmptyStateProps) {
  const createFolderButton = (
    <Button disabled={!capabilities.canCreateFolder} type="button">
      <FolderPlus aria-hidden className="h-4 w-4" />
      Create Folder
    </Button>
  );

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
        {onCreateFolder ? (
          <CreateFolderDialog
            disabled={!capabilities.canCreateFolder}
            onCreateFolder={onCreateFolder}
          >
            {createFolderButton}
          </CreateFolderDialog>
        ) : (
          createFolderButton
        )}
        <Button disabled={!capabilities.canUpload} type="button" variant="outline">
          <Upload aria-hidden className="h-4 w-4" />
          Import File
        </Button>
      </EmptyContent>
    </Empty>
  );
}
