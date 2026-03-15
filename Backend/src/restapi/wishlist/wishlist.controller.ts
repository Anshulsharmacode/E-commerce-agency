import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { AuthUser } from 'src/common/types/types';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@UseGuards(AuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('my')
  @HttpCode(HttpStatus.OK)
  async getMyWishlist(@Req() req: Request & { user?: AuthUser }) {
    const wishlist = await this.wishlistService.getMyWishlist(
      req.user?._id ?? '',
    );

    return {
      message: 'Wishlist fetched successfully',
      data: wishlist,
    };
  }

  @Post('toggle/:product_id')
  @HttpCode(HttpStatus.OK)
  async toggleWishlist(
    @Req() req: Request & { user?: AuthUser },
    @Param('product_id') product_id: string,
  ) {
    const wishlist = await this.wishlistService.toggleProduct(
      req.user?._id ?? '',
      product_id,
    );

    return {
      message: 'Wishlist updated successfully',
      data: wishlist,
    };
  }
}
