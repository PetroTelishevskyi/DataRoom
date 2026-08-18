export declare const configuration: () => {
    port: number;
    frontendUrl: string | undefined;
    databaseUrl: string | undefined;
    authSecret: string | undefined;
    storage: {
        bucket: string | undefined;
        region: string | undefined;
        endpoint: string | undefined;
        accessKey: string | undefined;
        secretKey: string | undefined;
    };
    uploadUrlTtlSeconds: number;
    readUrlTtlSeconds: number;
    maxFileSizeBytes: number;
};
