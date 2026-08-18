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
import type { FolderResourceItem } from "@/features/data-rooms/data-room.types";
import { toast } from "@/components/ui/toast/use-toast";

export function HomePage() {
  const queryClient = useQueryClient();
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
      rootHref="/"
      title={breadcrumbTitle}
    />
  );
}
