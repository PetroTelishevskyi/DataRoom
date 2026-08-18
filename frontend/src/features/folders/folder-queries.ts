import { queryOptions } from "@tanstack/react-query";
import { getFolderContents } from "./folder-api";

export const folderQueryKeys = {
  folderContents: (folderId: string) => ["folder", folderId, "contents"] as const,
};

export function folderContentsQueryOptions(folderId: string) {
  return queryOptions({
    queryKey: folderQueryKeys.folderContents(folderId),
    queryFn: () => getFolderContents(folderId),
  });
}
