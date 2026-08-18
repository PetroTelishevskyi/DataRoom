export const BLOB_STORAGE = Symbol("BLOB_STORAGE");

export type CreateUploadUrlParams = {
  key: string;
  contentType: string;
  contentLength: bigint;
};

export type CreateUploadUrlResult = {
  clientToken: string;
  url: string;
  method: "PUT";
  headers: Record<string, string>;
  pathname: string;
  expiresAt: Date;
};

export type CreateReadUrlParams = {
  key: string;
};

export type CreateReadUrlResult = {
  url: string;
  expiresAt: Date;
};

export type HeadObjectResult = {
  sizeBytes: bigint;
  contentType?: string;
} | null;

export interface BlobStorage {
  createUploadUrl(
    params: CreateUploadUrlParams,
  ): Promise<CreateUploadUrlResult>;
  createReadUrl(params: CreateReadUrlParams): Promise<CreateReadUrlResult>;
  headObject(key: string): Promise<HeadObjectResult>;
  deleteObject(key: string): Promise<void>;
}
