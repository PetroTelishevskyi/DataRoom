export type DataRoom = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type FolderResourceItem = {
  type: "FOLDER";
  id: string;
  name: string;
  updatedAt: string;
};

export type FileResourceItem = {
  type: "FILE";
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  status: "UPLOADING" | "READY";
  updatedAt: string;
};

export type ResourceItem = FolderResourceItem | FileResourceItem;

export type BreadcrumbItem = {
  id: string;
  name: string;
};

export type FolderSummary = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type PageInfo = {
  nextCursor: string | null;
  hasNextPage: boolean;
};

export type AccessRole = "OWNER" | "VIEWER";

export type ResourceAccess = {
  role: AccessRole;
};

export type DataRoomContents = {
  folder: FolderSummary | null;
  breadcrumbs: BreadcrumbItem[];
  items: ResourceItem[];
  pageInfo: PageInfo;
  access: ResourceAccess;
};

export type DataRoomsResponse = {
  data: {
    dataRooms: DataRoom[];
  };
};

export type DataRoomResponse = {
  data: {
    dataRoom: DataRoom;
  };
};

export type DataRoomContentsResponse = {
  data: DataRoomContents;
};
