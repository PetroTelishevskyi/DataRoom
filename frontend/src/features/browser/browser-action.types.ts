export type CreateFolderHandler = (name: string) => Promise<void>;
export type UploadFilesHandler = (files: File[]) => void;
