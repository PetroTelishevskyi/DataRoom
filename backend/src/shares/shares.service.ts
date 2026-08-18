import { HttpStatus, Injectable } from "@nestjs/common";
import { AuthorizationService } from "../authorization/authorization.service";
import { AppError } from "../common/errors/app-error";
import { ShareRole, ShareType } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import {
  ShareResource,
  ShareSummary,
  SharedWithMeItem,
  toShareSummary,
  toSharedWithMeItem,
} from "./share.mapper";

type CreateUserShareParams = {
  recipientEmail: string;
  resource: ShareResource;
  role: "VIEWER";
  type: "USER";
  userId: string;
};

type ListResourceSharesParams = {
  resource: ShareResource;
  userId: string;
};

@Injectable()
export class SharesService {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createUserShare(
    params: CreateUserShareParams,
  ): Promise<ShareSummary> {
    if (params.type !== "USER" || params.role !== "VIEWER") {
      throw new AppError(
        "INVALID_SHARE_ROLE",
        HttpStatus.BAD_REQUEST,
        "Only viewer user shares are supported.",
      );
    }

    await this.assertOwnsResource(params.userId, params.resource);

    const recipient = await this.usersService.findByEmail(
      this.normalizeEmail(params.recipientEmail),
    );

    if (!recipient) {
      throw new AppError(
        "RECIPIENT_NOT_FOUND",
        HttpStatus.NOT_FOUND,
        "Recipient user was not found.",
      );
    }

    if (recipient.id === params.userId) {
      throw new AppError(
        "CANNOT_SHARE_WITH_SELF",
        HttpStatus.CONFLICT,
        "You cannot share a resource with yourself.",
      );
    }

    const existingShare = await this.findActiveUserShare({
      recipientUserId: recipient.id,
      resource: params.resource,
    });

    if (existingShare) {
      return toShareSummary(existingShare);
    }

    const share = await this.prisma.share.create({
      data: {
        ...this.toShareResourceData(params.resource),
        createdById: params.userId,
        recipientUserId: recipient.id,
        role: ShareRole.VIEWER,
        type: ShareType.USER,
      },
      select: this.shareSummarySelect(),
    });

    return toShareSummary(share);
  }

  async listResourceShares(
    params: ListResourceSharesParams,
  ): Promise<ShareSummary[]> {
    await this.assertOwnsResource(params.userId, params.resource);

    const shares = await this.prisma.share.findMany({
      where: {
        ...this.toShareResourceWhere(params.resource),
        role: ShareRole.VIEWER,
        revokedAt: null,
        type: ShareType.USER,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: this.shareSummarySelect(),
    });

    return shares.map(toShareSummary);
  }

  async listSharedWithMe(userId: string): Promise<SharedWithMeItem[]> {
    const shares = await this.prisma.share.findMany({
      where: {
        recipientUserId: userId,
        role: ShareRole.VIEWER,
        revokedAt: null,
        type: ShareType.USER,
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      select: this.sharedWithMeSelect(),
    });

    return shares.map(toSharedWithMeItem);
  }

  private async assertOwnsResource(
    userId: string,
    resource: ShareResource,
  ): Promise<void> {
    if (resource.type === "DATA_ROOM") {
      await this.authorizationService.assertOwnsDataRoom(userId, resource.id);
      return;
    }

    if (resource.type === "FOLDER") {
      await this.authorizationService.assertOwnsFolder(userId, resource.id);
      return;
    }

    await this.authorizationService.assertOwnsFile(userId, resource.id);
  }

  private findActiveUserShare(params: {
    recipientUserId: string;
    resource: ShareResource;
  }) {
    return this.prisma.share.findFirst({
      where: {
        ...this.toShareResourceWhere(params.resource),
        recipientUserId: params.recipientUserId,
        role: ShareRole.VIEWER,
        revokedAt: null,
        type: ShareType.USER,
      },
      select: this.shareSummarySelect(),
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLocaleLowerCase("en-US");
  }

  private toShareResourceData(resource: ShareResource) {
    if (resource.type === "DATA_ROOM") {
      return {
        dataRoomId: resource.id,
      };
    }

    if (resource.type === "FOLDER") {
      return {
        folderId: resource.id,
      };
    }

    return {
      fileId: resource.id,
    };
  }

  private toShareResourceWhere(resource: ShareResource) {
    if (resource.type === "DATA_ROOM") {
      return {
        dataRoomId: resource.id,
      };
    }

    if (resource.type === "FOLDER") {
      return {
        folderId: resource.id,
      };
    }

    return {
      fileId: resource.id,
    };
  }

  private shareSummarySelect() {
    return {
      id: true,
      type: true,
      role: true,
      dataRoomId: true,
      folderId: true,
      fileId: true,
      recipientUser: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      createdAt: true,
    } as const;
  }

  private sharedWithMeSelect() {
    return {
      id: true,
      type: true,
      role: true,
      dataRoom: {
        select: {
          id: true,
          name: true,
        },
      },
      folder: {
        select: {
          id: true,
          name: true,
          dataRoomId: true,
        },
      },
      file: {
        select: {
          id: true,
          name: true,
          dataRoomId: true,
          folderId: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      createdAt: true,
    } as const;
  }
}
