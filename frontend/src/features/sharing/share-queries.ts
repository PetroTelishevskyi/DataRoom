import { queryOptions } from "@tanstack/react-query";
import { getResourceShares, getSharedWithMe } from "./api/shares-api";
import type { ShareResource } from "./share.types";

export const shareQueryKeys = {
  resourceShares: (resource: ShareResource) =>
    ["shares", resource.type, resource.id] as const,
  sharedWithMe: ["sharedWithMe"] as const,
};

export function resourceSharesQueryOptions(resource: ShareResource) {
  return queryOptions({
    enabled: Boolean(resource.id),
    queryKey: shareQueryKeys.resourceShares(resource),
    queryFn: () => getResourceShares(resource),
  });
}

export function sharedWithMeQueryOptions() {
  return queryOptions({
    queryKey: shareQueryKeys.sharedWithMe,
    queryFn: getSharedWithMe,
  });
}
