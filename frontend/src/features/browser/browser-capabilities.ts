import type { AccessRole } from "@/features/data-rooms/data-room.types";
import type { BrowserCapabilities } from "./browser.types";

export function getBrowserCapabilities(
  accessRole: AccessRole,
): BrowserCapabilities {
  const canMutate = accessRole === "OWNER";

  return {
    canCreateFolder: canMutate,
    canDeleteFile: canMutate,
    canDeleteFolder: canMutate,
    canMoveFile: canMutate,
    canRenameFile: canMutate,
    canRenameFolder: canMutate,
    canShare: canMutate,
    canUpload: canMutate,
  };
}
