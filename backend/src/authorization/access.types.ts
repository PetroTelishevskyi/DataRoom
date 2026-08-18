export type Action = "READ" | "CREATE" | "UPDATE" | "DELETE" | "SHARE";

export type ResourceType = "DATA_ROOM" | "FOLDER" | "FILE";

export type AccessRole = "OWNER" | "VIEWER";

export type AccessSource = "OWNER" | "USER_SHARE";

export type DataRoomAccessContext = {
  resourceType: "DATA_ROOM";
  dataRoomId: string;
  role: AccessRole;
  source: AccessSource;
};

export type FolderAccessContext = {
  resourceType: "FOLDER";
  dataRoomId: string;
  folderId: string;
  role: AccessRole;
  source: AccessSource;
};

export type FileAccessContext = {
  resourceType: "FILE";
  dataRoomId: string;
  fileId: string;
  folderId: string;
  role: AccessRole;
  source: AccessSource;
};
