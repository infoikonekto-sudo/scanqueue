import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'scanqueue_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  // Server
  server: {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiration: process.env.JWT_EXPIRATION || '24h',
  },

  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@scanqueue.local',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // QR
  qr: {
    size: parseInt(process.env.QR_SIZE || '200'),
    errorCorrection: process.env.QR_ERROR_CORRECTION || 'H',
  },

  // Rate Limiting
  rateLimiting: {
    maxScansPerSecond: parseInt(process.env.MAX_SCANS_PER_SECOND || '10'),
    duplicateScanTimeout: parseInt(process.env.DUPLICATE_SCAN_TIMEOUT || '30'),
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },

  // Socket.io
  socket: {
    port: parseInt(process.env.SOCKET_PORT || '3001'),
  },
};

export default config;
