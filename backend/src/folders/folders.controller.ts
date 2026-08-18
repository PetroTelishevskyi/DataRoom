import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { FoldersService } from "./folders.service";

@Controller()
@UseGuards(AuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post("data-rooms/:dataRoomId/folders")
  async createRootFolder(
    @CurrentUser("id") userId: string,
    @Param("dataRoomId") dataRoomId: string,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    const folder = await this.foldersService.createRootFolder({
      dataRoomId,
      name: createFolderDto.name,
      userId,
    });

    return {
      data: {
        folder,
      },
    };
  }

  @Get("folders/:folderId")
  async getFolderContents(
    @CurrentUser("id") userId: string,
    @Param("folderId") folderId: string,
  ) {
    const contents = await this.foldersService.getFolderContents({
      folderId,
      userId,
    });

    return {
      data: contents,
    };
  }

  @Post("folders/:folderId/folders")
  async createChildFolder(
    @CurrentUser("id") userId: string,
    @Param("folderId") folderId: string,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    const folder = await this.foldersService.createChildFolder({
      name: createFolderDto.name,
      parentFolderId: folderId,
      userId,
    });

    return {
      data: {
        folder,
      },
    };
  }
}
