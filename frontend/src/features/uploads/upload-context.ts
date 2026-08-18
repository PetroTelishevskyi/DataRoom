import { createContext, useContext } from "react";
import type { UploadQueueItem, UploadQueueJob } from "./upload.types";

export type EnqueueUploadsParams = {
  jobs: UploadQueueJob[];
};

export type UploadContextValue = {
  clearUploads: () => void;
  enqueueUploads: (params: EnqueueUploadsParams) => void;
  items: UploadQueueItem[];
  queueVersion: number;
  removeUpload: (id: string) => void;
  renameUpload: (id: string, fileName: string) => void;
  retryUpload: (id: string) => void;
};

export const UploadContext = createContext<UploadContextValue | null>(null);

export function useUploadQueue() {
  const context = useContext(UploadContext);

  if (!context) {
    throw new Error("useUploadQueue must be used within UploadProvider.");
  }

  return context;
}
