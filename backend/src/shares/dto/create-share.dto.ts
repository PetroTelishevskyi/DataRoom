import { Type } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsUUID,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";

class ShareResourceDto {
  @IsIn(["DATA_ROOM", "FOLDER", "FILE"])
  type!: "DATA_ROOM" | "FOLDER" | "FILE";

  @IsUUID()
  id!: string;
}

export class CreateShareDto {
  @IsIn(["USER", "PUBLIC_LINK"])
  type!: "USER" | "PUBLIC_LINK";

  @ValidateNested()
  @Type(() => ShareResourceDto)
  resource!: ShareResourceDto;

  @ValidateIf((dto: CreateShareDto) => dto.type === "USER")
  @IsEmail()
  @MaxLength(255)
  recipientEmail?: string;

  @ValidateIf((dto: CreateShareDto) => dto.type === "USER")
  @IsIn(["VIEWER"])
  role?: "VIEWER";
}
