import { apiRequest } from "@/lib/api";
import type {
  DataRoomContentsResponse,
  FolderDeletionPreviewResponse,
  FolderSummary,
} from "@/features/data-rooms/data-room.types";

type CreateFolderParams = {
  name: string;
};

type CreateRootFolderParams = CreateFolderParams & {
  dataRoomId: string;
};

type CreateChildFolderParams = CreateFolderParams & {
  parentFolderId: string;
};

type CreateFolderResponse = {
  data: {
    folder: FolderSummary;
  };
};

type RenameFolderParams = {
  folderId: string;
  name: string;
};

export type FolderTreeNode = {
  type: "FOLDER";
  id: string;
  name: string;
  children: FolderTreeNode[];
};

export type FolderTreeRoot = {
  type: "DATA_ROOM_ROOT";
  id: string;
  name: string;
  children: FolderTreeNode[];
};

type FolderTreeResponse = {
  data: {
    root: FolderTreeRoot;
  };
};

export async function getFolderContents(folderId: string) {
  const response = await apiRequest<DataRoomContentsResponse>(
    `/folders/${folderId}`,
  );

  return response.data;
}

export async function getFolderTree(dataRoomId: string) {
  const response = await apiRequest<FolderTreeResponse>(
    `/data-rooms/${dataRoomId}/folder-tree`,
  );

  return response.data.root;
}

export async function createRootFolder(params: CreateRootFolderParams) {
  const response = await apiRequest<CreateFolderResponse>(
    `/data-rooms/${params.dataRoomId}/folders`,
    {
      body: JSON.stringify({ name: params.name }),
      method: "POST",
    },
  );

  return response.data.folder;
}

export async function createChildFolder(params: CreateChildFolderParams) {
  const response = await apiRequest<CreateFolderResponse>(
    `/folders/${params.parentFolderId}/folders`,
    {
      body: JSON.stringify({ name: params.name }),
      method: "POST",
    },
  );

  return response.data.folder;
}

export async function renameFolder(params: RenameFolderParams) {
  const response = await apiRequest<CreateFolderResponse>(
    `/folders/${params.folderId}`,
    {
      body: JSON.stringify({ name: params.name }),
      method: "PATCH",
    },
  );

  return response.data.folder;
}

export async function getFolderDeletionPreview(folderId: string) {
  const response = await apiRequest<FolderDeletionPreviewResponse>(
    `/folders/${folderId}/deletion-preview`,
  );

  return response.data;
}

export async function deleteFolder(folderId: string) {
  await apiRequest<void>(`/folders/${folderId}`, {
    method: "DELETE",
  });
}
