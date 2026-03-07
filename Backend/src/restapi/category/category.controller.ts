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
  Query,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { UserRole } from 'src/db/schema/user.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { CategoryService } from './category.service';
import { RATE_LIMITS } from 'src/common/constant/constant';

@Controller('category')
@UseGuards(ThrottlerGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

 
  @Post('create')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
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
  @Throttle({
    default: {
      limit: RATE_LIMITS.PUBLIC.limit,
      ttl: RATE_LIMITS.PUBLIC.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async getAllCategories(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.categoryService.getAllCategories(
      Number(limit),
      Number(page),
    );

    return {
      message: 'Categories fetched successfully',
      ...result,
    };
  }

 
  @Get(':category_id')
  @Throttle({
    default: {
      limit: RATE_LIMITS.PUBLIC.limit,
      ttl: RATE_LIMITS.PUBLIC.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async getCategoryById(@Param('category_id') category_id: string) {
    const category = await this.categoryService.getCategoryById(category_id);

    return {
      message: 'Category fetched successfully',
      data: category,
    };
  }


  @Patch(':category_id')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
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
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
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
