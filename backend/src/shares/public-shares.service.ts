import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { FileStatus, FolderKind, ShareType } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { ResourceQueryService } from "../resource-query/resource-query.service";
import { StorageService } from "../storage/storage.service";
import type { ShareResource } from "./share.mapper";

export type PublicShareContext = {
  shareId: string;
  publicToken: string;
  resource: ShareResource;
};

type PublicShareRow = {
  id: string;
  publicToken: string | null;
  dataRoomId: string | null;
  folderId: string | null;
  fileId: string | null;
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
  kind: string;
  parentId: string | null;
  dataRoomId: string;
};

@Injectable()
export class PublicSharesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resourceQuery: ResourceQueryService,
    private readonly storageService: StorageService,
  ) {}

  async resolvePublicShare(token: string): Promise<PublicShareContext> {
    const share = await this.prisma.share.findFirst({
      where: {
        publicToken: token,
        revokedAt: null,
        type: ShareType.PUBLIC_LINK,
      },
      select: {
        id: true,
        publicToken: true,
        dataRoomId: true,
        folderId: true,
        fileId: true,
      },
    });

    if (!share?.publicToken) {
      throw new NotFoundException();
    }

    return {
      shareId: share.id,
      publicToken: share.publicToken,
      resource: this.toPublicShareResource(share),
    };
  }

  async getPublicShareRoot(token: string) {
    const context = await this.resolvePublicShare(token);

    if (context.resource.type === "DATA_ROOM") {
      return this.getPublicDataRoomRootContents(context.resource.id);
    }

    if (context.resource.type === "FOLDER") {
      return this.getPublicFolderContents({
        context,
        folderId: context.resource.id,
        scopeRootFolderId: context.resource.id,
      });
    }

    const file = await this.prisma.file.findFirst({
      where: {
        id: context.resource.id,
        status: FileStatus.READY,
      },
      select: {
        id: true,
        name: true,
        dataRoomId: true,
        folderId: true,
        updatedAt: true,
      },
    });

    if (!file) {
      throw new NotFoundException();
    }

    return {
      resource: {
        type: "FILE",
        id: file.id,
        name: file.name,
        dataRoomId: file.dataRoomId,
        folderId: file.folderId,
        updatedAt: file.updatedAt,
      },
      access: {
        role: "VIEWER",
      },
    };
  }

  async getPublicFolderByToken(token: string, folderId: string) {
    const context = await this.resolvePublicShare(token);

    await this.assertCanReadFolder(context, folderId);

    return this.getPublicFolderContents({
      context,
      folderId,
      scopeRootFolderId:
        context.resource.type === "FOLDER" ? context.resource.id : null,
    });
  }

  async requestPublicFileViewUrl(token: string, fileId: string) {
    const context = await this.resolvePublicShare(token);

    await this.assertCanReadFile(context, fileId);

    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
        status: FileStatus.READY,
      },
      select: {
        storageKey: true,
      },
    });

    if (!file) {
      throw new NotFoundException();
    }

    return this.storageService.createReadUrl({
      key: file.storageKey,
    });
  }

  async assertCanReadDataRoom(
    context: PublicShareContext,
    dataRoomId: string,
  ): Promise<void> {
    if (context.resource.type !== "DATA_ROOM") {
      throw new NotFoundException();
    }

    const dataRoom = await this.resourceQuery.getDataRoom(dataRoomId);

    if (!dataRoom || dataRoom.id !== context.resource.id) {
      throw new NotFoundException();
    }
  }

  async assertCanReadFolder(
    context: PublicShareContext,
    folderId: string,
  ): Promise<void> {
    const folder = await this.resourceQuery.getFolderWithRoom(folderId);

    if (!folder) {
      throw new NotFoundException();
    }

    if (
      context.resource.type === "DATA_ROOM" &&
      folder.dataRoomId === context.resource.id
    ) {
      return;
    }

    if (
      context.resource.type === "FOLDER" &&
      (await this.resourceQuery.isFolderDescendantOf(
        folder.id,
        context.resource.id,
      ))
    ) {
      return;
    }

    throw new NotFoundException();
  }

  async assertCanReadFile(
    context: PublicShareContext,
    fileId: string,
  ): Promise<void> {
    const file = await this.resourceQuery.getFileWithRoom(fileId);

    if (!file) {
      throw new NotFoundException();
    }

    if (
      context.resource.type === "DATA_ROOM" &&
      file.dataRoomId === context.resource.id
    ) {
      return;
    }

    if (
      context.resource.type === "FOLDER" &&
      (await this.resourceQuery.isFileInsideFolder(file.id, context.resource.id))
    ) {
      return;
    }

    if (context.resource.type === "FILE" && file.id === context.resource.id) {
      return;
    }

    throw new NotFoundException();
  }

  private toPublicShareResource(share: PublicShareRow): ShareResource {
    if (share.dataRoomId) {
      return {
        type: "DATA_ROOM",
        id: share.dataRoomId,
      };
    }

    if (share.folderId) {
      return {
        type: "FOLDER",
        id: share.folderId,
      };
    }

    if (share.fileId) {
      return {
        type: "FILE",
        id: share.fileId,
      };
    }

    throw new NotFoundException();
  }

  private async getPublicDataRoomRootContents(dataRoomId: string) {
    const dataRoom = await this.prisma.dataRoom.findUnique({
      where: {
        id: dataRoomId,
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

    const contents = await this.getFolderChildren(rootFolder.id);

    return {
      resource: {
        type: "DATA_ROOM",
        id: dataRoom.id,
        name: dataRoom.name,
      },
      folder: null,
      breadcrumbs: [],
      items: contents,
      pageInfo: {
        nextCursor: null,
        hasNextPage: false,
      },
      access: {
        role: "VIEWER",
      },
    };
  }

  private async getPublicFolderContents(params: {
    context: PublicShareContext;
    folderId: string;
    scopeRootFolderId: string | null;
  }) {
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

    const [items, breadcrumbs] = await Promise.all([
      this.getFolderChildren(folder.id),
      this.getScopedBreadcrumbs(folder, params.scopeRootFolderId),
    ]);

    return {
      resource: params.context.resource,
      folder: {
        id: folder.id,
        name: folder.name,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      },
      breadcrumbs,
      items,
      pageInfo: {
        nextCursor: null,
        hasNextPage: false,
      },
      access: {
        role: "VIEWER",
      },
    };
  }

  private async getFolderChildren(
    folderId: string,
  ): Promise<Array<FolderItem | FileItem>> {
    const [folders, files] = await Promise.all([
      this.prisma.folder.findMany({
        where: {
          parentId: folderId,
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
          folderId,
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
    ]);

    return [
      ...folders.map((folder): FolderItem => ({
        type: "FOLDER",
        id: folder.id,
        name: folder.name,
        updatedAt: folder.updatedAt,
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
  }

  private async getScopedBreadcrumbs(
    folder: FolderBreadcrumbNode,
    scopeRootFolderId: string | null,
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

      if (
        !currentFolder.parentId ||
        (scopeRootFolderId && currentFolder.id === scopeRootFolderId)
      ) {
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
}
