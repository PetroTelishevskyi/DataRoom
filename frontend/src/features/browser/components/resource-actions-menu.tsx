import { MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ResourceActionsMenuProps = {
  onRename?: () => void;
};

export function ResourceActionsMenu({ onRename }: ResourceActionsMenuProps) {
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
        <DropdownMenuItem disabled={!onRename} onSelect={onRename}>
          <Pencil aria-hidden className="h-4 w-4" />
          Rename
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
