export type UploadFileSummary = {
  id: string;
  name: string;
  status: "UPLOADING" | "READY";
};

export type UploadContract = {
  clientToken: string;
  url: string;
  method: "PUT";
  headers: Record<string, string>;
  pathname: string;
  expiresAt: string;
};

export type InitiateUploadResponse = {
  data: {
    file: UploadFileSummary;
    upload: UploadContract;
  };
};

export type CompleteUploadResponse = {
  data: {
    file: UploadFileSummary;
  };
};

export type InitiateUploadParams = {
  file: File;
};

export type InitiateRootUploadParams = InitiateUploadParams & {
  dataRoomId: string;
};

export type InitiateFolderUploadParams = InitiateUploadParams & {
  folderId: string;
};
