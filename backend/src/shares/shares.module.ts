import { Module } from "@nestjs/common";
import { AuthorizationModule } from "../authorization/authorization.module";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { SharedWithMeController } from "./shared-with-me.controller";
import { SharesController } from "./shares.controller";
import { SharesService } from "./shares.service";

@Module({
  imports: [AuthModule, AuthorizationModule, UsersModule],
  controllers: [SharesController, SharedWithMeController],
  providers: [SharesService],
})
export class SharesModule {}
