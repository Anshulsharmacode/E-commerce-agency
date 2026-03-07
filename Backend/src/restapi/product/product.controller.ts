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
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { UserRole } from 'src/db/schema/user.schema';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { ProductService } from './product.service';
import { RATE_LIMITS } from 'src/common/constant/constant';

@Controller('product')
@UseGuards(ThrottlerGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Write operations - stricter rate limit
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
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.createProduct(createProductDto);

    return {
      message: 'Product created successfully',
      data: product,
    };
  }


  @Patch(':product_id')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  async updateProduct(
    @Param('product_id') product_id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productService.updateProduct(
      product_id,
      updateProductDto,
    );

    return {
      message: 'Product updated successfully',
      data: product,
    };
  }

  
  @Delete(':product_id')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('product_id') product_id: string) {
    const product = await this.productService.deleteProduct(product_id);

    return {
      message: 'Product deleted successfully',
      data: product,
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
  async getAllProducts(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.productService.getAllProducts(
      Number(limit),
      Number(page),
    );

    return {
      message: 'Products fetched successfully',
      ...result,
    };
  }
}
