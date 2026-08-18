import { Loader2 } from "lucide-react";
import { FormEvent, ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";

type RenameFolderDialogProps = {
  children?: ReactNode;
  currentName: string;
  onOpenChange?: (open: boolean) => void;
  onRenameFolder: (name: string) => Promise<void>;
  open?: boolean;
};

function getRenameFolderErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.code === "FOLDER_NAME_CONFLICT") {
    return "A folder with this name already exists here.";
  }

  if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
    return "Enter a folder name between 1 and 255 characters.";
  }

  return "Unable to rename folder.";
}

export function RenameFolderDialog({
  children,
  currentName,
  onOpenChange,
  onRenameFolder,
  open,
}: RenameFolderDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState(currentName);
  const [internalOpen, setInternalOpen] = useState(false);
  const inputId = useId();
  const errorId = useId();
  const dialogOpen = open ?? internalOpen;

  function setDialogOpen(nextOpen: boolean) {
    if (isPending) {
      return;
    }

    if (open === undefined) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);

    if (nextOpen) {
      setError(null);
      setName(currentName);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Folder name is required.");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      await onRenameFolder(trimmedName);
      setDialogOpen(false);
    } catch (error) {
      setError(getRenameFolderErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename folder</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor={inputId}>Folder name</Label>
            <Input
              aria-describedby={error ? errorId : undefined}
              aria-invalid={Boolean(error)}
              autoFocus
              className={
                error
                  ? "border-destructive focus-visible:ring-destructive"
                  : undefined
              }
              disabled={isPending}
              id={inputId}
              maxLength={255}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              value={name}
            />
            {error ? (
              <p className="text-xs text-destructive" id={errorId}>
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => setDialogOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : null}
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
