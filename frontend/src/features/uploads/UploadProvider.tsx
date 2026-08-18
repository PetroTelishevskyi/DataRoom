import {
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { MAX_CONCURRENT_UPLOADS } from "./upload.constants";
import { UploadContext, type EnqueueUploadsParams } from "./upload-context";
import {
  createUploadQueueRecord,
  toUploadQueueItem,
  updateUploadQueueRecord,
  type UploadQueueRecord,
} from "./upload-manager";
import { ApiError } from "@/lib/api";
import type { UploadQueueItem } from "./upload.types";

function createQueueId(): string {
  return crypto.randomUUID();
}

export function UploadProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [queueVersion, setQueueVersion] = useState(0);
  const activeCountRef = useRef(0);
  const queueRef = useRef<string[]>([]);
  const recordsRef = useRef(new Map<string, UploadQueueRecord>());

  const syncItems = useCallback(() => {
    setItems(Array.from(recordsRef.current.values()).map(toUploadQueueItem));
  }, []);

  const updateRecord = useCallback(
    (id: string, patch: Parameters<typeof updateUploadQueueRecord>[1]) => {
      const record = recordsRef.current.get(id);

      if (!record) {
        return;
      }

      recordsRef.current.set(id, updateUploadQueueRecord(record, patch));
      syncItems();
    },
    [syncItems],
  );

  const processQueue = useCallback(() => {
    while (
      activeCountRef.current < MAX_CONCURRENT_UPLOADS &&
      queueRef.current.length > 0
    ) {
      const id = queueRef.current.shift();

      if (!id) {
        return;
      }

      const record = recordsRef.current.get(id);

      if (!record || record.status !== "queued") {
        continue;
      }

      activeCountRef.current += 1;
      updateRecord(id, {
        errorCode: undefined,
        errorMessage: undefined,
        progress: 0,
        status: "preparing",
      });

      void record
        .run(record.file, {
          setProgress: (progress) => {
            updateRecord(id, { progress });
          },
          setStatus: (status) => {
            updateRecord(id, { status });
          },
        })
        .then(() => {
          updateRecord(id, {
            progress: 100,
            status: "success",
          });
        })
        .catch((error: unknown) => {
          updateRecord(id, {
            errorCode: error instanceof ApiError ? error.code : undefined,
            errorMessage:
              error instanceof Error ? error.message : "Upload failed.",
            progress: 0,
            status: "failed",
          });
        })
        .finally(() => {
          activeCountRef.current = Math.max(0, activeCountRef.current - 1);
          processQueue();
        });
    }
  }, [updateRecord]);

  const enqueueUploads = useCallback(
    ({ jobs }: EnqueueUploadsParams) => {
      if (jobs.length === 0) {
        return;
      }

      for (const job of jobs) {
        const id = createQueueId();
        recordsRef.current.set(id, createUploadQueueRecord(id, job));
        queueRef.current.push(id);
      }

      setQueueVersion((currentVersion) => currentVersion + 1);
      syncItems();
      processQueue();
    },
    [processQueue, syncItems],
  );

  const retryUpload = useCallback(
    (id: string) => {
      const record = recordsRef.current.get(id);

      if (!record || record.status !== "failed") {
        return;
      }

      recordsRef.current.set(
        id,
        updateUploadQueueRecord(record, {
          errorCode: undefined,
          errorMessage: undefined,
          progress: 0,
          status: "queued",
        }),
      );
      queueRef.current.push(id);
      syncItems();
      processQueue();
    },
    [processQueue, syncItems],
  );

  const renameUpload = useCallback(
    (id: string, fileName: string) => {
      const record = recordsRef.current.get(id);

      if (!record || record.status !== "failed") {
        return;
      }

      const renamedFile = new File([record.file], fileName, {
        lastModified: record.file.lastModified,
        type: record.file.type,
      });

      recordsRef.current.set(
        id,
        updateUploadQueueRecord(record, {
          errorCode: undefined,
          errorMessage: undefined,
          file: renamedFile,
          fileName,
          progress: 0,
          sizeBytes: renamedFile.size,
          status: "queued",
        }),
      );
      queueRef.current.push(id);
      syncItems();
      processQueue();
    },
    [processQueue, syncItems],
  );

  const removeUpload = useCallback(
    (id: string) => {
      recordsRef.current.delete(id);
      queueRef.current = queueRef.current.filter((queuedId) => queuedId !== id);
      syncItems();
    },
    [syncItems],
  );

  const clearUploads = useCallback(() => {
    recordsRef.current.clear();
    queueRef.current = [];
    syncItems();
  }, [syncItems]);

  const value = useMemo(
    () => ({
      clearUploads,
      enqueueUploads,
      items,
      queueVersion,
      removeUpload,
      renameUpload,
      retryUpload,
    }),
    [
      clearUploads,
      enqueueUploads,
      items,
      queueVersion,
      removeUpload,
      renameUpload,
      retryUpload,
    ],
  );

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
}
