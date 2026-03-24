import {
  BadRequestException,
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
import { S3Service } from 'src/common/utils/bucket.awsservice';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { UserRole } from 'src/db/schema/user.schema';
import {
  CreateProductDto,
  UpdateProductDto,
  UploadProductImageDto,
} from './product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('create')
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

  @Post('image/upload-url')
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  async getProductImageUploadUrl(@Body() body: UploadProductImageDto) {
    if (!body?.fileType?.trim()) {
      throw new BadRequestException('fileType is required');
    }

    const uploadData = await this.s3Service.getUploadUrl(body.fileType.trim());

    return {
      message: 'Product image upload URL generated',
      data: uploadData,
    };
  }

  @Patch(':product_id')
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
  @HttpCode(HttpStatus.OK)
  async getAllProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.productService.getAllProducts(
      Number(page),
      Number(limit),
    );

    return {
      message: 'Products fetched successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(':product_id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProductById(@Param('product_id') product_id: string) {
    const product = await this.productService.getProductByid(product_id);
    return {
      message: 'Product fetched successfully',
      data: product,
    };
  }
}
