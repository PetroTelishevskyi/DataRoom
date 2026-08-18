import type { PublicUser } from "../users/users.service";
import { ShareRole, ShareType } from "../generated/prisma/enums";

export type ShareResource =
  | {
      type: "DATA_ROOM";
      id: string;
    }
  | {
      type: "FOLDER";
      id: string;
    }
  | {
      type: "FILE";
      id: string;
    };

export type ShareSummary = {
  id: string;
  type: "USER";
  role: "VIEWER";
  resource: ShareResource;
  recipient: PublicUser;
  createdAt: Date;
};

type ShareRow = {
  id: string;
  type: ShareType;
  role: ShareRole;
  dataRoomId: string | null;
  folderId: string | null;
  fileId: string | null;
  recipientUser: PublicUser | null;
  createdAt: Date;
};

export function toShareSummary(share: ShareRow): ShareSummary {
  if (
    share.type !== ShareType.USER ||
    share.role !== ShareRole.VIEWER ||
    !share.recipientUser
  ) {
    throw new Error("User share invariant failed.");
  }

  return {
    id: share.id,
    type: "USER",
    role: "VIEWER",
    resource: toShareResource(share),
    recipient: share.recipientUser,
    createdAt: share.createdAt,
  };
}

function toShareResource(share: ShareRow): ShareResource {
  if (share.dataRoomId) {
    return {
      type: "DATA_ROOM",
      id: share.dataRoomId,
    };
  }

  if (share.folderId) {
    return {
      type: "FOLDER",
      id: share.folderId,
    };
  }

  if (share.fileId) {
    return {
      type: "FILE",
      id: share.fileId,
    };
  }

  throw new Error("Share target invariant failed.");
}
