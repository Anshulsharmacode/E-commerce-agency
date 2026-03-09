import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Cart,
  CartDocument,
  Product,
  ProductDocument,
  User,
  UserDocument,
} from 'src/db/schema';
import { apiError } from 'src/utills/apiResponse';
import { AddCartItemDto, UpdateCartItemDto } from './cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private recalculateTotals(items: Cart['items']) {
    const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);
    const total_discount = 0;
    const final_amount = Math.max(total_amount - total_discount, 0);

    return {
      total_amount,
      total_discount,
      final_amount,
    };
  }

  async getOrCreateCart(user_id: string) {
    let cart = await this.cartModel.findOne({ user_id: user_id });

    if (!cart) {
      cart = await this.cartModel.create({
        user_id,
        items: [],
        total_amount: 0,
        total_discount: 0,
        final_amount: 0,
      });
    }

    return cart;
  }

  async addItem(user_id: string, addCartItemDto: AddCartItemDto) {
    const { product_id, quantity_boxes, applied_offer_id } = addCartItemDto;
    console.log('dto', addCartItemDto);

    if (!product_id || quantity_boxes === undefined) {
      apiError(
        'product_id and quantity_boxes are required',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (quantity_boxes < 1) {
      apiError(
        'quantity_boxes must be at least 1',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    const product = await this.productModel.findOne({ _id: product_id });
    console.log('product id', product_id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.is_active) {
      apiError('Product is inactive', null, HttpStatus.BAD_REQUEST);
    }

    const cart = await this.getOrCreateCart(user_id);

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product_id === product.product_id,
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity_boxes += quantity_boxes;
      cart.items[existingItemIndex].price_per_box = product.selling_price_box;
      cart.items[existingItemIndex].applied_offer_id = applied_offer_id;
      cart.items[existingItemIndex].total_price =
        cart.items[existingItemIndex].quantity_boxes *
        product.selling_price_box;
    } else {
      cart.items.push({
        product_id: product.product_id,
        quantity_boxes,
        price_per_box: product.selling_price_box,
        applied_offer_id,
        total_price: quantity_boxes * product.selling_price_box,
      });
    }

    const totals = this.recalculateTotals(cart.items);
    cart.total_amount = totals.total_amount;
    cart.total_discount = totals.total_discount;
    cart.final_amount = totals.final_amount;

    await cart.save();

    return cart;
  }

  async updateItem(
    user_id: string,
    product_id: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const { quantity_boxes, applied_offer_id } = updateCartItemDto;

    if (quantity_boxes === undefined) {
      apiError('quantity_boxes is required', null, HttpStatus.BAD_REQUEST);
    }

    if (quantity_boxes < 1) {
      apiError(
        'quantity_boxes must be at least 1',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    const product = await this.productModel.findOne({ _id: product_id });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cart = await this.getOrCreateCart(user_id);

    const targetIndex = cart.items.findIndex(
      (item) => item.product_id === product.product_id,
    );

    if (targetIndex < 0) {
      throw new NotFoundException('Product not found in cart');
    }

    cart.items[targetIndex].quantity_boxes = quantity_boxes;
    cart.items[targetIndex].price_per_box = product.selling_price_box;
    cart.items[targetIndex].applied_offer_id = applied_offer_id;
    cart.items[targetIndex].total_price =
      quantity_boxes * product.selling_price_box;

    const totals = this.recalculateTotals(cart.items);
    cart.total_amount = totals.total_amount;
    cart.total_discount = totals.total_discount;
    cart.final_amount = totals.final_amount;

    await cart.save();

    return cart;
  }

  async removeItem(user_id: string, product_id: string) {
    const cart = await this.getOrCreateCart(user_id);

    const product = await this.productModel.findOne({ _id: product_id });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const previousLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product_id !== product.product_id,
    );

    if (previousLength === cart.items.length) {
      throw new NotFoundException('Product not found in cart');
    }

    const totals = this.recalculateTotals(cart.items);
    cart.total_amount = totals.total_amount;
    cart.total_discount = totals.total_discount;
    cart.final_amount = totals.final_amount;

    await cart.save();

    return cart;
  }

  async clearCart(user_id: string) {
    // const user_id = await this.resolveUserIdFromToken(payload);
    const cart = await this.getOrCreateCart(user_id);

    cart.items = [];
    cart.total_amount = 0;
    cart.total_discount = 0;
    cart.final_amount = 0;

    await cart.save();

    return cart;
  }
}
