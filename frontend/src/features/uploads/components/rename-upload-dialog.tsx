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

type RenameUploadDialogProps = {
  children: ReactNode;
  currentName: string;
  onRenameUpload: (name: string) => void;
};

function validateUploadName(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "File name is required.";
  }

  if (trimmedName.length > 255 || !trimmedName.toLowerCase().endsWith(".pdf")) {
    return "Enter a PDF file name between 1 and 255 characters.";
  }

  return null;
}

export function RenameUploadDialog({
  children,
  currentName,
  onRenameUpload,
}: RenameUploadDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState(currentName);
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const errorId = useId();

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) {
      return;
    }

    setOpen(nextOpen);

    if (nextOpen) {
      setError(null);
      setName(currentName);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const validationError = validateUploadName(trimmedName);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsPending(true);
    onRenameUpload(trimmedName);
    setIsPending(false);
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename upload</DialogTitle>
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
              onClick={() => handleOpenChange(false)}
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
