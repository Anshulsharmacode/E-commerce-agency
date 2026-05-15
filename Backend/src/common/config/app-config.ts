import * as dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

export type RuntimeStage = 'dev' | 'prod';

type StageConfig = {
  port?: number;
  mongo?: {
    uri?: string;
    dbName?: string;
  };
  cors?: {
    origins?: string[];
    credentials?: boolean;
  };
  jwt?: {
    secret?: string;
    expiresIn?: string;
  };
  smtp?: {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    pass?: string;
    fromName?: string;
  };
  rateLimit?: {
    windowMs?: number;
    maxRequests?: number;
  };
  aws?: {
    region?: string;
    s3Env?: RuntimeStage;
  };
};

type AppConfigFile = {
  dev?: StageConfig;
  prod?: StageConfig;
};

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
  const appEnv = process.env.APP_ENV?.trim().toLowerCase();
  if (appEnv === 'prod' || appEnv === 'production') return 'prod';
  if (appEnv === 'dev' || appEnv === 'development') return 'dev';

  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  if (nodeEnv === 'prod' || nodeEnv === 'production') return 'prod';

  return 'dev';
};

const loadConfigFile = (): AppConfigFile | null => {
  const configPath = join(process.cwd(), 'config', 'app-config.json');
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const rawContent = readFileSync(configPath, 'utf8');
    return JSON.parse(rawContent) as AppConfigFile;
  } catch {
    throw new Error(`Invalid JSON in ${configPath}`);
  }
};

export const getRuntimeConfig = (): RuntimeConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const stage = resolveStage();
  const configFile = loadConfigFile();
  const stageConfig = configFile?.[stage] ?? {};

  const envCorsOrigins = parseCsv(process.env.CORS_ORIGINS);
  const fileCorsOrigins = stageConfig.cors?.origins ?? [];

  const port =
    process.env.PORT !== undefined
      ? parseNumber(process.env.PORT, 3000)
      : stageConfig.port ?? 3000;

  const mongoUri =
    process.env.MONGOURL ??
    process.env.MONGO_URL ??
    process.env.MONGO_URI ??
    stageConfig.mongo?.uri ??
    '';

  const mongoDb =
    process.env.MONGO_DB ?? stageConfig.mongo?.dbName ?? 'Marketing_E';

  const jwtSecret =
    process.env.JWT_SECRET ?? stageConfig.jwt?.secret ?? 'JWT_SECRET';
  const jwtExpiresIn =
    process.env.JWT_EXPIRES_IN ?? stageConfig.jwt?.expiresIn ?? '7d';

  const smtpHost = process.env.SMTP_HOST ?? stageConfig.smtp?.host ?? '';
  const smtpPort =
    process.env.SMTP_PORT !== undefined
      ? parseNumber(process.env.SMTP_PORT, 587)
      : stageConfig.smtp?.port ?? 587;
  const smtpSecure =
    process.env.SMTP_SECURE !== undefined
      ? parseBoolean(process.env.SMTP_SECURE, false)
      : stageConfig.smtp?.secure ?? false;
  const smtpUser = process.env.SMTP_USER ?? stageConfig.smtp?.user ?? '';
  const smtpPass = process.env.SMTP_PASS ?? stageConfig.smtp?.pass ?? '';
  const smtpFromName =
    process.env.SMTP_FROM_NAME ?? stageConfig.smtp?.fromName ?? 'Your App';

  const rateLimitWindowMs =
    process.env.RATE_LIMIT_WINDOW_MS !== undefined
      ? parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000)
      : stageConfig.rateLimit?.windowMs ?? 60_000;
  const rateLimitMaxRequests =
    process.env.RATE_LIMIT_MAX_REQUESTS !== undefined
      ? parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 60)
      : stageConfig.rateLimit?.maxRequests ?? 60;

  const awsRegion = process.env.AWS_REGION ?? stageConfig.aws?.region ?? '';
  const awsS3EnvFromFile = stageConfig.aws?.s3Env;
  const awsS3EnvFromProcess = process.env.S3_ENV?.trim().toLowerCase();
  const awsS3Env: RuntimeStage =
    awsS3EnvFromProcess === 'prod' || awsS3EnvFromProcess === 'dev'
      ? awsS3EnvFromProcess
      : awsS3EnvFromFile ?? stage;

  cachedConfig = {
    stage,
    port,
    mongo: {
      uri: mongoUri,
      dbName: mongoDb,
    },
    cors: {
      origins: envCorsOrigins.length > 0 ? envCorsOrigins : fileCorsOrigins,
      credentials: stageConfig.cors?.credentials ?? true,
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
