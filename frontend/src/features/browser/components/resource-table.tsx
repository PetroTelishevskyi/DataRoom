import type {
  FolderResourceItem,
  ResourceItem,
} from "@/features/data-rooms/data-room.types";
import { FileRow } from "./file-row";
import { FolderRow } from "./folder-row";
import { ResourceTableHeader } from "./resource-table-header";

type ResourceTableProps = {
  getFolderHref: (folder: FolderResourceItem) => string;
  items: ResourceItem[];
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

export function ResourceTable({ getFolderHref, items }: ResourceTableProps) {
  const sortedItems = sortResourceItems(items);

  return (
    <div className="overflow-hidden rounded-lg border">
      <ResourceTableHeader />
      {sortedItems.map((item) =>
        item.type === "FOLDER" ? (
          <FolderRow
            folder={item}
            href={getFolderHref(item)}
            key={`${item.type}-${item.id}`}
          />
        ) : (
          <FileRow file={item} key={`${item.type}-${item.id}`} />
        ),
      )}
    </div>
  );
}
