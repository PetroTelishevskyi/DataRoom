import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { configuration } from "./config/configuration";
import { validateEnv } from "./config/env.validation";
import { AuthModule } from "./auth/auth.module";
import { DataRoomsModule } from "./data-rooms/data-rooms.module";
import { FilesModule } from "./files/files.module";
import { FoldersModule } from "./folders/folders.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SharesModule } from "./shares/shares.module";
import { StorageModule } from "./storage/storage.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    DataRoomsModule,
    FilesModule,
    FoldersModule,
    SharesModule,
    StorageModule,
  ],
})
export class AppModule {}
