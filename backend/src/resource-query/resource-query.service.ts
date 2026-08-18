import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export type DataRoomWithOwner = {
  id: string;
  name: string;
  ownerId: string;
};

export type FolderWithRoom = {
  id: string;
  dataRoomId: string;
  kind: string;
  name: string;
  parentId: string | null;
  dataRoom: {
    ownerId: string;
  };
};

export type FileWithRoom = {
  id: string;
  dataRoomId: string;
  folderId: string;
  name: string;
  dataRoom: {
    ownerId: string;
  };
};

export type FolderAncestor = {
  id: string;
  dataRoomId: string;
  parentId: string | null;
};

@Injectable()
export class ResourceQueryService {
  constructor(private readonly prisma: PrismaService) {}

  getDataRoom(id: string): Promise<DataRoomWithOwner | null> {
    return this.prisma.dataRoom.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });
  }

  getFolderWithRoom(id: string): Promise<FolderWithRoom | null> {
    return this.prisma.folder.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        dataRoomId: true,
        kind: true,
        name: true,
        parentId: true,
        dataRoom: {
          select: {
            ownerId: true,
          },
        },
      },
    });
  }

  getFileWithRoom(id: string): Promise<FileWithRoom | null> {
    return this.prisma.file.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        dataRoomId: true,
        folderId: true,
        name: true,
        dataRoom: {
          select: {
            ownerId: true,
          },
        },
      },
    });
  }

  async getFolderAncestors(folderId: string): Promise<FolderAncestor[]> {
    const ancestors: FolderAncestor[] = [];
    let currentFolder = await this.prisma.folder.findUnique({
      where: {
        id: folderId,
      },
      select: {
        dataRoomId: true,
        parentId: true,
      },
    });

    while (currentFolder?.parentId) {
      const parentFolder = await this.prisma.folder.findFirst({
        where: {
          id: currentFolder.parentId,
          dataRoomId: currentFolder.dataRoomId,
        },
        select: {
          id: true,
          dataRoomId: true,
          parentId: true,
        },
      });

      if (!parentFolder) {
        break;
      }

      ancestors.push(parentFolder);
      currentFolder = parentFolder;
    }

    return ancestors;
  }

  async isFolderDescendantOf(
    folderId: string,
    ancestorId: string,
  ): Promise<boolean> {
    if (folderId === ancestorId) {
      return true;
    }

    const folder = await this.prisma.folder.findUnique({
      where: {
        id: folderId,
      },
      select: {
        dataRoomId: true,
        parentId: true,
      },
    });

    let parentId = folder?.parentId ?? null;

    while (parentId) {
      if (parentId === ancestorId) {
        return true;
      }

      const parentFolder = await this.prisma.folder.findFirst({
        where: {
          id: parentId,
          dataRoomId: folder?.dataRoomId,
        },
        select: {
          parentId: true,
        },
      });

      parentId = parentFolder?.parentId ?? null;
    }

    return false;
  }

  async isFileInsideFolder(
    fileId: string,
    ancestorFolderId: string,
  ): Promise<boolean> {
    const file = await this.prisma.file.findUnique({
      where: {
        id: fileId,
      },
      select: {
        folderId: true,
      },
    });

    if (!file) {
      return false;
    }

    return this.isFolderDescendantOf(file.folderId, ancestorFolderId);
  }
}
