import { ChevronDown, ChevronRight, Folder, HardDrive } from "lucide-react";
import { useState } from "react";
import type { MoveFileDestination } from "@/features/files/files-api";
import type {
  FolderTreeNode,
  FolderTreeRoot,
} from "@/features/folders/folder-api";
import { cn } from "@/lib/utils";

type FolderPickerProps = {
  onSelectDestination: (destination: MoveFileDestination) => void;
  root: FolderTreeRoot;
  selectedDestination: MoveFileDestination | null;
};

type FolderTreeRowProps = {
  depth: number;
  node: FolderTreeNode;
  onSelectDestination: (destination: MoveFileDestination) => void;
  selectedDestination: MoveFileDestination | null;
};

function isSelected(
  selectedDestination: MoveFileDestination | null,
  destination: MoveFileDestination,
) {
  return (
    selectedDestination?.type === destination.type &&
    selectedDestination.id === destination.id
  );
}

function FolderTreeRow({
  depth,
  node,
  onSelectDestination,
  selectedDestination,
}: FolderTreeRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const destination: MoveFileDestination = {
    type: "FOLDER",
    id: node.id,
  };

  return (
    <div>
      <div className="flex items-center">
        <button
          aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
          className={cn(
            "flex h-9 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted",
            !hasChildren && "invisible",
          )}
          disabled={!hasChildren}
          onClick={() => setIsExpanded((current) => !current)}
          style={{ marginLeft: depth * 16 }}
          type="button"
        >
          {isExpanded ? (
            <ChevronDown aria-hidden className="h-4 w-4" />
          ) : (
            <ChevronRight aria-hidden className="h-4 w-4" />
          )}
        </button>
        <button
          className={cn(
            "flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isSelected(selectedDestination, destination) && "bg-muted font-medium",
          )}
          onClick={() => onSelectDestination(destination)}
          type="button"
        >
          <Folder aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{node.name}</span>
        </button>
      </div>

      {isExpanded
        ? node.children.map((childNode) => (
            <FolderTreeRow
              depth={depth + 1}
              key={childNode.id}
              node={childNode}
              onSelectDestination={onSelectDestination}
              selectedDestination={selectedDestination}
            />
          ))
        : null}
    </div>
  );
}

export function FolderPicker({
  onSelectDestination,
  root,
  selectedDestination,
}: FolderPickerProps) {
  const rootDestination: MoveFileDestination = {
    type: "DATA_ROOM_ROOT",
    id: root.id,
  };

  return (
    <div className="max-h-80 overflow-y-auto rounded-md border p-2">
      <button
        className={cn(
          "flex h-9 w-full min-w-0 items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isSelected(selectedDestination, rootDestination) && "bg-muted font-medium",
        )}
        onClick={() => onSelectDestination(rootDestination)}
        type="button"
      >
        <HardDrive
          aria-hidden
          className="h-4 w-4 shrink-0 text-muted-foreground"
        />
        <span className="truncate">{root.name}</span>
      </button>

      <div className="mt-1">
        {root.children.map((node) => (
          <FolderTreeRow
            depth={0}
            key={node.id}
            node={node}
            onSelectDestination={onSelectDestination}
            selectedDestination={selectedDestination}
          />
        ))}
      </div>
    </div>
  );
}
