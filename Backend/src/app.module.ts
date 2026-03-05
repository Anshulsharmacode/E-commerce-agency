import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataBaseModule } from './db/db';
import { CategoryController } from './restapi/category/category.controller';
import { CategoryService } from './restapi/category/category.service';
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
  controllers: [AppController, UserController, CategoryController],
  providers: [AppService, UserService, CategoryService],
})
export class AppModule {}
