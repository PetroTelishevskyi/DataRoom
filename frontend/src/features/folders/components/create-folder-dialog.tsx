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

type CreateFolderDialogProps = {
  children: ReactNode;
  disabled?: boolean;
  onCreateFolder: (name: string) => Promise<void>;
};

const DEFAULT_FOLDER_NAME = "Untitled folder";

function getCreateFolderErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.code === "FOLDER_NAME_CONFLICT") {
    return "A folder with this name already exists here.";
  }

  if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
    return "Enter a folder name between 1 and 255 characters.";
  }

  return "Unable to create folder.";
}

export function CreateFolderDialog({
  children,
  disabled = false,
  onCreateFolder,
}: CreateFolderDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState(DEFAULT_FOLDER_NAME);
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const errorId = useId();

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
      await onCreateFolder(trimmedName);
      setName(DEFAULT_FOLDER_NAME);
      setOpen(false);
    } catch (error) {
      setError(getCreateFolderErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (isPending) {
          return;
        }

        setOpen(nextOpen);

        if (nextOpen) {
          setError(null);
          setName(DEFAULT_FOLDER_NAME);
        }
      }}
      open={open}
    >
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor={inputId}>Folder name</Label>
            <Input
              aria-describedby={error ? errorId : undefined}
              aria-invalid={Boolean(error)}
              autoFocus
              className={error ? "border-destructive focus-visible:ring-destructive" : undefined}
              disabled={isPending}
              id={inputId}
              maxLength={255}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              placeholder="Legal"
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
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : null}
              Create folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
