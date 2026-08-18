import { apiRequest } from "@/lib/api";
import type {
  DataRoomContentsResponse,
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

export async function getFolderContents(folderId: string) {
  const response = await apiRequest<DataRoomContentsResponse>(
    `/folders/${folderId}`,
  );

  return response.data;
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
