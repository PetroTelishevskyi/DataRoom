import { Module } from "@nestjs/common";
import { AuthorizationModule } from "../authorization/authorization.module";
import { AuthModule } from "../auth/auth.module";
import { StorageModule } from "../storage/storage.module";
import { UsersModule } from "../users/users.module";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

@Module({
  imports: [AuthModule, AuthorizationModule, StorageModule, UsersModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
