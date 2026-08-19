import { User } from "lucide-react";
import type { ShareSummary } from "../share.types";

type UserShareRowProps = {
  share: ShareSummary;
};

export function UserShareRow({ share }: UserShareRowProps) {
  const displayName = share.recipient.name?.trim() || share.recipient.email;

  return (
    <div className="flex min-h-12 items-center justify-between gap-3 rounded-md border px-3 py-2">
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
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        Viewer
      </span>
    </div>
  );
}
