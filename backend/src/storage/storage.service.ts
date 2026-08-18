import { Inject, Injectable } from "@nestjs/common";
import {
  BLOB_STORAGE,
  BlobStorage,
  CreateReadUrlParams,
  CreateReadUrlResult,
  CreateUploadUrlParams,
  CreateUploadUrlResult,
  HeadObjectResult,
} from "./storage.types";

@Injectable()
export class StorageService implements BlobStorage {
  constructor(
    @Inject(BLOB_STORAGE)
    private readonly blobStorage: BlobStorage,
  ) {}

  createUploadUrl(
    params: CreateUploadUrlParams,
  ): Promise<CreateUploadUrlResult> {
    return this.blobStorage.createUploadUrl(params);
  }

  createReadUrl(params: CreateReadUrlParams): Promise<CreateReadUrlResult> {
    return this.blobStorage.createReadUrl(params);
  }

  headObject(key: string): Promise<HeadObjectResult> {
    return this.blobStorage.headObject(key);
  }

  deleteObject(key: string): Promise<void> {
    return this.blobStorage.deleteObject(key);
  }
}
