import {
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ResourceActionsMenuProps = {
  canDelete?: boolean;
  canMove?: boolean;
  canOpen?: boolean;
  canRename?: boolean;
  canShare?: boolean;
  onDelete?: () => void;
  onMove?: () => void;
  onOpen?: () => void;
  onRename?: () => void;
  onShare?: () => void;
  showMove?: boolean;
  showOpen?: boolean;
  showShare?: boolean;
};

export function ResourceActionsMenu({
  canDelete,
  canMove,
  canOpen,
  canRename,
  canShare,
  onDelete,
  onMove,
  onOpen,
  onRename,
  onShare,
  showMove = false,
  showOpen = false,
  showShare = false,
}: ResourceActionsMenuProps) {
  const isDeleteEnabled = canDelete ?? Boolean(onDelete);
  const isMoveEnabled = canMove ?? Boolean(onMove);
  const isOpenEnabled = canOpen ?? Boolean(onOpen);
  const isRenameEnabled = canRename ?? Boolean(onRename);
  const isShareEnabled = canShare ?? Boolean(onShare);
  const shouldShowOpen = showOpen || Boolean(onOpen);
  const shouldShowRename = isRenameEnabled || Boolean(onRename);
  const shouldShowMove = showMove || Boolean(onMove);
  const shouldShowShare = showShare || Boolean(onShare);
  const shouldShowDelete = isDeleteEnabled || Boolean(onDelete);
  const hasPrimaryActions =
    shouldShowOpen || shouldShowRename || shouldShowMove || shouldShowShare;

  if (!hasPrimaryActions && !shouldShowDelete) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open resource actions"
          className="h-8 w-8"
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {shouldShowOpen ? (
          <DropdownMenuItem disabled={!isOpenEnabled || !onOpen} onSelect={onOpen}>
            <ExternalLink aria-hidden className="h-4 w-4" />
            Open
          </DropdownMenuItem>
        ) : null}
        {shouldShowRename ? (
          <DropdownMenuItem
            disabled={!isRenameEnabled || !onRename}
            onSelect={onRename}
          >
            <Pencil aria-hidden className="h-4 w-4" />
            Rename
          </DropdownMenuItem>
        ) : null}
        {shouldShowMove ? (
          <DropdownMenuItem disabled={!isMoveEnabled || !onMove} onSelect={onMove}>
            <Undo2 aria-hidden className="h-4 w-4" />
            Move
          </DropdownMenuItem>
        ) : null}
        {shouldShowShare ? (
          <DropdownMenuItem
            disabled={!isShareEnabled || !onShare}
            onSelect={onShare}
          >
            <Share2 aria-hidden className="h-4 w-4" />
            Share
          </DropdownMenuItem>
        ) : null}
        {shouldShowDelete && hasPrimaryActions ? <DropdownMenuSeparator /> : null}
        {shouldShowDelete ? (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={!isDeleteEnabled || !onDelete}
            onSelect={onDelete}
          >
            <Trash2 aria-hidden className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
