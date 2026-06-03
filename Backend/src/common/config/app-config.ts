import * as dotenv from 'dotenv';
import { join } from 'path';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;
const envPath = join(process.cwd(), envFile);

// Load environment-specific file if it exists, otherwise fallback to default .env
dotenv.config({ path: envPath });
dotenv.config(); // Fallback for standard .env if specific one doesn't exist or is partial

export type RuntimeStage = 'dev' | 'prod';

export type RuntimeConfig = {
  stage: RuntimeStage;
  port: number;
  mongo: {
    uri: string;
    dbName: string;
  };
  cors: {
    origins: string[];
    credentials: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  aws: {
    region: string;
    s3Env: RuntimeStage;
  };
};

let cachedConfig: RuntimeConfig | null = null;

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return fallback;
};

const parseCsv = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const resolveStage = (): RuntimeStage => {
  const env = process.env.NODE_ENV?.trim().toLowerCase();
  if (env === 'prod' || env === 'production') return 'prod';
  return 'dev';
};

export const getRuntimeConfig = (): RuntimeConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const stage = resolveStage();

  const envCorsOrigins = parseCsv(process.env.CORS_ORIGINS);

  const port = parseNumber(process.env.PORT, 3000);

  const mongoUri =
    process.env.MONGOURL ??
    process.env.MONGO_URL ??
    process.env.MONGO_URI ??
    '';

  const mongoDb = process.env.MONGO_DB ?? 'Marketing_E';

  const jwtSecret = process.env.JWT_SECRET ?? 'JWT_SECRET';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

  const smtpHost = process.env.SMTP_HOST ?? '';
  const smtpPort = parseNumber(process.env.SMTP_PORT, 587);
  const smtpSecure = parseBoolean(process.env.SMTP_SECURE, false);
  const smtpUser = process.env.SMTP_USER ?? '';
  const smtpPass = process.env.SMTP_PASS ?? '';
  const smtpFromName = process.env.SMTP_FROM_NAME ?? 'Your App';

  const rateLimitWindowMs = parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000);
  const rateLimitMaxRequests = parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 60);

  const awsRegion = process.env.AWS_REGION ?? '';
  const awsS3EnvFromProcess = process.env.S3_ENV?.trim().toLowerCase();
  const awsS3Env: RuntimeStage =
    awsS3EnvFromProcess === 'prod' || awsS3EnvFromProcess === 'dev'
      ? awsS3EnvFromProcess
      : stage;

  cachedConfig = {
    stage,
    port,
    mongo: {
      uri: mongoUri,
      dbName: mongoDb,
    },
    cors: {
      origins: envCorsOrigins,
      credentials: parseBoolean(process.env.CORS_CREDENTIALS, true),
    },
    jwt: {
      secret: jwtSecret,
      expiresIn: jwtExpiresIn,
    },
    smtp: {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
      pass: smtpPass,
      fromName: smtpFromName,
    },
    rateLimit: {
      windowMs: rateLimitWindowMs,
      maxRequests: rateLimitMaxRequests,
    },
    aws: {
      region: awsRegion,
      s3Env: awsS3Env,
    },
  };

  return cachedConfig;
};
