import { Upload } from "lucide-react";
import type { DragEvent, ReactNode } from "react";
import { useState } from "react";

type UploadDropZoneProps = {
  children: ReactNode;
  disabled?: boolean;
  onDropFiles?: (files: File[]) => void;
};

function hasDraggedFiles(event: DragEvent<HTMLElement>) {
  return Array.from(event.dataTransfer.types).includes("Files");
}

function isPdfDrag(event: DragEvent<HTMLElement>) {
  const fileItems = Array.from(event.dataTransfer.items).filter(
    (item) => item.kind === "file",
  );

  if (fileItems.length === 0) {
    return true;
  }

  return fileItems.every(
    (item) => item.type === "" || item.type === "application/pdf",
  );
}

export function UploadDropZone({
  children,
  disabled = false,
  onDropFiles,
}: UploadDropZoneProps) {
  const [dragDepth, setDragDepth] = useState(0);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const canDrop = !disabled && Boolean(onDropFiles);
  const isActive = canDrop && dragDepth > 0 && isDraggingPdf;

  function resetDragState() {
    setDragDepth(0);
    setIsDraggingPdf(false);
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!canDrop || !hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    setDragDepth((currentDepth) => currentDepth + 1);
    setIsDraggingPdf(isPdfDrag(event));
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (!canDrop || !hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    const acceptsDrop = isPdfDrag(event);
    event.dataTransfer.dropEffect = acceptsDrop ? "copy" : "none";
    setIsDraggingPdf(acceptsDrop);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!canDrop || !hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    setDragDepth((currentDepth) => Math.max(currentDepth - 1, 0));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    if (!canDrop || !hasDraggedFiles(event)) {
      resetDragState();
      return;
    }

    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    resetDragState();

    if (files.length > 0 && onDropFiles) {
      onDropFiles(files);
    }
  }

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {isActive ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg border-2 border-dashed bg-background/95">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background shadow-sm">
              <Upload aria-hidden className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Drop PDF files here</p>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF only - Up to 100 MB each
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
