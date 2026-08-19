import { apiRequest } from "@/lib/api";
import type { FileViewUrl } from "@/features/files/files-api";
import type { PublicShareContents, PublicShareData } from "../share.types";

type PublicShareResponse = {
  data: PublicShareData;
};

type PublicFolderResponse = {
  data: PublicShareContents;
};

type PublicFileViewUrlResponse = {
  data: {
    viewUrl: FileViewUrl;
  };
};

export async function getPublicShare(token: string) {
  const response = await apiRequest<PublicShareResponse>(
    `/public/shares/${token}`,
  );

  return response.data;
}

export async function getPublicFolder(token: string, folderId: string) {
  const response = await apiRequest<PublicFolderResponse>(
    `/public/shares/${token}/folders/${folderId}`,
  );

  return response.data;
}

export async function requestPublicFileViewUrl(
  token: string,
  fileId: string,
) {
  const response = await apiRequest<PublicFileViewUrlResponse>(
    `/public/shares/${token}/files/${fileId}/view-url`,
    {
      method: "POST",
    },
  );

  return response.data.viewUrl;
}
