declare class EnvironmentVariables {
    DATABASE_URL: string;
    FRONTEND_URL: string;
    AUTH_SECRET: string;
    STORAGE_BUCKET: string;
    STORAGE_REGION: string;
    STORAGE_ENDPOINT: string;
    STORAGE_ACCESS_KEY: string;
    STORAGE_SECRET_KEY: string;
    PORT?: number;
    UPLOAD_URL_TTL_SECONDS?: number;
    READ_URL_TTL_SECONDS?: number;
    MAX_FILE_SIZE_BYTES?: number;
}
export declare function validateEnv(config: Record<string, unknown>): EnvironmentVariables;
export {};
