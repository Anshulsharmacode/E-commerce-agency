import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_MODELS } from './schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const mongoUri =
          process.env.MONGOURL ??
          process.env.MONGO_URL ??
          process.env.MONGO_URI ??
          '';

        const mongoDb = process.env.MONGO_DB ?? 'Marketing_E';

        if (!mongoUri) {
          throw new Error(
            'Mongo URI missing. Set it in environment variables.',
          );
        }
        const opt = {
          uri: mongoUri,
          dbName: mongoDb,
        };
        return opt;
      },
    }),
    MongooseModule.forFeature(DATABASE_MODELS),
  ],
  exports: [MongooseModule],
})
export class DataBaseModule {}
