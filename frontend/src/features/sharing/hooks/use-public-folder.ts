import { useQuery } from "@tanstack/react-query";
import { publicFolderQueryOptions } from "../share-queries";

export function usePublicFolder(token: string, folderId: string) {
  return useQuery(publicFolderQueryOptions(token, folderId));
}
