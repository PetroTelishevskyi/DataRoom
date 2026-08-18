import { Type } from "class-transformer";
import { IsIn, IsUUID, ValidateNested } from "class-validator";

class MoveFileDestinationDto {
  @IsIn(["FOLDER", "DATA_ROOM_ROOT"])
  type!: "FOLDER" | "DATA_ROOM_ROOT";

  @IsUUID()
  id!: string;
}

export class MoveFileDto {
  @ValidateNested()
  @Type(() => MoveFileDestinationDto)
  destination!: MoveFileDestinationDto;
}
