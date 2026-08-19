import type { AuthUser } from "@/features/auth/auth.types";
import type {
  BreadcrumbItem,
  FolderSummary,
  PageInfo,
  ResourceAccess,
  ResourceItem,
} from "@/features/data-rooms/data-room.types";

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

export type PublicLinkShareSummary = {
  id: string;
  type: "PUBLIC_LINK";
  role: "VIEWER";
  resource: ShareResource;
  publicToken: string;
  createdAt: string;
};

export type ResourceShareSummary = ShareSummary | PublicLinkShareSummary;

export type RevokedShareSummary = {
  id: string;
  revokedAt: string;
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

export type CreatePublicShareInput = {
  type: "PUBLIC_LINK";
  resource: ShareResource;
};

export type PublicShareResource =
  | {
      type: "DATA_ROOM";
      id: string;
      name: string;
    }
  | {
      type: "FOLDER";
      id: string;
    }
  | {
      type: "FILE";
      id: string;
      name: string;
      dataRoomId: string;
      folderId: string;
      updatedAt: string;
    };

export type PublicShareContents = {
  resource: PublicShareResource;
  folder: FolderSummary | null;
  breadcrumbs: BreadcrumbItem[];
  items: ResourceItem[];
  pageInfo: PageInfo;
  access: ResourceAccess;
};

export type PublicFileShare = {
  resource: Extract<PublicShareResource, { type: "FILE" }>;
  access: ResourceAccess;
};

export type PublicShareData = PublicShareContents | PublicFileShare;
