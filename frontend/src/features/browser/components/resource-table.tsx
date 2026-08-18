import type {
  FolderResourceItem,
  ResourceItem,
} from "@/features/data-rooms/data-room.types";
import { FileRow } from "./file-row";
import { FolderRow } from "./folder-row";
import { ResourceTableHeader } from "./resource-table-header";

type ResourceTableProps = {
  canDeleteFolder: boolean;
  canRenameFolder: boolean;
  getFolderHref: (folder: FolderResourceItem) => string;
  items: ResourceItem[];
  onDeleteFolder?: (folder: FolderResourceItem) => Promise<void>;
  onRenameFolder?: (folder: FolderResourceItem, name: string) => Promise<void>;
};

function sortResourceItems(items: ResourceItem[]) {
  return [...items].sort((firstItem, secondItem) => {
    if (firstItem.type !== secondItem.type) {
      return firstItem.type === "FOLDER" ? -1 : 1;
    }

    return firstItem.name.localeCompare(secondItem.name, undefined, {
      sensitivity: "base",
    });
  });
}

export function ResourceTable({
  canDeleteFolder,
  canRenameFolder,
  getFolderHref,
  items,
  onDeleteFolder,
  onRenameFolder,
}: ResourceTableProps) {
  const sortedItems = sortResourceItems(items);

  return (
    <div className="overflow-hidden rounded-lg border">
      <ResourceTableHeader />
      {sortedItems.map((item) =>
        item.type === "FOLDER" ? (
          <FolderRow
            canDelete={canDeleteFolder}
            canRename={canRenameFolder}
            folder={item}
            href={getFolderHref(item)}
            key={`${item.type}-${item.id}`}
            onDeleteFolder={onDeleteFolder}
            onRenameFolder={onRenameFolder}
          />
        ) : (
          <FileRow file={item} key={`${item.type}-${item.id}`} />
        ),
      )}
    </div>
  );
}
