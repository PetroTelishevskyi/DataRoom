-- CreateEnum
CREATE TYPE "FolderKind" AS ENUM ('ROOT', 'NORMAL');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('UPLOADING', 'READY');

-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('USER', 'PUBLIC_LINK');

-- CreateEnum
CREATE TYPE "ShareRole" AS ENUM ('VIEWER', 'EDITOR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "kind" "FolderKind" NOT NULL DEFAULT 'NORMAL',
    "dataRoomId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "status" "FileStatus" NOT NULL DEFAULT 'UPLOADING',
    "dataRoomId" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "uploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shares" (
    "id" TEXT NOT NULL,
    "type" "ShareType" NOT NULL,
    "role" "ShareRole" NOT NULL DEFAULT 'VIEWER',
    "dataRoomId" TEXT,
    "folderId" TEXT,
    "fileId" TEXT,
    "recipientUserId" TEXT,
    "publicToken" TEXT,
    "createdById" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "data_rooms_ownerId_idx" ON "data_rooms"("ownerId");

-- CreateIndex
CREATE INDEX "folders_dataRoomId_parentId_idx" ON "folders"("dataRoomId", "parentId");

-- CreateIndex
CREATE INDEX "folders_parentId_nameKey_id_idx" ON "folders"("parentId", "nameKey", "id");

-- CreateIndex
CREATE UNIQUE INDEX "folders_id_dataRoomId_key" ON "folders"("id", "dataRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "folders_parentId_nameKey_key" ON "folders"("parentId", "nameKey");

-- CreateIndex
CREATE UNIQUE INDEX "files_storageKey_key" ON "files"("storageKey");

-- CreateIndex
CREATE INDEX "files_folderId_nameKey_id_idx" ON "files"("folderId", "nameKey", "id");

-- CreateIndex
CREATE INDEX "files_dataRoomId_nameKey_id_idx" ON "files"("dataRoomId", "nameKey", "id");

-- CreateIndex
CREATE INDEX "files_dataRoomId_nameKey_idx" ON "files"("dataRoomId", "nameKey");

-- CreateIndex
CREATE UNIQUE INDEX "files_folderId_nameKey_key" ON "files"("folderId", "nameKey");

-- CreateIndex
CREATE UNIQUE INDEX "shares_publicToken_key" ON "shares"("publicToken");

-- CreateIndex
CREATE INDEX "shares_recipientUserId_revokedAt_idx" ON "shares"("recipientUserId", "revokedAt");

-- CreateIndex
CREATE INDEX "shares_dataRoomId_idx" ON "shares"("dataRoomId");

-- CreateIndex
CREATE INDEX "shares_folderId_idx" ON "shares"("folderId");

-- CreateIndex
CREATE INDEX "shares_fileId_idx" ON "shares"("fileId");

-- CreateIndex
CREATE INDEX "shares_createdById_idx" ON "shares"("createdById");

-- AddForeignKey
ALTER TABLE "data_rooms" ADD CONSTRAINT "data_rooms_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_dataRoomId_fkey" FOREIGN KEY ("dataRoomId") REFERENCES "data_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_dataRoomId_fkey" FOREIGN KEY ("parentId", "dataRoomId") REFERENCES "folders"("id", "dataRoomId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folderId_dataRoomId_fkey" FOREIGN KEY ("folderId", "dataRoomId") REFERENCES "folders"("id", "dataRoomId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_dataRoomId_fkey" FOREIGN KEY ("dataRoomId") REFERENCES "data_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_dataRoomId_fkey" FOREIGN KEY ("dataRoomId") REFERENCES "data_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================
-- Folder invariants
-- =========================================================

ALTER TABLE "folders"
ADD CONSTRAINT "folders_kind_parent_check"
CHECK (
  (
    "kind" = 'ROOT'
    AND "parentId" IS NULL
  )
  OR
  (
    "kind" = 'NORMAL'
    AND "parentId" IS NOT NULL
  )
);

CREATE UNIQUE INDEX "folders_one_root_per_data_room"
ON "folders" ("dataRoomId")
WHERE "kind" = 'ROOT';

-- =========================================================
-- Share target invariant
-- =========================================================

ALTER TABLE "shares"
ADD CONSTRAINT "shares_exactly_one_resource_check"
CHECK (
  num_nonnulls(
    "dataRoomId",
    "folderId",
    "fileId"
  ) = 1
);

-- =========================================================
-- Share type invariant
-- =========================================================

ALTER TABLE "shares"
ADD CONSTRAINT "shares_type_fields_check"
CHECK (
  (
    "type" = 'USER'
    AND "recipientUserId" IS NOT NULL
    AND "publicToken" IS NULL
  )
  OR
  (
    "type" = 'PUBLIC_LINK'
    AND "recipientUserId" IS NULL
    AND "publicToken" IS NOT NULL
  )
);

-- =========================================================
-- Public links are read-only
-- =========================================================

ALTER TABLE "shares"
ADD CONSTRAINT "public_share_viewer_only_check"
CHECK (
  "type" != 'PUBLIC_LINK'
  OR "role" = 'VIEWER'
);
