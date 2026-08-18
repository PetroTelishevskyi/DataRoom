import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MoveFileDestination } from "@/features/files/files-api";
import { FolderPicker } from "@/features/folders/components/folder-picker";
import { folderTreeQueryOptions } from "@/features/folders/folder-queries";
import { ApiError } from "@/lib/api";

type MoveFileDialogProps = {
  dataRoomId: string;
  fileName: string;
  onMoveFile: (destination: MoveFileDestination) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function getMoveFileErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.code === "FILE_NAME_CONFLICT") {
    return "A file with this name already exists in that folder.";
  }

  if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
    return "Choose a valid destination.";
  }

  return "Unable to move file.";
}

export function MoveFileDialog({
  dataRoomId,
  fileName,
  onMoveFile,
  onOpenChange,
  open,
}: MoveFileDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [selectedDestination, setSelectedDestination] =
    useState<MoveFileDestination | null>(null);
  const folderTreeQuery = useQuery({
    ...folderTreeQueryOptions(dataRoomId),
    enabled: open && Boolean(dataRoomId),
  });
  const isPending = folderTreeQuery.isFetching || isMoving;

  function handleOpenChange(nextOpen: boolean) {
    if (isMoving) {
      return;
    }

    onOpenChange(nextOpen);

    if (nextOpen) {
      setError(null);
      setSelectedDestination(null);
    }
  }

  async function handleMove() {
    if (!selectedDestination) {
      setError("Choose a destination.");
      return;
    }

    setIsMoving(true);
    setError(null);

    try {
      await onMoveFile(selectedDestination);
      onOpenChange(false);
    } catch (error) {
      setError(getMoveFileErrorMessage(error));
    } finally {
      setIsMoving(false);
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Move &quot;{fileName}&quot;</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <p className="text-sm font-medium">Choose destination</p>

          {folderTreeQuery.isLoading ? (
            <div className="flex min-h-32 items-center justify-center rounded-md border text-sm text-muted-foreground">
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              <span className="ml-2">Loading folders...</span>
            </div>
          ) : null}

          {folderTreeQuery.isError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              Unable to load folders.
            </p>
          ) : null}

          {folderTreeQuery.data ? (
            <FolderPicker
              onSelectDestination={(destination) => {
                setSelectedDestination(destination);
                setError(null);
              }}
              root={folderTreeQuery.data}
              selectedDestination={selectedDestination}
            />
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={
              isPending ||
              !selectedDestination ||
              folderTreeQuery.isError ||
              !folderTreeQuery.data
            }
            onClick={() => void handleMove()}
            type="button"
          >
            {isMoving ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : null}
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
