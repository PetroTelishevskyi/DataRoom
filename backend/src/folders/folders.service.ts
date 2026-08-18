import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { AuthorizationService } from "../authorization/authorization.service";
import { AppError } from "../common/errors/app-error";
import {
  hasControlCharacters,
  normalizeResourceName,
} from "../common/resources/resource-name";
import { FileStatus, FolderKind } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";

type FolderQuery = {
  folderId: string;
  userId: string;
};

type CreateRootFolderParams = {
  dataRoomId: string;
  name: string;
  userId: string;
};

type CreateChildFolderParams = {
  name: string;
  parentFolderId: string;
  userId: string;
};

type RenameFolderParams = {
  folderId: string;
  name: string;
  userId: string;
};

type DataRoomQuery = {
  dataRoomId: string;
  userId: string;
};

type DeletionPreview = {
  fileCount: number;
  folderCount: number;
  totalSizeBytes: number;
};

type DeletionPreviewRow = {
  fileCount: bigint;
  folderCount: bigint;
  totalSizeBytes: bigint;
};

type FolderSummary = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type FolderItem = {
  type: "FOLDER";
  id: string;
  name: string;
  updatedAt: Date;
};

type FileItem = {
  type: "FILE";
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  status: string;
  updatedAt: Date;
};

type BreadcrumbItem = {
  id: string;
  name: string;
};

export type FolderTreeNode = {
  type: "FOLDER";
  id: string;
  name: string;
  children: FolderTreeNode[];
};

export type FolderTreeRoot = {
  type: "DATA_ROOM_ROOT";
  id: string;
  name: string;
  children: FolderTreeNode[];
};

type FolderBreadcrumbNode = {
  id: string;
  name: string;
  kind: FolderKind;
  parentId: string | null;
  dataRoomId: string;
};

function toFolderSummary(folder: FolderSummary): FolderSummary {
  return {
    id: folder.id,
    name: folder.name,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPrismaUniqueError(error: unknown): boolean {
  return isRecord(error) && error.code === "P2002";
}

function isPrismaNotFoundError(error: unknown): boolean {
  return isRecord(error) && error.code === "P2025";
}

@Injectable()
export class FoldersService {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly prisma: PrismaService,
  ) {}

  async createRootFolder(params: CreateRootFolderParams) {
    const name = this.validateFolderName(params.name);
    await this.authorizationService.assertOwnsDataRoom(
      params.userId,
      params.dataRoomId,
    );

    const dataRoom = await this.prisma.dataRoom.findUnique({
      where: {
        id: params.dataRoomId,
      },
      select: {
        id: true,
        folders: {
          where: {
            kind: FolderKind.ROOT,
          },
          take: 2,
          select: {
            id: true,
          },
        },
      },
    });

    if (!dataRoom) {
      throw new NotFoundException();
    }

    const [rootFolder] = dataRoom.folders;

    if (dataRoom.folders.length !== 1 || !rootFolder) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Data Room bootstrap invariant failed.",
      });
    }

    return this.createFolder({
      dataRoomId: dataRoom.id,
      name,
      parentId: rootFolder.id,
    });
  }

  async createChildFolder(params: CreateChildFolderParams) {
    const name = this.validateFolderName(params.name);
    await this.authorizationService.assertOwnsFolder(
      params.userId,
      params.parentFolderId,
    );

    const parentFolder = await this.prisma.folder.findFirst({
      where: {
        id: params.parentFolderId,
        kind: FolderKind.NORMAL,
      },
      select: {
        id: true,
        dataRoomId: true,
      },
    });

    if (!parentFolder) {
      throw new NotFoundException();
    }

    return this.createFolder({
      dataRoomId: parentFolder.dataRoomId,
      name,
      parentId: parentFolder.id,
    });
  }

  async getFolderContents(params: FolderQuery) {
    const access = await this.authorizationService.resolveFolderReadAccess(
      params.userId,
      params.folderId,
    );

    const folder = await this.prisma.folder.findFirst({
      where: {
        id: params.folderId,
        kind: FolderKind.NORMAL,
      },
      select: {
        id: true,
        name: true,
        kind: true,
        parentId: true,
        dataRoomId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!folder) {
      throw new NotFoundException();
    }

    const [folders, files, breadcrumbs] = await Promise.all([
      this.prisma.folder.findMany({
        where: {
          parentId: folder.id,
          kind: FolderKind.NORMAL,
        },
        orderBy: [{ nameKey: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
      }),
      this.prisma.file.findMany({
        where: {
          folderId: folder.id,
          status: FileStatus.READY,
        },
        orderBy: [{ nameKey: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          sizeBytes: true,
          mimeType: true,
          status: true,
          updatedAt: true,
        },
      }),
      this.getBreadcrumbs(folder),
    ]);

    const items: Array<FolderItem | FileItem> = [
      ...folders.map((childFolder): FolderItem => ({
        type: "FOLDER",
        id: childFolder.id,
        name: childFolder.name,
        updatedAt: childFolder.updatedAt,
      })),
      ...files.map((file): FileItem => ({
        type: "FILE",
        id: file.id,
        name: file.name,
        sizeBytes: Number(file.sizeBytes),
        mimeType: file.mimeType,
        status: file.status,
        updatedAt: file.updatedAt,
      })),
    ];

    return {
      folder: toFolderSummary(folder),
      breadcrumbs,
      items,
      pageInfo: {
        nextCursor: null,
        hasNextPage: false,
      },
      access: {
        role: access.role,
      },
    };
  }

  async renameFolder(params: RenameFolderParams) {
    const name = this.validateFolderName(params.name);
    await this.authorizationService.assertOwnsFolder(
      params.userId,
      params.folderId,
    );

    const folder = await this.prisma.folder.findFirst({
      where: {
        id: params.folderId,
        kind: FolderKind.NORMAL,
      },
      select: {
        id: true,
        parentId: true,
      },
    });

    if (!folder || !folder.parentId) {
      throw new NotFoundException();
    }

    const nameKey = normalizeResourceName(name);
    const duplicateFolder = await this.prisma.folder.findFirst({
      where: {
        id: {
          not: folder.id,
        },
        parentId: folder.parentId,
        nameKey,
      },
      select: {
        id: true,
      },
    });

    if (duplicateFolder) {
      this.throwFolderNameConflict();
    }

    try {
      const updatedFolder = await this.prisma.folder.update({
        where: {
          id: folder.id,
        },
        data: {
          name,
          nameKey,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return toFolderSummary(updatedFolder);
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        this.throwFolderNameConflict();
      }

      throw error;
    }
  }

  async getDeletionPreview(params: FolderQuery): Promise<DeletionPreview> {
    await this.authorizationService.assertOwnsFolder(
      params.userId,
      params.folderId,
    );

    const [preview] = await this.prisma.$queryRaw<DeletionPreviewRow[]>`
      WITH RECURSIVE "subtree" AS (
        SELECT "folders"."id"
        FROM "folders"
        INNER JOIN "data_rooms"
          ON "data_rooms"."id" = "folders"."dataRoomId"
        WHERE "folders"."id" = ${params.folderId}
          AND "folders"."kind" = 'NORMAL'
          AND "data_rooms"."ownerId" = ${params.userId}

        UNION ALL

        SELECT "child"."id"
        FROM "folders" AS "child"
        INNER JOIN "subtree"
          ON "child"."parentId" = "subtree"."id"
        WHERE "child"."kind" = 'NORMAL'
      )
      SELECT
        (SELECT COUNT(*) FROM "subtree")::bigint AS "folderCount",
        (SELECT COUNT(*)
          FROM "files"
          WHERE "files"."folderId" IN (SELECT "id" FROM "subtree")
        )::bigint AS "fileCount",
        COALESCE(
          (SELECT SUM("files"."sizeBytes")
            FROM "files"
            WHERE "files"."folderId" IN (SELECT "id" FROM "subtree")
          ),
          0
        )::bigint AS "totalSizeBytes";
    `;

    if (!preview || preview.folderCount === 0n) {
      throw new NotFoundException();
    }

    return {
      fileCount: Number(preview.fileCount),
      folderCount: Number(preview.folderCount),
      totalSizeBytes: Number(preview.totalSizeBytes),
    };
  }

  async getFolderTree(params: DataRoomQuery): Promise<{ root: FolderTreeRoot }> {
    await this.authorizationService.assertOwnsDataRoom(
      params.userId,
      params.dataRoomId,
    );

    const dataRoom = await this.prisma.dataRoom.findUnique({
      where: {
        id: params.dataRoomId,
      },
      select: {
        id: true,
        name: true,
        folders: {
          where: {
            kind: FolderKind.ROOT,
          },
          take: 2,
          select: {
            id: true,
          },
        },
      },
    });

    if (!dataRoom) {
      throw new NotFoundException();
    }

    const [rootFolder] = dataRoom.folders;

    if (dataRoom.folders.length !== 1 || !rootFolder) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Data Room bootstrap invariant failed.",
      });
    }

    const folders = await this.prisma.folder.findMany({
      where: {
        dataRoomId: dataRoom.id,
        kind: FolderKind.NORMAL,
      },
      orderBy: [{ nameKey: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    const nodesById = new Map<string, FolderTreeNode>();

    for (const folder of folders) {
      nodesById.set(folder.id, {
        type: "FOLDER",
        id: folder.id,
        name: folder.name,
        children: [],
      });
    }

    const root: FolderTreeRoot = {
      type: "DATA_ROOM_ROOT",
      id: dataRoom.id,
      name: dataRoom.name,
      children: [],
    };

    for (const folder of folders) {
      const node = nodesById.get(folder.id);

      if (!node) {
        continue;
      }

      if (folder.parentId === rootFolder.id) {
        root.children.push(node);
        continue;
      }

      const parentNode = folder.parentId
        ? nodesById.get(folder.parentId)
        : undefined;

      if (parentNode) {
        parentNode.children.push(node);
      }
    }

    return {
      root,
    };
  }

  async deleteFolder(params: FolderQuery): Promise<void> {
    await this.authorizationService.assertOwnsFolder(
      params.userId,
      params.folderId,
    );

    const folder = await this.prisma.folder.findFirst({
      where: {
        id: params.folderId,
        kind: FolderKind.NORMAL,
      },
      select: {
        id: true,
      },
    });

    if (!folder) {
      throw new NotFoundException();
    }

    try {
      await this.prisma.folder.delete({
        where: {
          id: folder.id,
        },
      });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException();
      }

      throw error;
    }
  }

  private async createFolder(params: {
    dataRoomId: string;
    name: string;
    parentId: string;
  }) {
    const nameKey = normalizeResourceName(params.name);
    const duplicateFolder = await this.prisma.folder.findFirst({
      where: {
        parentId: params.parentId,
        nameKey,
      },
      select: {
        id: true,
      },
    });

    if (duplicateFolder) {
      this.throwFolderNameConflict();
    }

    try {
      const folder = await this.prisma.folder.create({
        data: {
          dataRoomId: params.dataRoomId,
          kind: FolderKind.NORMAL,
          name: params.name,
          nameKey,
          parentId: params.parentId,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return toFolderSummary(folder);
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        this.throwFolderNameConflict();
      }

      throw error;
    }
  }

  private async getBreadcrumbs(
    folder: FolderBreadcrumbNode,
  ): Promise<BreadcrumbItem[]> {
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentFolder: FolderBreadcrumbNode | null = folder;

    while (currentFolder) {
      if (currentFolder.kind === FolderKind.NORMAL) {
        breadcrumbs.push({
          id: currentFolder.id,
          name: currentFolder.name,
        });
      }

      if (!currentFolder.parentId) {
        break;
      }

      currentFolder = await this.prisma.folder.findFirst({
        where: {
          id: currentFolder.parentId,
          dataRoomId: folder.dataRoomId,
        },
        select: {
          id: true,
          name: true,
          kind: true,
          parentId: true,
          dataRoomId: true,
        },
      });
    }

    return breadcrumbs.reverse();
  }

  private validateFolderName(name: string): string {
    const normalizedName = name.normalize("NFKC").trim();

    if (
      normalizedName.length < 1 ||
      normalizedName.length > 255 ||
      hasControlCharacters(normalizedName)
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        HttpStatus.BAD_REQUEST,
        "Request validation failed.",
      );
    }

    return normalizedName;
  }

  private throwFolderNameConflict(): never {
    throw new AppError(
      "FOLDER_NAME_CONFLICT",
      HttpStatus.CONFLICT,
      "A folder with this name already exists here.",
    );
  }
}
