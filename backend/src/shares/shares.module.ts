import { Module } from "@nestjs/common";
import { AuthorizationModule } from "../authorization/authorization.module";
import { AuthModule } from "../auth/auth.module";
import { ResourceQueryModule } from "../resource-query/resource-query.module";
import { StorageModule } from "../storage/storage.module";
import { UsersModule } from "../users/users.module";
import { PublicSharesController } from "./public-shares.controller";
import { SharedWithMeController } from "./shared-with-me.controller";
import { PublicSharesService } from "./public-shares.service";
import { SharesController } from "./shares.controller";
import { SharesService } from "./shares.service";

@Module({
  imports: [
    AuthModule,
    AuthorizationModule,
    ResourceQueryModule,
    StorageModule,
    UsersModule,
  ],
  controllers: [
    SharesController,
    SharedWithMeController,
    PublicSharesController,
  ],
  providers: [SharesService, PublicSharesService],
})
export class SharesModule {}
