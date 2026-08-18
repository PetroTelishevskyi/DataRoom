import { apiRequest } from "@/lib/api";
import type { FileResourceItem } from "@/features/data-rooms/data-room.types";

export type FileViewUrl = {
  url: string;
  expiresAt: string;
};

type FileViewUrlResponse = {
  data: {
    viewUrl: FileViewUrl;
  };
};

type RenameFileParams = {
  fileId: string;
  name: string;
};

type RenameFileResponse = {
  data: {
    file: Pick<FileResourceItem, "id" | "name" | "status">;
  };
};

export async function requestFileViewUrl(fileId: string) {
  const response = await apiRequest<FileViewUrlResponse>(
    `/files/${fileId}/view-url`,
    {
      method: "POST",
    },
  );

  return response.data.viewUrl;
}

export async function renameFile(params: RenameFileParams) {
  const response = await apiRequest<RenameFileResponse>(
    `/files/${params.fileId}`,
    {
      body: JSON.stringify({ name: params.name }),
      method: "PATCH",
    },
  );

  return response.data.file;
}

export async function deleteFile(fileId: string) {
  await apiRequest<void>(`/files/${fileId}`, {
    method: "DELETE",
  });
}
