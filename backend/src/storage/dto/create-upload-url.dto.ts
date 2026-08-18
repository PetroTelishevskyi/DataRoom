import { Transform } from "class-transformer";
import { IsInt, IsString, Matches, Max, MaxLength, Min } from "class-validator";

export class CreateUploadUrlDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(1024)
  key!: string;

  @IsString()
  @Matches(/^application\/pdf$/)
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(104857600)
  contentLength!: number;
}
