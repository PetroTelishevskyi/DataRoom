import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { folderDeletionPreviewQueryOptions } from "@/features/folders/folder-queries";

type DeleteFolderDialogProps = {
  folderId: string;
  folderName: string;
  onDeleteFolder: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function DeleteFolderDialog({
  folderId,
  folderName,
  onDeleteFolder,
  onOpenChange,
  open,
}: DeleteFolderDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const previewQuery = useQuery({
    ...folderDeletionPreviewQueryOptions(folderId),
    enabled: open,
  });
  const isPending = previewQuery.isFetching || isDeleting;

  function handleOpenChange(nextOpen: boolean) {
    if (isDeleting) {
      return;
    }

    onOpenChange(nextOpen);
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await onDeleteFolder();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{folderName}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This folder, nested folders, and files will be permanently deleted.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {previewQuery.isLoading ? (
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            Calculating folder contents...
          </div>
        ) : null}

        {previewQuery.isError ? (
          <p className="text-sm text-destructive">
            Unable to calculate folder contents.
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending || previewQuery.isError}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            {isDeleting ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
