import { useQuery } from "@tanstack/react-query";
import { sharedWithMeQueryOptions } from "../share-queries";

export function useSharedWithMe() {
  return useQuery(sharedWithMeQueryOptions());
}
