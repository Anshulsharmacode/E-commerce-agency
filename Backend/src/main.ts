import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRuntimeConfig } from './common/config/app-config';

async function bootstrap() {
  const runtimeConfig = getRuntimeConfig();
  const app = await NestFactory.create(AppModule);
  const corsOrigins = runtimeConfig.cors.origins;

  // Enable CORS
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: runtimeConfig.cors.credentials,
  });

  await app.listen(runtimeConfig.port);
}
void bootstrap();
