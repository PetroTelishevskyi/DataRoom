import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { AppError } from "../common/errors/app-error";
import {
  hasControlCharacters,
  normalizeResourceName,
} from "../common/resources/resource-name";
import { FolderKind } from "../generated/prisma/enums";
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

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async createRootFolder(params: CreateRootFolderParams) {
    const name = this.validateFolderName(params.name);
    const dataRoom = await this.prisma.dataRoom.findFirst({
      where: {
        id: params.dataRoomId,
        ownerId: params.userId,
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
    const parentFolder = await this.prisma.folder.findFirst({
      where: {
        id: params.parentFolderId,
        kind: FolderKind.NORMAL,
        dataRoom: {
          ownerId: params.userId,
        },
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
    const folder = await this.prisma.folder.findFirst({
      where: {
        id: params.folderId,
        kind: FolderKind.NORMAL,
        dataRoom: {
          ownerId: params.userId,
        },
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
        role: "OWNER",
      },
    };
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
      throw new AppError(
        "FOLDER_NAME_CONFLICT",
        HttpStatus.CONFLICT,
        "A folder with this name already exists here.",
      );
    }

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
}
