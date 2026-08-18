import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "@/components/ui/toast/use-toast";
import { ResourceBrowser } from "@/features/browser/components/resource-browser";
import type { FolderResourceItem } from "@/features/data-rooms/data-room.types";
import { dataRoomsQueryOptions } from "@/features/data-rooms/data-room-queries";
import {
  createChildFolder,
  deleteFolder,
  renameFolder,
} from "@/features/folders/folder-api";
import {
  folderContentsQueryOptions,
  folderQueryKeys,
} from "@/features/folders/folder-queries";
import {
  cancelUpload,
  completeUpload,
  initiateFolderUpload,
  uploadFileToBlob,
} from "@/features/uploads/uploads-api";
import { ApiError } from "@/lib/api";

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" && file.name.toLowerCase().endsWith(".pdf")
  );
}

export function FolderPage() {
  const { folderId = "" } = useParams();
  const queryClient = useQueryClient();
  const dataRoomsQuery = useQuery(dataRoomsQueryOptions());
  const contentsQuery = useQuery({
    ...folderContentsQueryOptions(folderId),
    enabled: Boolean(folderId),
  });
  const isLoading = dataRoomsQuery.isLoading || contentsQuery.isLoading;
  const isError = dataRoomsQuery.isError || contentsQuery.isError;
  const dataRoom = dataRoomsQuery.data?.[0] ?? null;
  const contents = contentsQuery.data;
  const createFolderMutation = useMutation({
    mutationFn: (name: string) =>
      createChildFolder({ name, parentFolderId: folderId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: folderQueryKeys.folderContents(folderId),
      });

      toast({
        title: "Folder created",
        variant: "success",
      });
    },
  });
  const { mutateAsync: createFolder } = createFolderMutation;
  const handleCreateFolder = useCallback(
    async (name: string) => {
      await createFolder(name);
    },
    [createFolder],
  );
  const renameFolderMutation = useMutation({
    mutationFn: (params: { folderId: string; name: string }) =>
      renameFolder(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: folderQueryKeys.folderContents(folderId),
      });

      toast({
        title: "Folder renamed",
        variant: "success",
      });
    },
  });
  const { mutateAsync: renameFolderMutationAsync } = renameFolderMutation;
  const handleRenameFolder = useCallback(
    async (folder: FolderResourceItem, name: string) => {
      await renameFolderMutationAsync({ folderId: folder.id, name });
    },
    [renameFolderMutationAsync],
  );
  const deleteFolderMutation = useMutation({
    mutationFn: (folderId: string) => deleteFolder(folderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: folderQueryKeys.folderContents(folderId),
      });

      toast({
        title: "Folder deleted",
        variant: "success",
      });
    },
  });
  const { mutateAsync: deleteFolderMutationAsync } = deleteFolderMutation;
  const handleDeleteFolder = useCallback(
    async (folder: FolderResourceItem) => {
      await deleteFolderMutationAsync(folder.id);
    },
    [deleteFolderMutationAsync],
  );
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!folderId) {
        return;
      }

      const initiatedUpload = await initiateFolderUpload({
        file,
        folderId,
      });

      try {
        await uploadFileToBlob(initiatedUpload.upload, file);
        await completeUpload(initiatedUpload.file.id);
      } catch (error) {
        await cancelUpload(initiatedUpload.file.id).catch(() => {});
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: folderQueryKeys.folderContents(folderId),
      });

      toast({
        title: "File uploaded",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        description:
          error instanceof ApiError ? error.message : "Please try again.",
        title: "Upload failed",
        variant: "destructive",
      });
    },
  });
  const { mutateAsync: uploadFile } = uploadFileMutation;
  const handleUploadFile = useCallback(
    async (file: File) => {
      if (!isPdfFile(file)) {
        toast({
          description: "Only PDF files can be uploaded.",
          title: "Upload failed",
          variant: "destructive",
        });
        return;
      }

      await uploadFile(file);
    },
    [uploadFile],
  );

  return (
    <ResourceBrowser
      accessRole={contents?.access.role ?? "OWNER"}
      breadcrumbs={contents?.breadcrumbs ?? []}
      capabilities={{
        canCreateFolder: true,
        canDeleteFolder: true,
        canRenameFolder: true,
        canUpload: true,
      }}
      getBreadcrumbHref={(breadcrumb) => `/folders/${breadcrumb.id}`}
      getFolderHref={(folder) => `/folders/${folder.id}`}
      hasResource={Boolean(folderId && contents?.folder)}
      isError={isError}
      isLoading={isLoading}
      items={contents?.items ?? []}
      onCreateFolder={handleCreateFolder}
      onDeleteFolder={handleDeleteFolder}
      onRenameFolder={handleRenameFolder}
      onUploadFile={handleUploadFile}
      rootHref="/"
      title={dataRoom?.name ?? "Data Room"}
    />
  );
}
