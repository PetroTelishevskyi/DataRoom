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

export type SharedWithMeResource =
  | {
      type: "DATA_ROOM";
      id: string;
      name: string;
    }
  | {
      type: "FOLDER";
      id: string;
      name: string;
      dataRoomId: string;
    }
  | {
      type: "FILE";
      id: string;
      name: string;
      dataRoomId: string;
      folderId: string;
    };

export type SharedWithMeItem = {
  id: string;
  type: "USER";
  role: "VIEWER";
  resource: SharedWithMeResource;
  sharedBy: PublicUser;
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

type SharedWithMeRow = {
  id: string;
  type: ShareType;
  role: ShareRole;
  dataRoom: {
    id: string;
    name: string;
  } | null;
  folder: {
    id: string;
    name: string;
    dataRoomId: string;
  } | null;
  file: {
    id: string;
    name: string;
    dataRoomId: string;
    folderId: string;
  } | null;
  createdBy: PublicUser;
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

export function toSharedWithMeItem(
  share: SharedWithMeRow,
): SharedWithMeItem {
  if (share.type !== ShareType.USER || share.role !== ShareRole.VIEWER) {
    throw new Error("Shared-with-me invariant failed.");
  }

  return {
    id: share.id,
    type: "USER",
    role: "VIEWER",
    resource: toSharedWithMeResource(share),
    sharedBy: share.createdBy,
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

function toSharedWithMeResource(
  share: SharedWithMeRow,
): SharedWithMeResource {
  if (share.dataRoom) {
    return {
      type: "DATA_ROOM",
      id: share.dataRoom.id,
      name: share.dataRoom.name,
    };
  }

  if (share.folder) {
    return {
      type: "FOLDER",
      id: share.folder.id,
      name: share.folder.name,
      dataRoomId: share.folder.dataRoomId,
    };
  }

  if (share.file) {
    return {
      type: "FILE",
      id: share.file.id,
      name: share.file.name,
      dataRoomId: share.file.dataRoomId,
      folderId: share.file.folderId,
    };
  }

  throw new Error("Shared-with-me target invariant failed.");
}
