export const configuration = () => ({
  port: Number(process.env.PORT ?? 3000),
  frontendUrl: process.env.FRONTEND_URL,
  databaseUrl: process.env.DATABASE_URL,
  authSecret: process.env.AUTH_SECRET,
  storage: {
    blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN,
  },
  uploadUrlTtlSeconds: Number(process.env.UPLOAD_URL_TTL_SECONDS ?? 600),
  readUrlTtlSeconds: Number(process.env.READ_URL_TTL_SECONDS ?? 300),
  maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_BYTES ?? 104857600),
});
