import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { InitiateUploadDto } from "./dto/initiate-upload.dto";
import { FilesService } from "./files.service";

@Controller()
@UseGuards(AuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("data-rooms/:dataRoomId/uploads")
  async initiateRootUpload(
    @CurrentUser("id") userId: string,
    @Param("dataRoomId") dataRoomId: string,
    @Body() initiateUploadDto: InitiateUploadDto,
  ) {
    const upload = await this.filesService.initiateRootUpload({
      dataRoomId,
      mimeType: initiateUploadDto.mimeType,
      name: initiateUploadDto.name,
      sizeBytes: initiateUploadDto.sizeBytes,
      userId,
    });

    return {
      data: upload,
    };
  }

  @Post("folders/:folderId/uploads")
  async initiateFolderUpload(
    @CurrentUser("id") userId: string,
    @Param("folderId") folderId: string,
    @Body() initiateUploadDto: InitiateUploadDto,
  ) {
    const upload = await this.filesService.initiateFolderUpload({
      folderId,
      mimeType: initiateUploadDto.mimeType,
      name: initiateUploadDto.name,
      sizeBytes: initiateUploadDto.sizeBytes,
      userId,
    });

    return {
      data: upload,
    };
  }

  @Post("files/:fileId/upload-url")
  async requestUploadUrl(
    @CurrentUser("id") userId: string,
    @Param("fileId") fileId: string,
  ) {
    const upload = await this.filesService.requestUploadUrl({
      fileId,
      userId,
    });

    return {
      data: upload,
    };
  }

  @Post("files/:fileId/complete-upload")
  async completeUpload(
    @CurrentUser("id") userId: string,
    @Param("fileId") fileId: string,
  ) {
    const file = await this.filesService.completeUpload({
      fileId,
      userId,
    });

    return {
      data: {
        file,
      },
    };
  }

  @Delete("files/:fileId/upload")
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelUpload(
    @CurrentUser("id") userId: string,
    @Param("fileId") fileId: string,
  ) {
    await this.filesService.cancelUpload({
      fileId,
      userId,
    });
  }
}
