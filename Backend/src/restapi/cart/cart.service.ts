import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Cart,
  CartDocument,
  Offer,
  OfferDiscountType,
  OfferType,
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
    @InjectModel(Offer.name)
    private readonly offerModel: Model<Offer>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private calculateLineDiscount(
    offer: Offer,
    lineTotal: number,
    quantity: number,
  ) {
    if (offer.discount_type === OfferDiscountType.PERCENTAGE) {
      return (lineTotal * offer.discount_value) / 100;
    }
    if (offer.discount_type === OfferDiscountType.FLAT) {
      return Math.min(offer.discount_value, lineTotal);
    }
    if (offer.discount_type === OfferDiscountType.FREE_PRODUCT) {
      return 0;
    }
    return 0;
  }

  private calculateBxgyDiscount(
    offer: Offer,
    pricePerBox: number,
    quantity: number,
  ) {
    if (
      offer.discount_type !== OfferDiscountType.FREE_PRODUCT ||
      !offer.buy_quantity ||
      !offer.free_quantity
    ) {
      return 0;
    }
    const bundleSize = offer.buy_quantity + offer.free_quantity;
    if (bundleSize <= 0) return 0;
    const freeUnits = Math.floor(quantity / bundleSize) * offer.free_quantity;
    return freeUnits * pricePerBox;
  }

  private async recalculateTotals(items: Cart['items']) {
    const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);
    let total_discount = 0;

    if (items.length === 0) {
      return {
        total_amount,
        total_discount,
        final_amount: 0,
      };
    }

    const appliedOfferIds = Array.from(
      new Set(
        items
          .map((item) => item.applied_offer_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    if (appliedOfferIds.length === 0) {
      return {
        total_amount,
        total_discount,
        final_amount: Math.max(total_amount - total_discount, 0),
      };
    }

    const now = new Date();
    const offers = await this.offerModel
      .find({
        _id: { $in: appliedOfferIds },
        is_active: true,
        start_date: { $lte: now },
        end_date: { $gte: now },
      })
      .lean();

    if (offers.length === 0) {
      return {
        total_amount,
        total_discount,
        final_amount: Math.max(total_amount - total_discount, 0),
      };
    }

    const offerMap = new Map<string, Offer>(
      offers.map((offer) => [String(offer._id), offer as Offer]),
    );

    const productIds = items.map((item) => item.product_id);
    const products = await this.productModel
      .find({ _id: { $in: productIds } }, { _id: 1, category_id: 1 })
      .lean();
    const productCategoryMap = new Map<string, string>();
    products.forEach((product) => {
      productCategoryMap.set(String(product._id), product.category_id);
    });

    const totalBoxes = items.reduce(
      (sum, item) => sum + item.quantity_boxes,
      0,
    );

    const orderOfferApplied = new Set<string>();

    items.forEach((item) => {
      if (!item.applied_offer_id) return;
      const offer = offerMap.get(item.applied_offer_id);
      if (!offer) return;

      if (
        offer.usage_limit !== undefined &&
        offer.usage_limit !== null &&
        offer.usage_count >= offer.usage_limit
      ) {
        return;
      }

      if (offer.min_order_value && total_amount < offer.min_order_value) {
        return;
      }

      if (offer.min_order_boxes && totalBoxes < offer.min_order_boxes) {
        return;
      }

      switch (offer.offer_type) {
        case OfferType.PRODUCT: {
          if (!offer.applicable_product_ids?.includes(item.product_id)) return;
          total_discount += this.calculateLineDiscount(
            offer,
            item.total_price,
            item.quantity_boxes,
          );
          break;
        }
        case OfferType.CATEGORY: {
          const categoryId = productCategoryMap.get(item.product_id);
          if (
            !categoryId ||
            !offer.applicable_category_ids?.includes(categoryId)
          ) {
            return;
          }
          total_discount += this.calculateLineDiscount(
            offer,
            item.total_price,
            item.quantity_boxes,
          );
          break;
        }
        case OfferType.BXGY: {
          if (!offer.applicable_product_ids?.includes(item.product_id)) return;
          total_discount += this.calculateBxgyDiscount(
            offer,
            item.price_per_box,
            item.quantity_boxes,
          );
          break;
        }
        case OfferType.TARGET: {
          if (orderOfferApplied.has(item.applied_offer_id)) return;
          if (offer.target_boxes && totalBoxes < offer.target_boxes) return;
          total_discount += offer.reward_amount ?? 0;
          orderOfferApplied.add(item.applied_offer_id);
          break;
        }
        case OfferType.ORDER:
        default: {
          if (orderOfferApplied.has(item.applied_offer_id)) return;
          if (offer.discount_type === OfferDiscountType.PERCENTAGE) {
            total_discount += (total_amount * offer.discount_value) / 100;
          } else if (offer.discount_type === OfferDiscountType.FLAT) {
            total_discount += Math.min(offer.discount_value, total_amount);
          }
          orderOfferApplied.add(item.applied_offer_id);
          break;
        }
      }
    });

    total_discount = Math.min(total_discount, total_amount);
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
    const productObjectId = product.id;

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product_id === productObjectId,
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
        product_id: productObjectId,
        quantity_boxes,
        price_per_box: product.selling_price_box,
        applied_offer_id,
        total_price: quantity_boxes * product.selling_price_box,
      });
    }

    const totals = await this.recalculateTotals(cart.items);
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
    const productObjectId = product.id;

    const targetIndex = cart.items.findIndex(
      (item) => item.product_id === productObjectId,
    );

    if (targetIndex < 0) {
      throw new NotFoundException('Product not found in cart');
    }

    cart.items[targetIndex].quantity_boxes = quantity_boxes;
    cart.items[targetIndex].price_per_box = product.selling_price_box;
    cart.items[targetIndex].applied_offer_id = applied_offer_id;
    cart.items[targetIndex].total_price =
      quantity_boxes * product.selling_price_box;

    const totals = await this.recalculateTotals(cart.items);
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
    const productObjectId = product.id;
    cart.items = cart.items.filter(
      (item) => item.product_id !== productObjectId,
    );

    if (previousLength === cart.items.length) {
      throw new NotFoundException('Product not found in cart');
    }

    const totals = await this.recalculateTotals(cart.items);
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
