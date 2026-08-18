import { queryOptions } from "@tanstack/react-query";
import { getFolderContents, getFolderDeletionPreview } from "./folder-api";

export const folderQueryKeys = {
  folderContents: (folderId: string) => ["folder", folderId, "contents"] as const,
  folderDeletionPreview: (folderId: string) =>
    ["folder", folderId, "deletion-preview"] as const,
};

export function folderContentsQueryOptions(folderId: string) {
  return queryOptions({
    queryKey: folderQueryKeys.folderContents(folderId),
    queryFn: () => getFolderContents(folderId),
  });
}

export function folderDeletionPreviewQueryOptions(folderId: string) {
  return queryOptions({
    queryKey: folderQueryKeys.folderDeletionPreview(folderId),
    queryFn: () => getFolderDeletionPreview(folderId),
  });
}
