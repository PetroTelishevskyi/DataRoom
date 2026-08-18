import { Module } from "@nestjs/common";
import { AuthorizationModule } from "../authorization/authorization.module";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { DataRoomsController } from "./data-rooms.controller";
import { DataRoomsService } from "./data-rooms.service";

@Module({
  imports: [AuthModule, AuthorizationModule, UsersModule],
  controllers: [DataRoomsController],
  providers: [DataRoomsService],
})
export class DataRoomsModule {}
