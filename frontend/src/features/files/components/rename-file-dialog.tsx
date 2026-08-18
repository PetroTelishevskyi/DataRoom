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

type RenameFileDialogProps = {
  children?: ReactNode;
  currentName: string;
  onOpenChange?: (open: boolean) => void;
  onRenameFile: (name: string) => Promise<void>;
  open?: boolean;
};

function getRenameFileErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.code === "FILE_NAME_CONFLICT") {
    return "A file with this name already exists in this folder.";
  }

  if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
    return "Enter a PDF file name between 1 and 255 characters.";
  }

  return "Unable to rename file.";
}

export function RenameFileDialog({
  children,
  currentName,
  onOpenChange,
  onRenameFile,
  open,
}: RenameFileDialogProps) {
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
      setError("File name is required.");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      await onRenameFile(trimmedName);
      setDialogOpen(false);
    } catch (error) {
      setError(getRenameFileErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename file</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor={inputId}>File name</Label>
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
