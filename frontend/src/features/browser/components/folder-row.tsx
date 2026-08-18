import { useState } from "react";
import { Folder } from "lucide-react";
import { Link } from "react-router-dom";
import type { FolderResourceItem } from "@/features/data-rooms/data-room.types";
import { DeleteFolderDialog } from "@/features/folders/components/delete-folder-dialog";
import { RenameFolderDialog } from "@/features/folders/components/rename-folder-dialog";
import { ResourceActionsMenu } from "./resource-actions-menu";

type FolderRowProps = {
  canDelete: boolean;
  canRename: boolean;
  folder: FolderResourceItem;
  href: string;
  onDeleteFolder?: (folder: FolderResourceItem) => Promise<void>;
  onRenameFolder?: (folder: FolderResourceItem, name: string) => Promise<void>;
};

export function FolderRow({
  canDelete,
  canRename,
  folder,
  href,
  onDeleteFolder,
  onRenameFolder,
}: FolderRowProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_7rem_8rem_2.5rem] items-center gap-4 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40">
      <Link
        className="flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        to={href}
      >
        <Folder aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm font-medium">{folder.name}</span>
      </Link>
      <span className="text-sm text-muted-foreground">-</span>
      <span className="text-right text-sm text-muted-foreground">
        {new Date(folder.updatedAt).toLocaleDateString()}
      </span>
      <div className="flex justify-end">
        <ResourceActionsMenu
          onDelete={
            canDelete && onDeleteFolder
              ? () => setIsDeleteOpen(true)
              : undefined
          }
          onRename={
            canRename && onRenameFolder
              ? () => setIsRenameOpen(true)
              : undefined
          }
        />
        {canRename && onRenameFolder ? (
          <RenameFolderDialog
            currentName={folder.name}
            onOpenChange={setIsRenameOpen}
            onRenameFolder={(name) => onRenameFolder(folder, name)}
            open={isRenameOpen}
          />
        ) : null}
        {canDelete && onDeleteFolder ? (
          <DeleteFolderDialog
            folderId={folder.id}
            folderName={folder.name}
            onDeleteFolder={() => onDeleteFolder(folder)}
            onOpenChange={setIsDeleteOpen}
            open={isDeleteOpen}
          />
        ) : null}
      </div>
    </div>
  );
}
