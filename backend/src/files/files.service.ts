import { randomUUID } from "node:crypto";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppError } from "../common/errors/app-error";
import {
  hasControlCharacters,
  normalizeResourceName,
} from "../common/resources/resource-name";
import { FileStatus, FolderKind } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

type InitiateRootUploadParams = {
  dataRoomId: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
  userId: string;
};

type InitiateFolderUploadParams = {
  folderId: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
  userId: string;
};

type InitiateUploadParams = {
  dataRoomId: string;
  folderId: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
};

type FileQuery = {
  fileId: string;
  userId: string;
};

type RenameFileParams = FileQuery & {
  name: string;
};

type FileUploadSummary = {
  id: string;
  name: string;
  status: FileStatus;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPrismaUniqueError(error: unknown): boolean {
  return isRecord(error) && error.code === "P2002";
}

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async initiateRootUpload(params: InitiateRootUploadParams) {
    const rootFolder = await this.prisma.folder.findFirst({
      where: {
        dataRoomId: params.dataRoomId,
        kind: FolderKind.ROOT,
        dataRoom: {
          ownerId: params.userId,
        },
      },
      select: {
        dataRoomId: true,
        id: true,
      },
    });

    if (!rootFolder) {
      throw new NotFoundException();
    }

    return this.initiateUpload({
      dataRoomId: rootFolder.dataRoomId,
      folderId: rootFolder.id,
      mimeType: params.mimeType,
      name: params.name,
      sizeBytes: params.sizeBytes,
    });
  }

  async initiateFolderUpload(params: InitiateFolderUploadParams) {
    const folder = await this.prisma.folder.findFirst({
      where: {
        id: params.folderId,
        kind: FolderKind.NORMAL,
        dataRoom: {
          ownerId: params.userId,
        },
      },
      select: {
        dataRoomId: true,
        id: true,
      },
    });

    if (!folder) {
      throw new NotFoundException();
    }

    return this.initiateUpload({
      dataRoomId: folder.dataRoomId,
      folderId: folder.id,
      mimeType: params.mimeType,
      name: params.name,
      sizeBytes: params.sizeBytes,
    });
  }

  async requestUploadUrl(params: FileQuery) {
    const file = await this.prisma.file.findFirst({
      where: {
        id: params.fileId,
        status: FileStatus.UPLOADING,
        dataRoom: {
          ownerId: params.userId,
        },
      },
      select: {
        id: true,
        mimeType: true,
        name: true,
        sizeBytes: true,
        status: true,
        storageKey: true,
      },
    });

    if (!file) {
      throw new NotFoundException();
    }

    const upload = await this.storageService.createUploadUrl({
      contentLength: file.sizeBytes,
      contentType: file.mimeType,
      key: file.storageKey,
    });

    return {
      file: this.toFileUploadSummary(file),
      upload,
    };
  }

  async completeUpload(params: FileQuery): Promise<FileUploadSummary> {
    const file = await this.prisma.file.findFirst({
      where: {
        id: params.fileId,
        dataRoom: {
          ownerId: params.userId,
        },
      },
      select: {
        id: true,
        mimeType: true,
        name: true,
        sizeBytes: true,
        status: true,
        storageKey: true,
      },
    });

    if (!file) {
      throw new NotFoundException();
    }

    if (file.status === FileStatus.READY) {
      return this.toFileUploadSummary(file);
    }

    const object = await this.storageService.headObject(file.storageKey);

    if (!object) {
      throw new AppError(
        "UPLOAD_NOT_COMPLETE",
        HttpStatus.CONFLICT,
        "Upload has not completed.",
      );
    }

    if (object.sizeBytes !== file.sizeBytes) {
      throw new AppError(
        "UPLOAD_SIZE_MISMATCH",
        HttpStatus.CONFLICT,
        "Uploaded object size does not match the expected file size.",
      );
    }

    if (object.contentType && object.contentType !== file.mimeType) {
      throw new AppError(
        "UPLOAD_FAILED",
        HttpStatus.CONFLICT,
        "Uploaded object metadata does not match the expected file type.",
      );
    }

    const updatedFile = await this.prisma.file.update({
      where: {
        id: file.id,
      },
      data: {
        status: FileStatus.READY,
        uploadedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    return this.toFileUploadSummary(updatedFile);
  }

  async requestViewUrl(params: FileQuery) {
    const file = await this.prisma.file.findFirst({
      where: {
        id: params.fileId,
        status: FileStatus.READY,
        dataRoom: {
          ownerId: params.userId,
        },
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

  async renameFile(params: RenameFileParams): Promise<FileUploadSummary> {
    const name = this.validateFileName(params.name);
    const file = await this.prisma.file.findFirst({
      where: {
        id: params.fileId,
        dataRoom: {
          ownerId: params.userId,
        },
      },
      select: {
        folderId: true,
        id: true,
      },
    });

    if (!file) {
      throw new NotFoundException();
    }

    const nameKey = normalizeResourceName(name);
    const duplicateFile = await this.prisma.file.findFirst({
      where: {
        folderId: file.folderId,
        id: {
          not: file.id,
        },
        nameKey,
      },
      select: {
        id: true,
      },
    });

    if (duplicateFile) {
      this.throwFileNameConflict();
    }

    try {
      const updatedFile = await this.prisma.file.update({
        where: {
          id: file.id,
        },
        data: {
          name,
          nameKey,
        },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      return this.toFileUploadSummary(updatedFile);
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        this.throwFileNameConflict();
      }

      throw error;
    }
  }

  async cancelUpload(params: FileQuery): Promise<void> {
    const file = await this.prisma.file.findFirst({
      where: {
        id: params.fileId,
        status: FileStatus.UPLOADING,
        dataRoom: {
          ownerId: params.userId,
        },
      },
      select: {
        id: true,
        storageKey: true,
      },
    });

    if (!file) {
      throw new NotFoundException();
    }

    await this.prisma.file.delete({
      where: {
        id: file.id,
      },
    });
    await this.storageService.deleteObject(file.storageKey).catch(() => {});
  }

  async deleteFile(params: FileQuery): Promise<void> {
    const file = await this.prisma.file.findFirst({
      where: {
        id: params.fileId,
        dataRoom: {
          ownerId: params.userId,
        },
      },
      select: {
        id: true,
        storageKey: true,
      },
    });

    if (!file) {
      throw new NotFoundException();
    }

    await this.prisma.file.delete({
      where: {
        id: file.id,
      },
    });
    await this.storageService.deleteObject(file.storageKey).catch(() => {});
  }

  private async initiateUpload(params: InitiateUploadParams) {
    const name = this.validateFileName(params.name);
    this.validateUpload(params.mimeType, params.sizeBytes);

    const nameKey = normalizeResourceName(name);
    const duplicateFile = await this.prisma.file.findFirst({
      where: {
        folderId: params.folderId,
        nameKey,
      },
      select: {
        id: true,
      },
    });

    if (duplicateFile) {
      this.throwFileNameConflict();
    }

    const fileId = randomUUID();
    const storageKey = `data-rooms/${params.dataRoomId}/files/${fileId}.pdf`;

    try {
      const file = await this.prisma.file.create({
        data: {
          dataRoomId: params.dataRoomId,
          folderId: params.folderId,
          id: fileId,
          mimeType: params.mimeType,
          name,
          nameKey,
          sizeBytes: BigInt(params.sizeBytes),
          status: FileStatus.UPLOADING,
          storageKey,
        },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });
      const upload = await this.storageService.createUploadUrl({
        contentLength: BigInt(params.sizeBytes),
        contentType: params.mimeType,
        key: storageKey,
      });

      return {
        file: this.toFileUploadSummary(file),
        upload,
      };
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        this.throwFileNameConflict();
      }

      await this.prisma.file.delete({ where: { id: fileId } }).catch(() => {});
      throw error;
    }
  }

  private toFileUploadSummary(file: FileUploadSummary): FileUploadSummary {
    return {
      id: file.id,
      name: file.name,
      status: file.status,
    };
  }

  private validateFileName(name: string): string {
    const normalizedName = name.normalize("NFKC").trim();

    if (
      normalizedName.length < 1 ||
      normalizedName.length > 255 ||
      hasControlCharacters(normalizedName) ||
      !normalizedName.toLocaleLowerCase("en-US").endsWith(".pdf")
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        HttpStatus.BAD_REQUEST,
        "Request validation failed.",
      );
    }

    return normalizedName;
  }

  private validateUpload(mimeType: string, sizeBytes: number): void {
    const maxFileSizeBytes = this.configService.get<number>(
      "maxFileSizeBytes",
      104857600,
    );

    if (
      mimeType !== "application/pdf" ||
      !Number.isInteger(sizeBytes) ||
      sizeBytes < 1 ||
      sizeBytes > maxFileSizeBytes
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        HttpStatus.BAD_REQUEST,
        "Request validation failed.",
      );
    }
  }

  private throwFileNameConflict(): never {
    throw new AppError(
      "FILE_NAME_CONFLICT",
      HttpStatus.CONFLICT,
      "A file with this name already exists in this folder.",
    );
  }
}
