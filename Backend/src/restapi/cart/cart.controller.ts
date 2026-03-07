import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { AddCartItemDto, UpdateCartItemDto } from './cart.dto';
import { CartService } from './cart.service';
import { RATE_LIMITS } from 'src/common/constant/constant';

interface AuthUser {
  _id: string;
  email: string;
}

@Controller('cart')
@UseGuards(ThrottlerGuard)
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}


  @Get('my')
  @Throttle({
    default: {
      limit: RATE_LIMITS.READ.limit,
      ttl: RATE_LIMITS.READ.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async getMyCart(@Req() req: Request & { user?: AuthUser }) {
    const cart = await this.cartService.getOrCreateCart(req.user?._id ?? '');
    console.log('user', req.user);

    return {
      message: 'Cart fetched successfully',
      data: cart,
    };
  }

  @Post('add-item')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async addItem(
    @Req() req: Request & { user?: AuthUser },
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    const cart = await this.cartService.addItem(
      req.user?._id ?? '',
      addCartItemDto,
    );

    return {
      message: 'Item added to cart successfully',
      data: cart,
    };
  }
  @Patch('item/:product_id')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async updateItem(
    @Req() req: Request & { user?: AuthUser },
    @Param('product_id') product_id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.updateItem(
      req.user?._id ?? '',
      product_id,
      updateCartItemDto,
    );

    return {
      message: 'Cart item updated successfully',
      data: cart,
    };
  }

  @Delete('item/:product_id')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async removeItem(
    @Req() req: Request & { user?: AuthUser },
    @Param('product_id') product_id: string,
  ) {
    const cart = await this.cartService.removeItem(
      req.user?._id ?? '',
      product_id,
    );

    return {
      message: 'Item removed from cart successfully',
      data: cart,
    };
  }

  @Delete('clear')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async clearCart(@Req() req: Request & { user?: AuthUser }) {
    const cart = await this.cartService.clearCart(req.user?._id ?? '');

    return {
      message: 'Cart cleared successfully',
      data: cart,
    };
  }
}
