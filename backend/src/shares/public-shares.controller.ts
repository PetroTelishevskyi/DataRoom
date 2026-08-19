import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/auth.guard";
import { PublicSharesService } from "./public-shares.service";

@Controller("public/shares")
@UseGuards(AuthGuard)
export class PublicSharesController {
  constructor(private readonly publicSharesService: PublicSharesService) {}

  @Get(":token")
  async getPublicShareRoot(@Param("token") token: string) {
    const publicShare = await this.publicSharesService.getPublicShareRoot(token);

    return {
      data: publicShare,
    };
  }

  @Get(":token/folders/:folderId")
  async getPublicFolderContents(
    @Param("token") token: string,
    @Param("folderId") folderId: string,
  ) {
    const publicShare = await this.publicSharesService.getPublicFolderByToken(
      token,
      folderId,
    );

    return {
      data: publicShare,
    };
  }

  @Post(":token/files/:fileId/view-url")
  async requestPublicFileViewUrl(
    @Param("token") token: string,
    @Param("fileId") fileId: string,
  ) {
    const viewUrl = await this.publicSharesService.requestPublicFileViewUrl(
      token,
      fileId,
    );

    return {
      data: {
        viewUrl,
      },
    };
  }
}
