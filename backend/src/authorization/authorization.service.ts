import { Injectable, NotFoundException } from "@nestjs/common";
import { ShareType } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { ResourceQueryService } from "../resource-query/resource-query.service";
import type {
  DataRoomAccessContext,
  FileAccessContext,
  FolderAccessContext,
} from "./access.types";

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resourceQuery: ResourceQueryService,
  ) {}

  async assertOwnsDataRoom(
    userId: string,
    dataRoomId: string,
  ): Promise<void> {
    const dataRoom = await this.resourceQuery.getDataRoom(dataRoomId);

    if (!dataRoom || dataRoom.ownerId !== userId) {
      throw new NotFoundException();
    }
  }

  async assertOwnsFolder(userId: string, folderId: string): Promise<void> {
    const folder = await this.resourceQuery.getFolderWithRoom(folderId);

    if (!folder || folder.dataRoom.ownerId !== userId) {
      throw new NotFoundException();
    }
  }

  async assertOwnsFile(userId: string, fileId: string): Promise<void> {
    const file = await this.resourceQuery.getFileWithRoom(fileId);

    if (!file || file.dataRoom.ownerId !== userId) {
      throw new NotFoundException();
    }
  }

  async resolveDataRoomReadAccess(
    userId: string,
    dataRoomId: string,
  ): Promise<DataRoomAccessContext> {
    const dataRoom = await this.resourceQuery.getDataRoom(dataRoomId);

    if (!dataRoom || dataRoom.ownerId !== userId) {
      if (
        !dataRoom ||
        !(await this.hasActiveDataRoomUserShare(userId, dataRoom.id))
      ) {
        throw new NotFoundException();
      }

      return {
        resourceType: "DATA_ROOM",
        dataRoomId: dataRoom.id,
        role: "VIEWER",
        source: "USER_SHARE",
      };
    }

    return {
      resourceType: "DATA_ROOM",
      dataRoomId: dataRoom.id,
      role: "OWNER",
      source: "OWNER",
    };
  }

  async resolveFolderReadAccess(
    userId: string,
    folderId: string,
  ): Promise<FolderAccessContext> {
    const folder = await this.resourceQuery.getFolderWithRoom(folderId);

    if (!folder) {
      throw new NotFoundException();
    }

    if (folder.dataRoom.ownerId === userId) {
      return {
        resourceType: "FOLDER",
        dataRoomId: folder.dataRoomId,
        folderId: folder.id,
        role: "OWNER",
        source: "OWNER",
      };
    }

    if (
      !(await this.hasActiveDataRoomUserShare(userId, folder.dataRoomId)) &&
      !(await this.hasActiveFolderUserShare(userId, folder.id)) &&
      !(await this.hasActiveAncestorFolderUserShare(userId, folder.id))
    ) {
      throw new NotFoundException();
    }

    return {
      resourceType: "FOLDER",
      dataRoomId: folder.dataRoomId,
      folderId: folder.id,
      role: "VIEWER",
      source: "USER_SHARE",
    };
  }

  async resolveFileReadAccess(
    userId: string,
    fileId: string,
  ): Promise<FileAccessContext> {
    const file = await this.resourceQuery.getFileWithRoom(fileId);

    if (!file) {
      throw new NotFoundException();
    }

    if (file.dataRoom.ownerId === userId) {
      return {
        resourceType: "FILE",
        dataRoomId: file.dataRoomId,
        fileId: file.id,
        folderId: file.folderId,
        role: "OWNER",
        source: "OWNER",
      };
    }

    if (
      !(await this.hasActiveFileUserShare(userId, file.id)) &&
      !(await this.hasActiveDataRoomUserShare(userId, file.dataRoomId)) &&
      !(await this.hasActiveFolderUserShare(userId, file.folderId)) &&
      !(await this.hasActiveAncestorFolderUserShare(userId, file.folderId))
    ) {
      throw new NotFoundException();
    }

    return {
      resourceType: "FILE",
      dataRoomId: file.dataRoomId,
      fileId: file.id,
      folderId: file.folderId,
      role: "VIEWER",
      source: "USER_SHARE",
    };
  }

  private async hasActiveDataRoomUserShare(
    userId: string,
    dataRoomId: string,
  ): Promise<boolean> {
    const share = await this.prisma.share.findFirst({
      where: {
        dataRoomId,
        recipientUserId: userId,
        revokedAt: null,
        type: ShareType.USER,
      },
      select: {
        id: true,
      },
    });

    return Boolean(share);
  }

  private async hasActiveFolderUserShare(
    userId: string,
    folderId: string,
  ): Promise<boolean> {
    const share = await this.prisma.share.findFirst({
      where: {
        folderId,
        recipientUserId: userId,
        revokedAt: null,
        type: ShareType.USER,
      },
      select: {
        id: true,
      },
    });

    return Boolean(share);
  }

  private async hasActiveFileUserShare(
    userId: string,
    fileId: string,
  ): Promise<boolean> {
    const share = await this.prisma.share.findFirst({
      where: {
        fileId,
        recipientUserId: userId,
        revokedAt: null,
        type: ShareType.USER,
      },
      select: {
        id: true,
      },
    });

    return Boolean(share);
  }

  private async hasActiveAncestorFolderUserShare(
    userId: string,
    folderId: string,
  ): Promise<boolean> {
    const ancestors = await this.resourceQuery.getFolderAncestors(folderId);

    if (!ancestors.length) {
      return false;
    }

    const share = await this.prisma.share.findFirst({
      where: {
        folderId: {
          in: ancestors.map((ancestor) => ancestor.id),
        },
        recipientUserId: userId,
        revokedAt: null,
        type: ShareType.USER,
      },
      select: {
        id: true,
      },
    });

    return Boolean(share);
  }
}
