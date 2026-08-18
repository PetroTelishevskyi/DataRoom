import { put } from "@vercel/blob/client";
import { ApiError, apiRequest } from "@/lib/api";
import type {
  CompleteUploadResponse,
  InitiateFolderUploadParams,
  InitiateRootUploadParams,
  InitiateUploadResponse,
  UploadContract,
} from "./upload.types";

function createInitiateUploadBody(file: File) {
  return JSON.stringify({
    mimeType: file.type,
    name: file.name,
    sizeBytes: file.size,
  });
}

export async function initiateRootUpload(params: InitiateRootUploadParams) {
  const response = await apiRequest<InitiateUploadResponse>(
    `/data-rooms/${params.dataRoomId}/uploads`,
    {
      body: createInitiateUploadBody(params.file),
      method: "POST",
    },
  );

  return response.data;
}

export async function initiateFolderUpload(params: InitiateFolderUploadParams) {
  const response = await apiRequest<InitiateUploadResponse>(
    `/folders/${params.folderId}/uploads`,
    {
      body: createInitiateUploadBody(params.file),
      method: "POST",
    },
  );

  return response.data;
}

export async function requestUploadUrl(fileId: string) {
  const response = await apiRequest<InitiateUploadResponse>(
    `/files/${fileId}/upload-url`,
    {
      method: "POST",
    },
  );

  return response.data;
}

export async function completeUpload(fileId: string) {
  const response = await apiRequest<CompleteUploadResponse>(
    `/files/${fileId}/complete-upload`,
    {
      method: "POST",
    },
  );

  return response.data.file;
}

export async function cancelUpload(fileId: string) {
  await apiRequest<void>(`/files/${fileId}/upload`, {
    method: "DELETE",
  });
}

export async function uploadFileToBlob(
  upload: UploadContract,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<void> {
  try {
    await put(upload.pathname, file, {
      access: "private",
      contentType: file.type,
      onUploadProgress: ({ percentage }) => {
        onProgress?.(percentage);
      },
      token: upload.clientToken,
    });
  } catch {
    throw new ApiError({
      code: "BLOB_UPLOAD_FAILED",
      message: "File upload failed.",
      status: 0,
    });
  }
}
