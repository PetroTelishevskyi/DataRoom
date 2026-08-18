import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  BlobNotFoundError,
  del,
  head,
  issueSignedToken,
  presignUrl,
} from "@vercel/blob";
import {
  BlobStorage,
  CreateReadUrlParams,
  CreateReadUrlResult,
  CreateUploadUrlParams,
  CreateUploadUrlResult,
  HeadObjectResult,
} from "../storage.types";

@Injectable()
export class VercelBlobStorageProvider implements BlobStorage {
  constructor(private readonly configService: ConfigService) {}

  async createUploadUrl({
    key,
    contentLength,
    contentType,
  }: CreateUploadUrlParams): Promise<CreateUploadUrlResult> {
    const expiresAt = this.createExpiry("uploadUrlTtlSeconds", 600);
    const token = await issueSignedToken({
      allowedContentTypes: [contentType],
      maximumSizeInBytes: Number(contentLength),
      operations: ["put"],
      pathname: key,
      token: this.getToken(),
      validUntil: expiresAt.getTime(),
    });
    const { presignedUrl } = await presignUrl(token, {
      access: "private",
      addRandomSuffix: false,
      allowedContentTypes: [contentType],
      maximumSizeInBytes: Number(contentLength),
      operation: "put",
      pathname: key,
      validUntil: expiresAt.getTime(),
    });

    return {
      url: presignedUrl,
      method: "PUT",
      headers: {
        "x-add-random-suffix": "0",
        "x-content-type": contentType,
        "x-vercel-blob-access": "private",
      },
      expiresAt,
    };
  }

  async createReadUrl({
    key,
  }: CreateReadUrlParams): Promise<CreateReadUrlResult> {
    const expiresAt = this.createExpiry("readUrlTtlSeconds", 300);
    const token = await issueSignedToken({
      operations: ["get"],
      pathname: key,
      token: this.getToken(),
      validUntil: expiresAt.getTime(),
    });
    const { presignedUrl } = await presignUrl(token, {
      access: "private",
      operation: "get",
      pathname: key,
      validUntil: expiresAt.getTime(),
    });

    return {
      url: presignedUrl,
      expiresAt,
    };
  }

  async headObject(key: string): Promise<HeadObjectResult> {
    try {
      const result = await head(key, {
        token: this.getToken(),
      });

      return {
        sizeBytes: BigInt(result.size),
        contentType: result.contentType,
      };
    } catch (error) {
      if (error instanceof BlobNotFoundError) {
        return null;
      }

      throw error;
    }
  }

  async deleteObject(key: string): Promise<void> {
    await del(key, {
      token: this.getToken(),
    });
  }

  private createExpiry(configKey: string, fallbackSeconds: number): Date {
    const ttlSeconds = this.configService.get<number>(configKey) ?? fallbackSeconds;

    return new Date(Date.now() + ttlSeconds * 1000);
  }

  private getToken(): string {
    return this.configService.getOrThrow<string>("storage.blobReadWriteToken");
  }
}
