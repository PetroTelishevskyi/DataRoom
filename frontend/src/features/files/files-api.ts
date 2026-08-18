import { apiRequest } from "@/lib/api";

export type FileViewUrl = {
  url: string;
  expiresAt: string;
};

type FileViewUrlResponse = {
  data: {
    viewUrl: FileViewUrl;
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
