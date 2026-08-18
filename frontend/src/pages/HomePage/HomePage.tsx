import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ResourceBrowser } from "@/features/browser/components/resource-browser";
import {
  dataRoomQueryKeys,
  dataRoomContentsQueryOptions,
  dataRoomsQueryOptions,
} from "@/features/data-rooms/data-room-queries";
import {
  createRootFolder,
  deleteFolder,
  renameFolder,
} from "@/features/folders/folder-api";
import {
  cancelUpload,
  completeUpload,
  initiateRootUpload,
  uploadFileToBlob,
} from "@/features/uploads/uploads-api";
import { useUploadQueue } from "@/features/uploads/upload-context";
import type { UploadQueueControls } from "@/features/uploads/upload.types";
import type { FolderResourceItem } from "@/features/data-rooms/data-room.types";
import { toast } from "@/components/ui/toast/use-toast";

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" && file.name.toLowerCase().endsWith(".pdf")
  );
}

export function HomePage() {
  const queryClient = useQueryClient();
  const { enqueueUploads } = useUploadQueue();
  const dataRoomsQuery = useQuery(dataRoomsQueryOptions());
  const dataRoom = dataRoomsQuery.data?.[0] ?? null;
  const contentsQuery = useQuery({
    ...dataRoomContentsQueryOptions(dataRoom?.id ?? ""),
    enabled: Boolean(dataRoom),
  });
  const isLoading =
    dataRoomsQuery.isLoading || (Boolean(dataRoom) && contentsQuery.isLoading);
  const isError = dataRoomsQuery.isError || contentsQuery.isError;
  const items = contentsQuery.data?.items ?? [];
  const breadcrumbTitle = dataRoom?.name ?? "Data Room";
  const createFolderMutation = useMutation({
    mutationFn: (name: string) =>
      createRootFolder({ dataRoomId: dataRoom?.id ?? "", name }),
    onSuccess: async () => {
      if (dataRoom) {
        await queryClient.invalidateQueries({
          queryKey: dataRoomQueryKeys.roomContents(dataRoom.id),
        });
      }

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
      if (dataRoom) {
        await queryClient.invalidateQueries({
          queryKey: dataRoomQueryKeys.roomContents(dataRoom.id),
        });
      }

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
      if (dataRoom) {
        await queryClient.invalidateQueries({
          queryKey: dataRoomQueryKeys.roomContents(dataRoom.id),
        });
      }

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
  const uploadRootFile = useCallback(
    async (file: File, controls?: UploadQueueControls) => {
      if (!dataRoom) {
        return;
      }

      const initiatedUpload = await initiateRootUpload({
        dataRoomId: dataRoom.id,
        file,
      });

      try {
        controls?.setStatus("uploading");
        await uploadFileToBlob(initiatedUpload.upload, file, (progress) => {
          controls?.setProgress(progress);
        });
        controls?.setStatus("finalizing");
        await completeUpload(initiatedUpload.file.id);
      } catch (error) {
        await cancelUpload(initiatedUpload.file.id).catch(() => {});
        throw error;
      }

      await queryClient.invalidateQueries({
        queryKey: dataRoomQueryKeys.roomContents(dataRoom.id),
      });
    },
    [dataRoom, queryClient],
  );
  const handleUploadFiles = useCallback(
    (files: File[]) => {
      if (!dataRoom) {
        return;
      }

      const validFiles = files.filter(isPdfFile);
      const invalidFiles = files.filter((file) => !isPdfFile(file));

      enqueueUploads({
        jobs: [
          ...validFiles.map((file) => ({
            destination: {
              dataRoomId: dataRoom.id,
              type: "data-room" as const,
            },
            file,
            run: uploadRootFile,
          })),
          ...invalidFiles.map((file) => ({
            destination: {
              dataRoomId: dataRoom.id,
              type: "data-room" as const,
            },
            file,
            run: async () => {
              throw new Error("Only PDF files can be uploaded.");
            },
          })),
        ],
      });
    },
    [dataRoom, enqueueUploads, uploadRootFile],
  );

  return (
    <ResourceBrowser
      accessRole={contentsQuery.data?.access.role ?? "OWNER"}
      breadcrumbs={contentsQuery.data?.breadcrumbs ?? []}
      capabilities={{
        canCreateFolder: true,
        canDeleteFolder: true,
        canRenameFolder: true,
        canUpload: true,
      }}
      getBreadcrumbHref={(breadcrumb) => `/folders/${breadcrumb.id}`}
      getFolderHref={(folder) => `/folders/${folder.id}`}
      hasResource={Boolean(dataRoom)}
      isError={isError}
      isLoading={isLoading}
      items={items}
      onCreateFolder={handleCreateFolder}
      onDeleteFolder={handleDeleteFolder}
      onRenameFolder={handleRenameFolder}
      onUploadFiles={handleUploadFiles}
      rootHref="/"
      title={breadcrumbTitle}
    />
  );
}
