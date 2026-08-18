import type {
  AccessRole,
  BreadcrumbItem as ResourceBreadcrumbItem,
  ResourceItem,
} from "@/features/data-rooms/data-room.types";

export type BrowserCapabilities = {
  canCreateFolder: boolean;
  canUpload: boolean;
};

export type ResourceBrowserProps = {
  accessRole: AccessRole;
  breadcrumbs: ResourceBreadcrumbItem[];
  capabilities: BrowserCapabilities;
  hasResource: boolean;
  isError: boolean;
  isLoading: boolean;
  items: ResourceItem[];
  title: string;
};
