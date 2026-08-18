import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type UploadPanelHeaderProps = {
  completedCount: number;
  isExpanded: boolean;
  onClose: () => void;
  onToggle: () => void;
  totalCount: number;
};

export function UploadPanelHeader({
  completedCount,
  isExpanded,
  onClose,
  onToggle,
  totalCount,
}: UploadPanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button
        className="min-w-0 flex-1 text-left"
        onClick={onToggle}
        type="button"
      >
        <span className="block text-sm font-semibold leading-none">
          Uploads
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {completedCount} of {totalCount} complete
        </span>
      </button>
      <div className="flex items-center gap-1">
        <Button
          aria-label={isExpanded ? "Collapse uploads" : "Expand uploads"}
          className="h-8 w-8"
          onClick={onToggle}
          size="icon"
          type="button"
          variant="ghost"
        >
          {isExpanded ? (
            <ChevronDown aria-hidden className="h-4 w-4" />
          ) : (
            <ChevronUp aria-hidden className="h-4 w-4" />
          )}
        </Button>
        <Button
          aria-label="Close uploads"
          className="h-8 w-8"
          onClick={onClose}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X aria-hidden className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
