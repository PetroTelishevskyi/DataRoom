import { useQuery } from "@tanstack/react-query";
import { resourceSharesQueryOptions } from "../share-queries";
import type { ShareResource } from "../share.types";

export function useResourceShares(resource: ShareResource) {
  return useQuery(resourceSharesQueryOptions(resource));
}
