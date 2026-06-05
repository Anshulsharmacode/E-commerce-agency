// src/lambda.ts
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment-specific file if it exists, otherwise fallback to default .env
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: join(process.cwd(), `.env.${nodeEnv}`) });
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js'; // ← .js extension required with nodenext
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@codegenie/serverless-express';
import express from 'express';
import type { Handler, Context, Callback } from 'aws-lambda';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials:
      process.env.CORS_CREDENTIALS === 'true' ||
      process.env.CORS_CREDENTIALS === '1' ||
      process.env.CORS_CREDENTIALS === undefined, // default true
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.init();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return server(event, context, callback);
};
