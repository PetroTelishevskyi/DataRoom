import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import type { AuthenticatedRequest, AuthUser } from "../auth.types";

export const CurrentUser = createParamDecorator<
  keyof AuthUser | undefined,
  ExecutionContext,
  AuthUser | AuthUser[keyof AuthUser]
>((property, context) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  const user = request.user;

  if (!user) {
    throw new UnauthorizedException();
  }

  return property ? user[property] : user;
});
