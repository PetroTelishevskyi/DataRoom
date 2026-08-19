import type {
  AccessRole,
  BreadcrumbItem as ResourceBreadcrumbItem,
  FileResourceItem,
  FolderResourceItem,
  ResourceItem,
} from "@/features/data-rooms/data-room.types";
import type { MoveFileDestination } from "@/features/files/files-api";

export type BrowserCapabilities = {
  canCreateFolder: boolean;
  canDeleteFile: boolean;
  canDeleteFolder: boolean;
  canMoveFile: boolean;
  canRenameFile: boolean;
  canRenameFolder: boolean;
  canShare: boolean;
  canUpload: boolean;
};

export type ResourceBrowserProps = {
  accessRole: AccessRole;
  breadcrumbs: ResourceBreadcrumbItem[];
  capabilities: BrowserCapabilities;
  getBreadcrumbHref: (breadcrumb: ResourceBreadcrumbItem) => string;
  getFileHref?: (file: FileResourceItem) => string;
  getFileState?: (file: FileResourceItem) => unknown;
  getFolderHref: (folder: FolderResourceItem) => string;
  hasResource: boolean;
  isError: boolean;
  isLoading: boolean;
  items: ResourceItem[];
  dataRoomId?: string;
  onCreateFolder?: (name: string) => Promise<void>;
  onDeleteFile?: (file: FileResourceItem) => Promise<void>;
  onDeleteFolder?: (folder: FolderResourceItem) => Promise<void>;
  onMoveFile?: (
    file: FileResourceItem,
    destination: MoveFileDestination,
  ) => Promise<void>;
  onRenameFile?: (file: FileResourceItem, name: string) => Promise<void>;
  onRenameFolder?: (folder: FolderResourceItem, name: string) => Promise<void>;
  onUploadFiles?: (files: File[]) => void;
  rootHref: string;
  title: string;
};
