import type {
  AccessRole,
  BreadcrumbItem as ResourceBreadcrumbItem,
  FolderResourceItem,
  ResourceItem,
} from "@/features/data-rooms/data-room.types";

export type BrowserCapabilities = {
  canCreateFolder: boolean;
  canDeleteFolder: boolean;
  canRenameFolder: boolean;
  canUpload: boolean;
};

export type ResourceBrowserProps = {
  accessRole: AccessRole;
  breadcrumbs: ResourceBreadcrumbItem[];
  capabilities: BrowserCapabilities;
  getBreadcrumbHref: (breadcrumb: ResourceBreadcrumbItem) => string;
  getFolderHref: (folder: FolderResourceItem) => string;
  hasResource: boolean;
  isError: boolean;
  isLoading: boolean;
  items: ResourceItem[];
  onCreateFolder?: (name: string) => Promise<void>;
  onDeleteFolder?: (folder: FolderResourceItem) => Promise<void>;
  onRenameFolder?: (folder: FolderResourceItem, name: string) => Promise<void>;
  onUploadFiles?: (files: File[]) => void;
  rootHref: string;
  title: string;
};
