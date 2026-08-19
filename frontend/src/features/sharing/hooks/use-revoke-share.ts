import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revokeShare } from "../api/shares-api";
import { shareQueryKeys } from "../share-queries";
import type { ShareResource } from "../share.types";

type RevokeShareInput = {
  resource: ShareResource;
  shareId: string;
};

export function useRevokeShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RevokeShareInput) => revokeShare(input.shareId),
    onSuccess: async (_share, input) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: shareQueryKeys.resourceShares(input.resource),
        }),
        queryClient.invalidateQueries({
          queryKey: shareQueryKeys.sharedWithMe,
        }),
      ]);
    },
  });
}
