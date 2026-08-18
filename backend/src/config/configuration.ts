export const configuration = () => ({
  port: Number(process.env.PORT ?? 3000),
  frontendUrl: process.env.FRONTEND_URL,
  databaseUrl: process.env.DATABASE_URL,
  authSecret: process.env.AUTH_SECRET,
  storage: {
    bucket: process.env.STORAGE_BUCKET,
    region: process.env.STORAGE_REGION,
    endpoint: process.env.STORAGE_ENDPOINT,
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
  },
  uploadUrlTtlSeconds: Number(process.env.UPLOAD_URL_TTL_SECONDS ?? 600),
  readUrlTtlSeconds: Number(process.env.READ_URL_TTL_SECONDS ?? 300),
  maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_BYTES ?? 104857600),
});
