import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Category, CategoryDocument } from 'src/db/schema';
import { apiError } from 'src/utills/apiResponse';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { parsePagination, calculatePaginationMeta } from 'src/utills/utills';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    createdBy: string,
  ) {
    const { name, description, is_active } = createCategoryDto;

    if (!name) {
      apiError('Category name is required', null, HttpStatus.BAD_REQUEST);
    }

    if (!createdBy) {
      throw new UnauthorizedException('User not found in token');
    }

    const normalizedName = name.toLowerCase().trim();

    const alreadyExists = await this.categoryModel.findOne({
      name: normalizedName,
    });
    if (alreadyExists) {
      throw new ForbiddenException('Category already exists');
    }

    try {
      return await this.categoryModel.create({
        name: normalizedName,
        description,
        is_active: is_active ?? true,
        created_by: createdBy,
        // sort_order: sort_order ?? 0,
      });
    } catch (error: unknown) {
      apiError('Error creating category', error, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllCategories(limit?: number, page?: number) {
    const { limit: safeLimit, skip } = parsePagination(limit, page, 'CATEGORY');

    const [categories, total] = await Promise.all([
      this.categoryModel
        .find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(safeLimit),
      this.categoryModel.countDocuments(),
    ]);

    const currentPage = page && !Number.isNaN(Number(page)) ? Number(page) : 1;

    return {
      data: categories,
      ...calculatePaginationMeta(total, safeLimit, currentPage),
    };
  }

  async getCategoryById(category_id: string) {
    const query = isValidObjectId(category_id)
      ? { $or: [{ _id: category_id }, { category_id }] }
      : { category_id };
    const category = await this.categoryModel.findOne(query);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(
    category_id: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const query = isValidObjectId(category_id)
      ? { $or: [{ _id: category_id }, { category_id }] }
      : { category_id };
    const existingCategory = await this.categoryModel.findOne(query);

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    if (typeof updateCategoryDto.is_activate === 'boolean') {
      updateCategoryDto.is_active = updateCategoryDto.is_activate;
      delete updateCategoryDto.is_activate;
    }

    if (updateCategoryDto.name) {
      const normalizedName = updateCategoryDto.name.toLowerCase().trim();

      const duplicateCategory = await this.categoryModel.findOne({
        _id: { $ne: existingCategory._id },
        name: normalizedName,
      });

      if (duplicateCategory) {
        throw new ForbiddenException('Category name already exists');
      }

      updateCategoryDto.name = normalizedName;
    }

    const updatedCategory = await this.categoryModel.findOneAndUpdate(
      { _id: existingCategory._id },
      updateCategoryDto,
      { returnDocument: 'after' },
    );

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }

    return updatedCategory;
  }

  async deleteCategory(category_id: string) {
    const query = isValidObjectId(category_id)
      ? { $or: [{ _id: category_id }, { category_id }] }
      : { category_id };

    const deletedCategory = await this.categoryModel.findOneAndDelete(query);

    if (!deletedCategory) {
      throw new NotFoundException('Category not found');
    }

    return deletedCategory;
  }
}
