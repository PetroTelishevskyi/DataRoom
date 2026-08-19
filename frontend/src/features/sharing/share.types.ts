import type { AuthUser } from "@/features/auth/auth.types";

export type PublicUser = Pick<AuthUser, "id" | "email" | "name">;

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

export type NamedShareResource = ShareResource & {
  name: string;
};

export type ShareSummary = {
  id: string;
  type: "USER";
  role: "VIEWER";
  resource: ShareResource;
  recipient: PublicUser;
  createdAt: string;
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
  createdAt: string;
};

export type CreateUserShareInput = {
  type: "USER";
  resource: ShareResource;
  recipientEmail: string;
  role: "VIEWER";
};
