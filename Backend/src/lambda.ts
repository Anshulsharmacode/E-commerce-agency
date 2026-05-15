// src/lambda.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js'; // ← .js extension required with nodenext
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@codegenie/serverless-express';
import express from 'express';
import type { Handler, Context, Callback } from 'aws-lambda';
import { getRuntimeConfig } from './common/config/app-config.js';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const runtimeConfig = getRuntimeConfig();
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  const corsOrigins = runtimeConfig.cors.origins;

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: runtimeConfig.cors.credentials,
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
