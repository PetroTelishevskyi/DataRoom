import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { FolderKind } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";

type DataRoomQuery = {
  dataRoomId: string;
  userId: string;
};

type DataRoomSummary = {
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

function toDataRoomSummary(dataRoom: DataRoomSummary): DataRoomSummary {
  return {
    id: dataRoom.id,
    name: dataRoom.name,
    createdAt: dataRoom.createdAt,
    updatedAt: dataRoom.updatedAt,
  };
}

@Injectable()
export class DataRoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForOwner(userId: string): Promise<DataRoomSummary[]> {
    const dataRooms = await this.prisma.dataRoom.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return dataRooms.map(toDataRoomSummary);
  }

  async getOwnedDataRoom(params: DataRoomQuery): Promise<DataRoomSummary> {
    const dataRoom = await this.prisma.dataRoom.findFirst({
      where: {
        id: params.dataRoomId,
        ownerId: params.userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dataRoom) {
      throw new NotFoundException();
    }

    return toDataRoomSummary(dataRoom);
  }

  async getRootContents(params: DataRoomQuery) {
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

    const [folders, files] = await Promise.all([
      this.prisma.folder.findMany({
        where: {
          parentId: rootFolder.id,
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
          folderId: rootFolder.id,
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

    const items: Array<FolderItem | FileItem> = [
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

    return {
      folder: null,
      breadcrumbs: [],
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
}
