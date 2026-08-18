import { Injectable } from "@nestjs/common";
import { FolderKind } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";

const DEFAULT_DATA_ROOM_NAME = "My Data Room";
const ROOT_FOLDER_NAME = "ROOT";
const ROOT_FOLDER_NAME_KEY = "root";

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

  async findByEmail(email: string): Promise<PublicUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
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
        ownedDataRooms: {
          create: {
            name: DEFAULT_DATA_ROOM_NAME,
            folders: {
              create: {
                kind: FolderKind.ROOT,
                name: ROOT_FOLDER_NAME,
                nameKey: ROOT_FOLDER_NAME_KEY,
              },
            },
          },
        },
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
