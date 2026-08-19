import { queryOptions } from "@tanstack/react-query";
import {
  getPublicFolder,
  getPublicShare,
  requestPublicFileViewUrl,
} from "./api/public-shares-api";
import { getResourceShares, getSharedWithMe } from "./api/shares-api";
import type { ShareResource } from "./share.types";

export const shareQueryKeys = {
  publicFileViewUrl: (token: string, fileId: string) =>
    ["publicShare", token, "file", fileId, "viewUrl"] as const,
  publicFolder: (token: string, folderId: string) =>
    ["publicShare", token, "folder", folderId] as const,
  publicShare: (token: string) => ["publicShare", token] as const,
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

export function publicShareQueryOptions(token: string) {
  return queryOptions({
    enabled: Boolean(token),
    queryKey: shareQueryKeys.publicShare(token),
    queryFn: () => getPublicShare(token),
  });
}

export function publicFolderQueryOptions(token: string, folderId: string) {
  return queryOptions({
    enabled: Boolean(token && folderId),
    queryKey: shareQueryKeys.publicFolder(token, folderId),
    queryFn: () => getPublicFolder(token, folderId),
  });
}

export function publicFileViewUrlQueryOptions(token: string, fileId: string) {
  return queryOptions({
    enabled: Boolean(token && fileId),
    queryKey: shareQueryKeys.publicFileViewUrl(token, fileId),
    queryFn: () => requestPublicFileViewUrl(token, fileId),
    refetchInterval: 4 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
