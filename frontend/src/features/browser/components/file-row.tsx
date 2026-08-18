import { FileText } from "lucide-react";
import type { FileResourceItem } from "@/features/data-rooms/data-room.types";

type FileRowProps = {
  file: FileResourceItem;
};

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = sizeBytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function FileRow({ file }: FileRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_7rem_8rem_2.5rem] items-center gap-4 border-b px-4 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <FileText
          aria-hidden
          className="h-4 w-4 shrink-0 text-muted-foreground"
        />
        <span className="truncate text-sm font-medium">{file.name}</span>
      </div>
      <span className="text-sm text-muted-foreground">
        {formatFileSize(file.sizeBytes)}
      </span>
      <span className="text-right text-sm text-muted-foreground">
        {new Date(file.updatedAt).toLocaleDateString()}
      </span>
      <span aria-hidden />
    </div>
  );
}
