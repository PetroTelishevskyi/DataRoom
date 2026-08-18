import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { PasswordService } from "./password.service";

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("AUTH_SECRET"),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, PasswordService],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
