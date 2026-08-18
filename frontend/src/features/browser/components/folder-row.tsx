import { Folder } from "lucide-react";
import { Link } from "react-router-dom";
import type { FolderResourceItem } from "@/features/data-rooms/data-room.types";

type FolderRowProps = {
  folder: FolderResourceItem;
  href: string;
};

export function FolderRow({ folder, href }: FolderRowProps) {
  return (
    <Link
      className="grid grid-cols-[minmax(0,1fr)_7rem_8rem] items-center gap-4 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      to={href}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Folder aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm font-medium">{folder.name}</span>
      </div>
      <span className="text-sm text-muted-foreground">-</span>
      <span className="text-right text-sm text-muted-foreground">
        {new Date(folder.updatedAt).toLocaleDateString()}
      </span>
    </Link>
  );
}
