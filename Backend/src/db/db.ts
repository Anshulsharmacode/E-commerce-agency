import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_MODELS } from './schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const opt = {
          uri: process.env.MONGOURL,
          dbName: 'Marketing_E',
        };
        return opt;
      },
    }),
    MongooseModule.forFeature(DATABASE_MODELS),
  ],
  exports: [MongooseModule],
})
export class DataBaseModule {}
