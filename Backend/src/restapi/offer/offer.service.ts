import {
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  Category,
  CategoryDocument,
  Offer,
  OfferDiscountType,
  OfferDocument,
  OfferType,
  Product,
  ProductDocument,
} from 'src/db/schema';
import { apiError } from 'src/utills/apiResponse';
import { CreateOfferDto, UpdateOfferDto } from './offer.dto';

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  private parseDate(value: unknown, fieldName: string): Date {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} must be a valid date`);
    }
    return date;
  }

  private validateInteger(value: number | undefined, fieldName: string) {
    if (value === undefined) {
      return;
    }

    if (!Number.isInteger(value) || value < 0) {
      apiError(
        `${fieldName} must be a non-negative integer`,
        null,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateNumber(value: number | undefined, fieldName: string) {
    if (value === undefined) {
      return;
    }

    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      apiError(
        `${fieldName} must be a non-negative number`,
        null,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async validateProductIds(productIds: string[] = []) {
    for (const productId of productIds) {
      const exists = await this.productModel.exists({ _id: productId });
      if (!exists) {
        throw new NotFoundException(`Product not found: ${productId}`);
      }
    }
  }

  private async validateCategoryIds(categoryIds: string[] = []) {
    for (const categoryId of categoryIds) {
      const query = isValidObjectId(categoryId)
        ? { $or: [{ _id: categoryId }, { category_id: categoryId }] }
        : { category_id: categoryId };

      const exists = await this.categoryModel.exists(query);
      if (!exists) {
        throw new NotFoundException(`Category not found: ${categoryId}`);
      }
    }
  }

  private async validateOfferRules(data: {
    offer_type: OfferType;
    discount_type: OfferDiscountType;
    applicable_product_ids?: string[];
    applicable_category_ids?: string[];
    buy_quantity?: number;
    free_quantity?: number;
    free_product_id?: string;
    target_boxes?: number;
    reward_amount?: number;
  }) {
    if (
      data.offer_type === OfferType.PRODUCT &&
      (!data.applicable_product_ids || data.applicable_product_ids.length === 0)
    ) {
      apiError(
        'applicable_product_ids is required for PRODUCT offers',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      data.offer_type === OfferType.CATEGORY &&
      (!data.applicable_category_ids ||
        data.applicable_category_ids.length === 0)
    ) {
      apiError(
        'applicable_category_ids is required for CATEGORY offers',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.offer_type === OfferType.TARGET) {
      if (data.target_boxes === undefined || data.reward_amount === undefined) {
        apiError(
          'target_boxes and reward_amount are required for TARGET offers',
          null,
          HttpStatus.BAD_REQUEST,
        );
      }

      const targetBoxes = data.target_boxes ?? -1;
      const rewardAmount = data.reward_amount ?? -1;

      if (!Number.isInteger(targetBoxes) || targetBoxes < 1) {
        apiError(
          'target_boxes must be a positive integer',
          null,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (rewardAmount < 0) {
        apiError(
          'reward_amount must be non-negative',
          null,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (data.offer_type === OfferType.BXGY) {
      if (data.buy_quantity === undefined || data.free_quantity === undefined) {
        apiError(
          'buy_quantity and free_quantity are required for BXGY offers',
          null,
          HttpStatus.BAD_REQUEST,
        );
      }

      const buyQuantity = data.buy_quantity ?? -1;
      const freeQuantity = data.free_quantity ?? -1;

      if (!Number.isInteger(buyQuantity) || buyQuantity < 1) {
        apiError(
          'buy_quantity must be a positive integer',
          null,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!Number.isInteger(freeQuantity) || freeQuantity < 1) {
        apiError(
          'free_quantity must be a positive integer',
          null,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (
      data.discount_type === OfferDiscountType.FREE_PRODUCT &&
      !data.free_product_id
    ) {
      apiError(
        'free_product_id is required when discount_type is free_product',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.applicable_product_ids && data.applicable_product_ids.length > 0) {
      await this.validateProductIds(data.applicable_product_ids);
    }

    if (
      data.applicable_category_ids &&
      data.applicable_category_ids.length > 0
    ) {
      await this.validateCategoryIds(data.applicable_category_ids);
    }

    if (data.free_product_id) {
      await this.validateProductIds([data.free_product_id]);
    }
  }

  async createOffer(createOfferDto: CreateOfferDto, createdBy: string) {
    const {
      offer_name,
      offer_type,
      discount_type,
      discount_value,
      min_order_value,
      min_order_boxes,
      applicable_product_ids,
      applicable_category_ids,
      buy_quantity,
      free_quantity,
      free_product_id,
      target_boxes,
      reward_amount,
      start_date,
      end_date,
      usage_limit,
      usage_count,
      is_active,
    } = createOfferDto;

    if (
      !offer_name ||
      !offer_type ||
      !discount_type ||
      discount_value === undefined ||
      !start_date ||
      !end_date
    ) {
      apiError('Missing required offer fields', null, HttpStatus.BAD_REQUEST);
    }

    if (!createdBy) {
      throw new UnauthorizedException('User not found in token');
    }

    this.validateNumber(discount_value, 'discount_value');
    this.validateNumber(min_order_value, 'min_order_value');
    this.validateInteger(min_order_boxes, 'min_order_boxes');
    this.validateInteger(usage_limit ?? undefined, 'usage_limit');
    this.validateInteger(usage_count ?? 0, 'usage_count');

    const parsedStartDate = this.parseDate(start_date, 'start_date');
    const parsedEndDate = this.parseDate(end_date, 'end_date');

    if (parsedStartDate > parsedEndDate) {
      apiError(
        'start_date cannot be after end_date',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.validateOfferRules({
      offer_type,
      discount_type,
      applicable_product_ids,
      applicable_category_ids,
      buy_quantity,
      free_quantity,
      free_product_id,
      target_boxes,
      reward_amount,
    });

    try {
      return await this.offerModel.create({
        offer_name: offer_name.trim(),
        offer_type,
        discount_type,
        discount_value,
        min_order_value,
        min_order_boxes,
        applicable_product_ids: applicable_product_ids ?? [],
        applicable_category_ids: applicable_category_ids ?? [],
        buy_quantity,
        free_quantity,
        free_product_id,
        target_boxes,
        reward_amount,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
        usage_limit: usage_limit ?? 0,
        usage_count: usage_count ?? 0,
        is_active: is_active ?? true,
        created_by: createdBy,
      });
    } catch (error: unknown) {
      apiError('Error creating offer', error, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllOffers() {
    return this.offerModel.find().sort({ created_at: -1 });
  }

  async getActiveOffers() {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(now);
    dayEnd.setHours(23, 59, 59, 999);

    return this.offerModel
      .find({
        is_active: true,

        start_date: { $lte: dayEnd },
        end_date: { $gte: dayStart },
      })
      .sort({ created_at: -1 });
  }

  async getOfferById(offer_id: string) {
    const offer = await this.offerModel.findOne({ _id: offer_id });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async updateOffer(offer_id: string, updateOfferDto: UpdateOfferDto) {
    const existingOffer = await this.offerModel.findOne({ _id: offer_id });

    if (!existingOffer) {
      throw new NotFoundException('Offer not found');
    }

    if (typeof updateOfferDto.is_activate === 'boolean') {
      updateOfferDto.is_active = updateOfferDto.is_activate;
      delete updateOfferDto.is_activate;
    }

    this.validateNumber(updateOfferDto.discount_value, 'discount_value');
    this.validateNumber(updateOfferDto.min_order_value, 'min_order_value');
    this.validateInteger(updateOfferDto.min_order_boxes, 'min_order_boxes');
    this.validateInteger(
      updateOfferDto.usage_limit ?? undefined,
      'usage_limit',
    );
    this.validateInteger(updateOfferDto.usage_count, 'usage_count');

    if (updateOfferDto.start_date) {
      updateOfferDto.start_date = this.parseDate(
        updateOfferDto.start_date,
        'start_date',
      );
    }

    if (updateOfferDto.end_date) {
      updateOfferDto.end_date = this.parseDate(
        updateOfferDto.end_date,
        'end_date',
      );
    }

    const effectiveOffer = {
      offer_type: updateOfferDto.offer_type ?? existingOffer.offer_type,
      discount_type:
        updateOfferDto.discount_type ?? existingOffer.discount_type,
      applicable_product_ids:
        updateOfferDto.applicable_product_ids ??
        existingOffer.applicable_product_ids,
      applicable_category_ids:
        updateOfferDto.applicable_category_ids ??
        existingOffer.applicable_category_ids,
      buy_quantity: updateOfferDto.buy_quantity ?? existingOffer.buy_quantity,
      free_quantity:
        updateOfferDto.free_quantity ?? existingOffer.free_quantity,
      free_product_id:
        updateOfferDto.free_product_id ?? existingOffer.free_product_id,
      target_boxes: updateOfferDto.target_boxes ?? existingOffer.target_boxes,
      reward_amount:
        updateOfferDto.reward_amount ?? existingOffer.reward_amount,
    };

    await this.validateOfferRules(effectiveOffer);

    const effectiveStartDate =
      updateOfferDto.start_date ?? existingOffer.start_date;
    const effectiveEndDate = updateOfferDto.end_date ?? existingOffer.end_date;

    if (effectiveStartDate > effectiveEndDate) {
      apiError(
        'start_date cannot be after end_date',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateOfferDto.offer_name) {
      updateOfferDto.offer_name = updateOfferDto.offer_name.trim();
    }

    const updatedOffer = await this.offerModel.findOneAndUpdate(
      { _id: existingOffer._id },
      updateOfferDto,
      { returnDocument: 'after' },
    );

    if (!updatedOffer) {
      throw new NotFoundException('Offer not found');
    }

    return updatedOffer;
  }

  async deleteOffer(offer_id: string) {
    const deletedOffer = await this.offerModel.findOneAndDelete({
      _id: offer_id,
    });

    if (!deletedOffer) {
      throw new NotFoundException('Offer not found');
    }

    return deletedOffer;
  }
}
