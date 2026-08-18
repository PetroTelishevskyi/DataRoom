import { useEffect, useMemo, useState } from "react";
import { useUploadQueue } from "../upload-context";
import { UploadPanelHeader } from "./upload-panel-header";
import { UploadItem } from "./upload-item";

export function UploadPanel() {
  const { clearUploads, items, queueVersion, removeUpload, retryUpload } =
    useUploadQueue();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const completedCount = useMemo(
    () => items.filter((item) => item.status === "success").length,
    [items],
  );

  useEffect(() => {
    setIsDismissed(false);
    setIsExpanded(true);
  }, [queueVersion]);

  if (items.length === 0 || isDismissed) {
    return null;
  }

  return (
    <section className="fixed bottom-5 right-5 z-50 w-[380px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-lg border bg-white shadow-lg">
      <UploadPanelHeader
        completedCount={completedCount}
        isExpanded={isExpanded}
        onClose={() => {
          clearUploads();
          setIsDismissed(true);
        }}
        onToggle={() => setIsExpanded((currentValue) => !currentValue)}
        totalCount={items.length}
      />

      {isExpanded ? (
        <div className="max-h-[340px] overflow-y-auto">
          {items.map((item) => (
            <UploadItem
              item={item}
              key={item.id}
              onRemove={removeUpload}
              onRetry={retryUpload}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
