import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CreateShareDto } from "./dto/create-share.dto";
import { ListResourceSharesDto } from "./dto/list-resource-shares.dto";
import { SharesService } from "./shares.service";

@Controller("shares")
@UseGuards(AuthGuard)
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  async createShare(
    @CurrentUser("id") userId: string,
    @Body() createShareDto: CreateShareDto,
  ) {
    const share =
      createShareDto.type === "PUBLIC_LINK"
        ? await this.sharesService.createPublicLinkShare({
            resource: createShareDto.resource,
            type: createShareDto.type,
            userId,
          })
        : await this.sharesService.createUserShare({
            recipientEmail: createShareDto.recipientEmail ?? "",
            resource: createShareDto.resource,
            role: createShareDto.role ?? "VIEWER",
            type: createShareDto.type,
            userId,
          });

    return {
      data: {
        share,
      },
    };
  }

  @Get()
  async listResourceShares(
    @CurrentUser("id") userId: string,
    @Query() query: ListResourceSharesDto,
  ) {
    const shares = await this.sharesService.listResourceShares({
      resource: {
        type: query.resourceType,
        id: query.resourceId,
      },
      userId,
    });

    return {
      data: {
        shares,
      },
    };
  }
}
