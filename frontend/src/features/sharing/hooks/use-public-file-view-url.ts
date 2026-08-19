import { useQuery } from "@tanstack/react-query";
import { publicFileViewUrlQueryOptions } from "../share-queries";

export function usePublicFileViewUrl(token: string, fileId: string) {
  return useQuery(publicFileViewUrlQueryOptions(token, fileId));
}
