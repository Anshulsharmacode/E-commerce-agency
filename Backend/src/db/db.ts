import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { getRuntimeConfig } from 'src/common/config/app-config';
import { DATABASE_MODELS } from './schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const runtimeConfig = getRuntimeConfig();
        if (!runtimeConfig.mongo.uri) {
          throw new Error(
            'Mongo URI missing. Set it in config/app-config.json or environment variables.',
          );
        }
        const opt = {
          uri: runtimeConfig.mongo.uri,
          dbName: runtimeConfig.mongo.dbName,
        };
        return opt;
      },
    }),
    MongooseModule.forFeature(DATABASE_MODELS),
  ],
  exports: [MongooseModule],
})
export class DataBaseModule {}
