import { Transform } from "class-transformer";
import {
  IsString,
  MaxLength,
  MinLength,
  NotContains,
} from "class-validator";

export class CreateFolderDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @NotContains("\u0000")
  name!: string;
}
