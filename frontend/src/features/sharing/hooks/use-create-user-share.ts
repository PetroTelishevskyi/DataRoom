import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserShare } from "../api/shares-api";
import { shareQueryKeys } from "../share-queries";
import type { CreateUserShareInput } from "../share.types";

export function useCreateUserShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserShareInput) => createUserShare(input),
    onSuccess: async (_share, input) => {
      await queryClient.invalidateQueries({
        queryKey: shareQueryKeys.resourceShares(input.resource),
      });
    },
  });
}
