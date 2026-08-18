import { queryOptions } from "@tanstack/react-query";
import {
  getFolderContents,
  getFolderDeletionPreview,
  getFolderTree,
} from "./folder-api";

export const folderQueryKeys = {
  folderContents: (folderId: string) => ["folder", folderId, "contents"] as const,
  folderDeletionPreview: (folderId: string) =>
    ["folder", folderId, "deletion-preview"] as const,
  folderTree: (dataRoomId: string) =>
    ["dataRoom", dataRoomId, "folder-tree"] as const,
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

export function folderTreeQueryOptions(dataRoomId: string) {
  return queryOptions({
    enabled: Boolean(dataRoomId),
    queryKey: folderQueryKeys.folderTree(dataRoomId),
    queryFn: () => getFolderTree(dataRoomId),
  });
}
