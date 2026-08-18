import { queryOptions } from "@tanstack/react-query";
import { requestFileViewUrl } from "./files-api";

export const fileQueryKeys = {
  viewUrl: (fileId: string) => ["file", fileId, "viewUrl"] as const,
};

export function fileViewUrlQueryOptions(fileId: string) {
  return queryOptions({
    enabled: Boolean(fileId),
    queryKey: fileQueryKeys.viewUrl(fileId),
    queryFn: () => requestFileViewUrl(fileId),
    refetchInterval: 4 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
