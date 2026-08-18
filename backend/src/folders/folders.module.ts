import { Module } from "@nestjs/common";
import { AuthorizationModule } from "../authorization/authorization.module";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { FoldersController } from "./folders.controller";
import { FoldersService } from "./folders.service";

@Module({
  imports: [AuthModule, AuthorizationModule, UsersModule],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}
