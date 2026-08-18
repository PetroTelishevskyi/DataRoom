import { Type } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";

class ShareResourceDto {
  @IsIn(["DATA_ROOM", "FOLDER", "FILE"])
  type!: "DATA_ROOM" | "FOLDER" | "FILE";

  @IsUUID()
  id!: string;
}

export class CreateShareDto {
  @IsIn(["USER"])
  type!: "USER";

  @ValidateNested()
  @Type(() => ShareResourceDto)
  resource!: ShareResourceDto;

  @IsEmail()
  @MaxLength(255)
  recipientEmail!: string;

  @IsIn(["VIEWER"])
  role!: "VIEWER";
}
