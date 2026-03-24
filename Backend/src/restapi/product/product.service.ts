import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  Category,
  CategoryDocument,
  Product,
  ProductDocument,
} from 'src/db/schema';
import { apiError } from 'src/utills/apiResponse';
import {
  buildPaginationMeta,
  normalizePagination,
} from 'src/common/utils/pagination';
import { S3Service } from 'src/common/utils/bucket.awsservice';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly s3Service: S3Service,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    const {
      category_id,
      name,
      description,
      unit,
      unit_weight,
      pieces_per_box,
      selling_price_box,
      purchase_price_box,
      image_url,
      is_active,
    } = createProductDto;

    if (
      !category_id ||
      !name ||
      !unit ||
      unit_weight === undefined ||
      pieces_per_box === undefined ||
      selling_price_box === undefined ||
      purchase_price_box === undefined
    ) {
      apiError('Missing required product fields', null, HttpStatus.BAD_REQUEST);
    }

    if (pieces_per_box < 1) {
      apiError(
        'pieces_per_box must be at least 1',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (unit_weight <= 0) {
      apiError(
        'unit_weight must be greater than 0',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (selling_price_box < 0 || purchase_price_box < 0) {
      apiError(
        'selling_price_box and purchase_price_box must be 0 or greater',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    const normalizedName = name.toLowerCase().trim();

    const categoryQuery = isValidObjectId(category_id)
      ? { $or: [{ _id: category_id }, { category_id }] }
      : { category_id };
    const category = await this.categoryModel.findOne(categoryQuery);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const existingProduct = await this.productModel.findOne({
      category_id: category.id,
      name: normalizedName,
    });
    if (existingProduct) {
      throw new ForbiddenException('Product already exists in this category');
    }

    try {
      return await this.productModel.create({
        category_id: category.id,
        name: normalizedName,
        description: description?.trim() || undefined,
        unit,
        unit_weight,
        pieces_per_box,
        selling_price_box,
        purchase_price_box,
        image_url: image_url?.trim() || undefined,
        is_active: is_active ?? true,
      });
    } catch (error: unknown) {
      apiError('Error creating product', error, HttpStatus.BAD_REQUEST);
    }
  }

  async updateProduct(product_id: string, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.productModel.findOne({
      _id: product_id,
    });
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (typeof updateProductDto.is_activate === 'boolean') {
      updateProductDto.is_active = updateProductDto.is_activate;
      delete updateProductDto.is_activate;
    }

    if (
      updateProductDto.unit_weight !== undefined &&
      updateProductDto.unit_weight <= 0
    ) {
      apiError(
        'unit_weight must be greater than 0',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      updateProductDto.pieces_per_box !== undefined &&
      updateProductDto.pieces_per_box < 1
    ) {
      apiError(
        'pieces_per_box must be at least 1',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      (updateProductDto.selling_price_box !== undefined &&
        updateProductDto.selling_price_box < 0) ||
      (updateProductDto.purchase_price_box !== undefined &&
        updateProductDto.purchase_price_box < 0)
    ) {
      apiError(
        'selling_price_box and purchase_price_box must be 0 or greater',
        null,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateProductDto.category_id) {
      const category = await this.categoryModel.findOne({
        _id: updateProductDto.category_id,
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      updateProductDto.category_id = category.id;
    }

    if (updateProductDto.name) {
      updateProductDto.name = updateProductDto.name.toLowerCase().trim();
    }

    if (updateProductDto.description !== undefined) {
      updateProductDto.description = updateProductDto.description?.trim() || '';
    }

    if (updateProductDto.image_url !== undefined) {
      updateProductDto.image_url = updateProductDto.image_url?.trim() || undefined;
    }

    const targetCategoryId =
      updateProductDto.category_id ?? existingProduct.category_id;
    const targetName = updateProductDto.name ?? existingProduct.name;

    const duplicate = await this.productModel.findOne({
      _id: { $ne: existingProduct._id },
      category_id: targetCategoryId,
      name: targetName,
    });
    if (duplicate) {
      throw new ForbiddenException('Product already exists in this category');
    }

    const updatedProduct = await this.productModel.findOneAndUpdate(
      { _id: existingProduct._id },
      updateProductDto,
      { returnDocument: 'after' },
    );

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async deleteProduct(product_id: string) {
    const deletedProduct = await this.productModel.findOneAndDelete({
      _id: product_id,
    });
    if (!deletedProduct) {
      throw new NotFoundException('Product not found');
    }

    return deletedProduct;
  }

  async getAllProducts(page?: number, limit?: number) {
    const pagination = normalizePagination({ page, limit });

    const [products, total] = await Promise.all([
      this.productModel
        .find()
        .sort({ created_at: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      this.productModel.countDocuments(),
    ]);

    const data = await Promise.all(
      products.map(async (product) => {
        const productObject = product.toObject();
        const resolvedImageUrl = productObject.image_url
          ? await this.s3Service.getImageUrl(productObject.image_url)
          : undefined;
        return {
          ...productObject,
          image_url: resolvedImageUrl,
        };
      }),
    );

    return {
      data,
      pagination: buildPaginationMeta(total, pagination),
    };
  }

  async getProductByid(product_id: string) {
    const data = await this.productModel.findById({ _id: product_id });
    if (!data) return data;

    const product = data.toObject();
    return {
      ...product,
      image_url: product.image_url
        ? await this.s3Service.getImageUrl(product.image_url)
        : undefined,
    };
  }
}
