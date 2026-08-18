import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
  validateSync,
} from "class-validator";
import { plainToInstance } from "class-transformer";

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  @Matches(/^postgres(ql)?:\/\//)
  DATABASE_URL!: string;

  @IsUrl({ require_tld: false })
  FRONTEND_URL!: string;

  @IsString()
  @IsNotEmpty()
  AUTH_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_BUCKET!: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_REGION!: string;

  @IsUrl({ require_tld: false })
  STORAGE_ENDPOINT!: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_ACCESS_KEY!: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_SECRET_KEY!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  PORT?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  UPLOAD_URL_TTL_SECONDS?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  READ_URL_TTL_SECONDS?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  MAX_FILE_SIZE_BYTES?: number;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
