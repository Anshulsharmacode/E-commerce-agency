import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment-specific file if it exists, otherwise fallback to default .env
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: join(process.cwd(), `.env.${nodeEnv}`) });
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  // Enable CORS
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials:
      process.env.CORS_CREDENTIALS === 'true' ||
      process.env.CORS_CREDENTIALS === '1' ||
      process.env.CORS_CREDENTIALS === undefined, // default true
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
}
void bootstrap();
