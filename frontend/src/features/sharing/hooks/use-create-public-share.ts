import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPublicShare } from "../api/shares-api";
import { shareQueryKeys } from "../share-queries";
import type { CreatePublicShareInput } from "../share.types";

export function useCreatePublicShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePublicShareInput) => createPublicShare(input),
    onSuccess: async (_share, input) => {
      await queryClient.invalidateQueries({
        queryKey: shareQueryKeys.resourceShares(input.resource),
      });
    },
  });
}
