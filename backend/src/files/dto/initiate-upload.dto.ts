import { Transform } from "class-transformer";
import { IsInt, IsString, Matches, MaxLength, Min } from "class-validator";

export class InitiateUploadDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(255)
  @Matches(/\.pdf$/i)
  name!: string;

  @IsString()
  @Matches(/^application\/pdf$/)
  mimeType!: string;

  @IsInt()
  @Min(1)
  sizeBytes!: number;
}
