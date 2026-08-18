import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
};

type UserWithPasswordHash = PublicUser & {
  passwordHash: string;
};

function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PublicUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return user ? toPublicUser(user) : null;
  }

  async findByEmailWithPasswordHash(
    email: string,
  ): Promise<UserWithPasswordHash | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
      },
    });

    return user;
  }

  async create(params: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<PublicUser> {
    const user = await this.prisma.user.create({
      data: {
        email: params.email,
        passwordHash: params.passwordHash,
        name: params.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return toPublicUser(user);
  }
}
