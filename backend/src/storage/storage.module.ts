import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { VercelBlobStorageProvider } from "./providers/vercel-blob-storage.provider";
import { StorageDevController } from "./storage-dev.controller";
import { BLOB_STORAGE } from "./storage.types";
import { StorageService } from "./storage.service";

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [StorageDevController],
  providers: [
    StorageService,
    {
      provide: BLOB_STORAGE,
      useClass: VercelBlobStorageProvider,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
