import { useQuery } from "@tanstack/react-query";
import { publicShareQueryOptions } from "../share-queries";

export function usePublicShare(token: string) {
  return useQuery(publicShareQueryOptions(token));
}
