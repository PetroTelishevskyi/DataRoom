import type {
  UploadQueueItem,
  UploadQueueJob,
  UploadStatus,
} from "./upload.types";

export type UploadQueueRecord = UploadQueueItem & {
  file: File;
  run: UploadQueueJob["run"];
};

export function createUploadQueueRecord(
  id: string,
  job: UploadQueueJob,
): UploadQueueRecord {
  return {
    id,
    destination: job.destination,
    file: job.file,
    fileName: job.file.name,
    progress: 0,
    run: job.run,
    sizeBytes: job.file.size,
    status: "queued",
  };
}

export function toUploadQueueItem(record: UploadQueueRecord): UploadQueueItem {
  return {
    id: record.id,
    destination: record.destination,
    errorCode: record.errorCode,
    errorMessage: record.errorMessage,
    fileName: record.fileName,
    progress: record.progress,
    sizeBytes: record.sizeBytes,
    status: record.status,
  };
}

export function updateUploadQueueRecord(
  record: UploadQueueRecord,
  patch: Partial<
    Pick<
      UploadQueueRecord,
      "errorCode" | "errorMessage" | "file" | "fileName" | "progress" | "sizeBytes"
    >
  > & {
    status?: UploadStatus;
  },
): UploadQueueRecord {
  return {
    ...record,
    ...patch,
  };
}
