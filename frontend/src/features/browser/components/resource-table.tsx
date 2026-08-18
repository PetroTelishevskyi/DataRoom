import type {
  FolderResourceItem,
  ResourceItem,
} from "@/features/data-rooms/data-room.types";
import { FileRow } from "./file-row";
import { FolderRow } from "./folder-row";
import { ResourceTableHeader } from "./resource-table-header";

type ResourceTableProps = {
  canRenameFolder: boolean;
  getFolderHref: (folder: FolderResourceItem) => string;
  items: ResourceItem[];
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
  canRenameFolder,
  getFolderHref,
  items,
  onRenameFolder,
}: ResourceTableProps) {
  const sortedItems = sortResourceItems(items);

  return (
    <div className="overflow-hidden rounded-lg border">
      <ResourceTableHeader />
      {sortedItems.map((item) =>
        item.type === "FOLDER" ? (
          <FolderRow
            canRename={canRenameFolder}
            folder={item}
            href={getFolderHref(item)}
            key={`${item.type}-${item.id}`}
            onRenameFolder={onRenameFolder}
          />
        ) : (
          <FileRow file={item} key={`${item.type}-${item.id}`} />
        ),
      )}
    </div>
  );
}
