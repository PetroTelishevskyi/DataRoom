import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "@/components/ui/toast/use-toast";
import { ResourceBrowser } from "@/features/browser/components/resource-browser";
import type {
  FileResourceItem,
  FolderResourceItem,
} from "@/features/data-rooms/data-room.types";
import {
  dataRoomQueryKeys,
  dataRoomsQueryOptions,
} from "@/features/data-rooms/data-room-queries";
import {
  deleteFile,
  moveFile,
  renameFile,
  type MoveFileDestination,
} from "@/features/files/files-api";
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
import { useUploadQueue } from "@/features/uploads/upload-context";
import type { UploadQueueControls } from "@/features/uploads/upload.types";

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" && file.name.toLowerCase().endsWith(".pdf")
  );
}

export function FolderPage() {
  const { folderId = "" } = useParams();
  const queryClient = useQueryClient();
  const { enqueueUploads } = useUploadQueue();
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
  const renameFileMutation = useMutation({
    mutationFn: (params: { fileId: string; name: string }) =>
      renameFile(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: folderQueryKeys.folderContents(folderId),
      });

      toast({
        title: "File renamed",
        variant: "success",
      });
    },
  });
  const { mutateAsync: renameFileMutationAsync } = renameFileMutation;
  const handleRenameFile = useCallback(
    async (file: FileResourceItem, name: string) => {
      await renameFileMutationAsync({ fileId: file.id, name });
    },
    [renameFileMutationAsync],
  );
  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => deleteFile(fileId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: folderQueryKeys.folderContents(folderId),
      });

      toast({
        title: "File deleted",
        variant: "success",
      });
    },
  });
  const { mutateAsync: deleteFileMutationAsync } = deleteFileMutation;
  const handleDeleteFile = useCallback(
    async (file: FileResourceItem) => {
      await deleteFileMutationAsync(file.id);
    },
    [deleteFileMutationAsync],
  );
  const moveFileMutation = useMutation({
    mutationFn: (params: {
      destination: MoveFileDestination;
      fileId: string;
    }) => moveFile(params),
    onSuccess: async () => {
      const invalidations = [
        queryClient.invalidateQueries({
          queryKey: folderQueryKeys.folderContents(folderId),
        }),
      ];

      if (dataRoom) {
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: dataRoomQueryKeys.roomContents(dataRoom.id),
          }),
          queryClient.invalidateQueries({
            queryKey: folderQueryKeys.folderTree(dataRoom.id),
          }),
        );
      }

      await Promise.all(invalidations);

      toast({
        title: "File moved",
        variant: "success",
      });
    },
  });
  const { mutateAsync: moveFileMutationAsync } = moveFileMutation;
  const handleMoveFile = useCallback(
    async (file: FileResourceItem, destination: MoveFileDestination) => {
      await moveFileMutationAsync({
        destination,
        fileId: file.id,
      });
    },
    [moveFileMutationAsync],
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
  const uploadFolderFile = useCallback(
    async (file: File, controls?: UploadQueueControls) => {
      if (!folderId) {
        return;
      }

      const initiatedUpload = await initiateFolderUpload({
        file,
        folderId,
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
        queryKey: folderQueryKeys.folderContents(folderId),
      });
    },
    [folderId, queryClient],
  );
  const handleUploadFiles = useCallback(
    (files: File[]) => {
      if (!folderId) {
        return;
      }

      const validFiles = files.filter(isPdfFile);
      const invalidFiles = files.filter((file) => !isPdfFile(file));

      enqueueUploads({
        jobs: [
          ...validFiles.map((file) => ({
            destination: {
              folderId,
              type: "folder" as const,
            },
            file,
            run: uploadFolderFile,
          })),
          ...invalidFiles.map((file) => ({
            destination: {
              folderId,
              type: "folder" as const,
            },
            file,
            run: async () => {
              throw new Error("Only PDF files can be uploaded.");
            },
          })),
        ],
      });
    },
    [enqueueUploads, folderId, uploadFolderFile],
  );

  return (
    <ResourceBrowser
      accessRole={contents?.access.role ?? "OWNER"}
      breadcrumbs={contents?.breadcrumbs ?? []}
      capabilities={{
        canCreateFolder: true,
        canDeleteFile: true,
        canDeleteFolder: true,
        canMoveFile: true,
        canRenameFile: true,
        canRenameFolder: true,
        canShare: true,
        canUpload: true,
      }}
      dataRoomId={dataRoom?.id}
      getBreadcrumbHref={(breadcrumb) => `/folders/${breadcrumb.id}`}
      getFolderHref={(folder) => `/folders/${folder.id}`}
      hasResource={Boolean(folderId && contents?.folder)}
      isError={isError}
      isLoading={isLoading}
      items={contents?.items ?? []}
      onCreateFolder={handleCreateFolder}
      onDeleteFile={handleDeleteFile}
      onDeleteFolder={handleDeleteFolder}
      onMoveFile={handleMoveFile}
      onRenameFile={handleRenameFile}
      onRenameFolder={handleRenameFolder}
      onUploadFiles={handleUploadFiles}
      rootHref="/"
      title={dataRoom?.name ?? "Data Room"}
    />
  );
}
