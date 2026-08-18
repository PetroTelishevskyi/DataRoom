import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { AppError } from "../common/errors/app-error";
import { CurrentUser } from "./decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthGuard } from "./guards/auth.guard";
import { AuthService } from "./auth.service";
import type { AuthUser } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.registerUser(dto);
    const token = await this.authService.createSessionToken(user);

    response.cookie(
      this.authService.getSessionCookieName(),
      token,
      this.authService.getSessionCookieOptions(),
    );

    return {
      data: {
        user,
      },
    };
  }

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateCredentials(dto);

    if (!user) {
      throw new AppError(
        "INVALID_CREDENTIALS",
        401,
        "Invalid email or password.",
      );
    }

    const token = await this.authService.createSessionToken(user);

    response.cookie(
      this.authService.getSessionCookieName(),
      token,
      this.authService.getSessionCookieOptions(),
    );

    return {
      data: {
        user,
      },
    };
  }

  @Post("logout")
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(
      this.authService.getSessionCookieName(),
      this.authService.getExpiredSessionCookieOptions(),
    );
  }

  @Get("me")
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: AuthUser) {
    return {
      data: {
        user,
      },
    };
  }
}
