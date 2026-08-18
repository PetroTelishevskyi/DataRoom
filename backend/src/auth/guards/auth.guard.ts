import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "../../users/users.service";
import { AUTH_COOKIE_NAME } from "../auth.constants";
import { AuthService } from "../auth.service";
import type { AuthenticatedRequest } from "../auth.types";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = await this.authService.verifySessionToken(token);
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = user;

    return true;
  }
}
