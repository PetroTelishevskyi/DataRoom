import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { HttpStatus } from "@nestjs/common";
import type { CookieOptions } from "express";
import { AppError } from "../common/errors/app-error";
import { UsersService } from "../users/users.service";
import { AUTH_COOKIE_NAME, AUTH_TOKEN_TTL_SECONDS } from "./auth.constants";
import type { AuthTokenPayload, AuthUser } from "./auth.types";
import { PasswordService } from "./password.service";

function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase("en-US");
}

function normalizeName(name: string): string {
  const normalizedName = name.trim();

  return normalizedName;
}

function isPrismaUniqueError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthUser> {
    const passwordHash = await this.passwordService.hash(params.password);
    const email = normalizeEmail(params.email);

    try {
      return await this.usersService.create({
        email,
        passwordHash,
        name: normalizeName(params.name),
      });
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        throw new AppError(
          "EMAIL_ALREADY_EXISTS",
          HttpStatus.CONFLICT,
          "A user with this email already exists.",
        );
      }

      throw error;
    }
  }

  async validateCredentials(params: {
    email: string;
    password: string;
  }): Promise<AuthUser | null> {
    const email = normalizeEmail(params.email);
    const user = await this.usersService.findByEmailWithPasswordHash(
      email,
    );

    if (!user) {
      return null;
    }

    const isValidPassword = await this.passwordService.verify({
      password: params.password,
      passwordHash: user.passwordHash,
    });

    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async createSessionToken(user: AuthUser): Promise<string> {
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: AUTH_TOKEN_TTL_SECONDS,
    });
  }

  async verifySessionToken(token: string): Promise<AuthTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<AuthTokenPayload>(token);
    } catch {
      throw new AppError(
        "AUTHENTICATION_REQUIRED",
        HttpStatus.UNAUTHORIZED,
        "Authentication is required.",
      );
    }
  }

  getSessionCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      maxAge: AUTH_TOKEN_TTL_SECONDS * 1000,
      path: "/",
      sameSite: "lax",
      secure: this.configService.get<string>("NODE_ENV") === "production",
    };
  }

  getExpiredSessionCookieOptions(): CookieOptions {
    return {
      ...this.getSessionCookieOptions(),
      maxAge: 0,
    };
  }

  getSessionCookieName(): string {
    return AUTH_COOKIE_NAME;
  }
}
