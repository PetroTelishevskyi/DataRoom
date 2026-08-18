import { Body, Controller, Delete, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CreateUploadUrlDto } from "./dto/create-upload-url.dto";
import { StorageKeyDto } from "./dto/storage-key.dto";
import { StorageService } from "./storage.service";

@Controller("storage/dev")
@UseGuards(AuthGuard)
export class StorageDevController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload-url")
  async createUploadUrl(
    @CurrentUser("id") userId: string,
    @Body() createUploadUrlDto: CreateUploadUrlDto,
  ) {
    const uploadUrl = await this.storageService.createUploadUrl({
      key: this.scopeKey(userId, createUploadUrlDto.key),
      contentLength: BigInt(createUploadUrlDto.contentLength),
      contentType: createUploadUrlDto.contentType,
    });

    return {
      data: uploadUrl,
    };
  }

  @Post("read-url")
  async createReadUrl(
    @CurrentUser("id") userId: string,
    @Body() storageKeyDto: StorageKeyDto,
  ) {
    const readUrl = await this.storageService.createReadUrl({
      key: this.scopeKey(userId, storageKeyDto.key),
    });

    return {
      data: readUrl,
    };
  }

  @Get("head")
  async headObject(
    @CurrentUser("id") userId: string,
    @Query() storageKeyDto: StorageKeyDto,
  ) {
    const headObject = await this.storageService.headObject(
      this.scopeKey(userId, storageKeyDto.key),
    );

    return {
      data: headObject
        ? {
            ...headObject,
            sizeBytes: headObject.sizeBytes.toString(),
          }
        : null,
    };
  }

  @Delete("object")
  async deleteObject(
    @CurrentUser("id") userId: string,
    @Query() storageKeyDto: StorageKeyDto,
  ) {
    await this.storageService.deleteObject(this.scopeKey(userId, storageKeyDto.key));

    return {
      data: {
        deleted: true,
      },
    };
  }

  private scopeKey(userId: string, key: string) {
    return `manual-tests/${userId}/${key}`;
  }
}
