import { Loader2, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast/use-toast";
import { useRevokeShare } from "../hooks/use-revoke-share";
import type { ShareResource, ShareSummary } from "../share.types";

type UserShareRowProps = {
  resource: ShareResource;
  share: ShareSummary;
};

export function UserShareRow({ resource, share }: UserShareRowProps) {
  const [error, setError] = useState<string | null>(null);
  const revokeShareMutation = useRevokeShare();
  const displayName = share.recipient.name?.trim() || share.recipient.email;

  async function handleRevokeShare() {
    setError(null);

    try {
      await revokeShareMutation.mutateAsync({
        resource,
        shareId: share.id,
      });
      toast({
        title: "Access revoked",
        variant: "success",
      });
    } catch {
      setError("Unable to remove access.");
    }
  }

  return (
    <div className="grid gap-2 rounded-md border px-3 py-2">
      <div className="flex min-h-9 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
            <User aria-hidden className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {share.recipient.email}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Viewer
          </span>
          <Button
            className="h-8 px-2 text-destructive hover:text-destructive"
            disabled={revokeShareMutation.isPending}
            onClick={() => void handleRevokeShare()}
            type="button"
            variant="ghost"
          >
            {revokeShareMutation.isPending ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : null}
            Remove
          </Button>
        </div>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
