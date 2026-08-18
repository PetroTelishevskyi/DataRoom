import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { SharesService } from "./shares.service";

@Controller("shared-with-me")
@UseGuards(AuthGuard)
export class SharedWithMeController {
  constructor(private readonly sharesService: SharesService) {}

  @Get()
  async listSharedWithMe(@CurrentUser("id") userId: string) {
    const shares = await this.sharesService.listSharedWithMe(userId);

    return {
      data: {
        shares,
      },
    };
  }
}
