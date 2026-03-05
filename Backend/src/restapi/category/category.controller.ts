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
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { UserRole } from 'src/db/schema/user.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: Request & { user?: Record<string, unknown> },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const createdBy = String(req.user?.sub ?? '');
    const category = await this.categoryService.createCategory(
      createCategoryDto,
      createdBy,
    );

    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllCategories() {
    const categories = await this.categoryService.getAllCategories();

    return {
      message: 'Categories fetched successfully',
      data: categories,
    };
  }

  @Get(':category_id')
  @HttpCode(HttpStatus.OK)
  async getCategoryById(@Param('category_id') category_id: string) {
    const category = await this.categoryService.getCategoryById(category_id);

    return {
      message: 'Category fetched successfully',
      data: category,
    };
  }

  @Patch(':category_id')
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  async updateCategory(
    @Param('category_id') category_id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoryService.updateCategory(
      category_id,
      updateCategoryDto,
    );

    return {
      message: 'Category updated successfully',
      data: category,
    };
  }

  @Delete(':category_id')
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('category_id') category_id: string) {
    const category = await this.categoryService.deleteCategory(category_id);

    return {
      message: 'Category deleted successfully',
      data: category,
    };
  }
}
