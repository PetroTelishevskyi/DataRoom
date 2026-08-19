import { Check, Copy, Loader2, Link2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast/use-toast";
import { useCreatePublicShare } from "../hooks/use-create-public-share";
import { useResourceShares } from "../hooks/use-resource-shares";
import type { ShareResource } from "../share.types";

type PublicLinkSectionProps = {
  resource: ShareResource;
};

export function PublicLinkSection({ resource }: PublicLinkSectionProps) {
  const [copyError, setCopyError] = useState<string | null>(null);
  const [didCopy, setDidCopy] = useState(false);
  const sharesQuery = useResourceShares(resource);
  const createPublicShareMutation = useCreatePublicShare();
  const publicLinkShare = sharesQuery.data?.find(
    (share) => share.type === "PUBLIC_LINK",
  );
  const publicUrl = useMemo(() => {
    if (!publicLinkShare) {
      return "";
    }

    return `${window.location.origin}/share/${publicLinkShare.publicToken}`;
  }, [publicLinkShare]);

  async function handleEnablePublicLink() {
    setCopyError(null);
    await createPublicShareMutation.mutateAsync({
      resource,
      type: "PUBLIC_LINK",
    });
    toast({
      title: "Shared link created",
      variant: "success",
    });
  }

  async function handleCopyPublicLink() {
    if (!publicUrl) {
      return;
    }

    setCopyError(null);
    setDidCopy(false);

    try {
      await navigator.clipboard.writeText(publicUrl);
      setDidCopy(true);
      toast({
        title: "Link copied",
        variant: "success",
      });
    } catch {
      setCopyError("Unable to copy link.");
    }
  }

  if (sharesQuery.isLoading) {
    return (
      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">Link access</h3>
        <div className="h-10 rounded-md border bg-muted/40" />
      </section>
    );
  }

  if (!publicLinkShare) {
    return (
      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">Link access</h3>
        <p className="text-sm text-muted-foreground">
          Create a link that lets any signed-in user view this item.
        </p>
        <div>
          <Button
            disabled={createPublicShareMutation.isPending}
            onClick={() => void handleEnablePublicLink()}
            type="button"
            variant="outline"
          >
            {createPublicShareMutation.isPending ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Link2 aria-hidden className="h-4 w-4" />
            )}
            Create shared link
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-3">
      <h3 className="text-sm font-semibold">Link access</h3>
      <p className="text-sm text-muted-foreground">
        Anyone signed in with this link can view.
      </p>
      <div className="flex gap-2">
        <Input readOnly value={publicUrl} />
        <Button onClick={() => void handleCopyPublicLink()} type="button">
          {didCopy ? (
            <Check aria-hidden className="h-4 w-4" />
          ) : (
            <Copy aria-hidden className="h-4 w-4" />
          )}
          Copy
        </Button>
      </div>
      {copyError ? <p className="text-xs text-destructive">{copyError}</p> : null}
    </section>
  );
}
