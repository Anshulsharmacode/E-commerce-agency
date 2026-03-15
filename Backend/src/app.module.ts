import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataBaseModule } from './db/db';
import { CartController } from './restapi/cart/cart.controller';
import { CartService } from './restapi/cart/cart.service';
import { CategoryController } from './restapi/category/category.controller';
import { CategoryService } from './restapi/category/category.service';
import { ChatController } from './restapi/chat/chat.controller';
import { ChatGateway } from './restapi/chat/chat.gateway';
import { ChatService } from './restapi/chat/chat.service';
import { OfferController } from './restapi/offer/offer.controller';
import { OfferService } from './restapi/offer/offer.service';
import { OrderController } from './restapi/order/order.controller';
import { OrderService } from './restapi/order/order.service';
import { ProductController } from './restapi/product/product.controller';
import { ProductService } from './restapi/product/product.service';
import { UserController } from './restapi/user/user.controller';
import { UserService } from './restapi/user/user.service';
import { WishlistController } from './restapi/wishlist/wishlist.controller';
import { WishlistService } from './restapi/wishlist/wishlist.service';

@Module({
  imports: [
    DataBaseModule,
    JwtModule.register({
      secret: 'JWT_SECRET',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    AppController,
    UserController,
    CategoryController,
    ChatController,
    ProductController,
    CartController,
    OfferController,
    OrderController,
    WishlistController,
  ],
  providers: [
    AppService,
    UserService,
    CategoryService,
    ChatService,
    ChatGateway,
    ProductService,
    CartService,
    OfferService,
    OrderService,
    WishlistService,
  ],
})
export class AppModule {}
