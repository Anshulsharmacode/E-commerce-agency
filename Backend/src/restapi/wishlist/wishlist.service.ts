import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Product,
  ProductDocument,
  Wishlist,
  WishlistDocument,
} from 'src/db/schema';
import { apiError } from 'src/utills/apiResponse';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name)
    private readonly wishlistModel: Model<WishlistDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getMyWishlist(user_id: string) {
    if (!user_id) {
      apiError('User not found in token', null, HttpStatus.UNAUTHORIZED);
    }

    const wishlist = await this.wishlistModel
      .find({ user_id })
      .sort({ created_at: -1 });

    return wishlist.map((item) => item.product_id);
  }

  async toggleProduct(user_id: string, product_id: string) {
    if (!user_id) {
      apiError('User not found in token', null, HttpStatus.UNAUTHORIZED);
    }

    if (!product_id) {
      apiError('product_id is required', null, HttpStatus.BAD_REQUEST);
    }

    const product = await this.productModel.findById(product_id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingWishlist = await this.wishlistModel.findOne({
      user_id,
      product_id: product.id,
    });

    if (existingWishlist) {
      await this.wishlistModel.deleteOne({ _id: existingWishlist._id });
    } else {
      await this.wishlistModel.create({
        user_id,
        product_id: product.id,
      });
    }

    return this.getMyWishlist(user_id);
  }
}
