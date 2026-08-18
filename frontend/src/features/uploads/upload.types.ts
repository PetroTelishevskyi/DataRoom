export type UploadFileSummary = {
  id: string;
  name: string;
  status: "UPLOADING" | "READY";
};

export type UploadStatus =
  | "queued"
  | "preparing"
  | "uploading"
  | "finalizing"
  | "success"
  | "failed";

export type UploadDestination =
  | {
      type: "data-room";
      dataRoomId: string;
    }
  | {
      type: "folder";
      folderId: string;
    };

export type UploadQueueItem = {
  id: string;
  destination: UploadDestination;
  errorCode?: string;
  errorMessage?: string;
  fileName: string;
  progress: number;
  sizeBytes: number;
  status: UploadStatus;
};

export type UploadQueueControls = {
  setProgress: (progress: number) => void;
  setStatus: (status: UploadStatus) => void;
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

export type UploadQueueJob = {
  destination: UploadDestination;
  file: File;
  run: (file: File, controls: UploadQueueControls) => Promise<void>;
};
