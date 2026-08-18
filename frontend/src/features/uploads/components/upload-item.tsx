import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  RefreshCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UploadQueueItem, UploadStatus } from "../upload.types";
import { RenameUploadDialog } from "./rename-upload-dialog";

type UploadItemProps = {
  item: UploadQueueItem;
  onRemove: (id: string) => void;
  onRename: (id: string, fileName: string) => void;
  onRetry: (id: string) => void;
};

const statusLabels: Record<UploadStatus, string> = {
  failed: "Failed",
  finalizing: "Finalizing...",
  preparing: "Preparing...",
  queued: "Queued",
  success: "Complete",
  uploading: "Uploading",
};

function StatusIcon({ status }: { status: UploadStatus }) {
  if (status === "success") {
    return <CheckCircle2 aria-hidden className="h-4 w-4 text-emerald-600" />;
  }

  if (status === "failed") {
    return <AlertCircle aria-hidden className="h-4 w-4 text-destructive" />;
  }

  if (status === "queued") {
    return <Clock aria-hidden className="h-4 w-4 text-muted-foreground" />;
  }

  return (
    <Loader2
      aria-hidden
      className="h-4 w-4 animate-spin text-muted-foreground"
    />
  );
}

export function UploadItem({
  item,
  onRemove,
  onRename,
  onRetry,
}: UploadItemProps) {
  const canRename =
    item.status === "failed" && item.errorCode === "FILE_NAME_CONFLICT";
  const canRetry = item.status === "failed" && !canRename;
  const canRemove =
    item.status === "queued" ||
    item.status === "failed" ||
    item.status === "success";
  const progressValue =
    item.status === "success" ? 100 : Math.max(0, Math.min(item.progress, 100));

  return (
    <div className="border-t px-4 py-3">
      <div className="flex items-start gap-3">
        <StatusIcon status={item.status} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-none">
            {item.fileName}
          </p>
          <p
            className={cn(
              "mt-1.5 text-xs text-muted-foreground",
              item.status === "failed" && "text-destructive",
            )}
          >
            {statusLabels[item.status]}
            {item.status === "uploading" ? ` · ${Math.round(progressValue)}%` : null}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-all",
                item.status === "failed" && "bg-destructive",
                item.status === "success" && "bg-emerald-600",
              )}
              style={{ width: `${progressValue}%` }}
            />
          </div>
          {item.status === "failed" && item.errorMessage ? (
            <p className="mt-1.5 line-clamp-2 text-xs text-destructive">
              {item.errorMessage}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {canRename ? (
            <RenameUploadDialog
              currentName={item.fileName}
              onRenameUpload={(fileName) => onRename(item.id, fileName)}
            >
              <Button size="sm" type="button" variant="ghost">
                <Pencil aria-hidden className="h-4 w-4" />
                Rename
              </Button>
            </RenameUploadDialog>
          ) : null}
          {canRetry ? (
            <Button
              onClick={() => onRetry(item.id)}
              size="sm"
              type="button"
              variant="ghost"
            >
              <RefreshCcw aria-hidden className="h-4 w-4" />
              Retry
            </Button>
          ) : null}
          {canRemove ? (
            <Button
              aria-label="Remove upload"
              onClick={() => onRemove(item.id)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X aria-hidden className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
