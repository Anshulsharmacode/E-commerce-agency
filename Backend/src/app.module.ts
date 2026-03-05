import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataBaseModule } from './db/db';
import { UserController } from './restapi/user/user.controller';
import { UserService } from './restapi/user/user.service';

@Module({
  imports: [
    DataBaseModule,
    JwtModule.register({
      secret: 'JWT_SECRET',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
