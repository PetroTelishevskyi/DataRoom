import { IsIn, IsUUID } from "class-validator";

export class ListResourceSharesDto {
  @IsIn(["DATA_ROOM", "FOLDER", "FILE"])
  resourceType!: "DATA_ROOM" | "FOLDER" | "FILE";

  @IsUUID()
  resourceId!: string;
}
