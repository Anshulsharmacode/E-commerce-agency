import {
  Body,
  Controller,
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
import { UserRole } from 'src/db/schema';
import {
  CancelOrderDto,
  CreateOrderDto,
  UpdateOrderStatusDto,
} from './order.dto';
import { OrderService } from './order.service';
import { RATE_LIMITS } from 'src/common/constant/constant';

interface AuthUser {
  _id: string;
  role: UserRole;
}

@Controller('order')
@UseGuards(ThrottlerGuard)
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}


  @Post('create')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Req() req: Request & { user?: AuthUser },
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const order = await this.orderService.createOrder(
      req.user?._id ?? '',
      createOrderDto,
    );

    return {
      message: 'Order created successfully',
      data: order,
    };
  }


  @Get('my')
  @Throttle({
    default: {
      limit: RATE_LIMITS.READ.limit,
      ttl: RATE_LIMITS.READ.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async getMyOrders(
    @Req() req: Request & { user?: AuthUser },
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.orderService.getMyOrders(
      req.user?._id ?? '',
      Number(limit),
      Number(page),
    );

    return {
      message: 'My orders fetched successfully',
      ...result,
    };
  }


  @Get('my/:order_id')
  @Throttle({
    default: {
      limit: RATE_LIMITS.READ.limit,
      ttl: RATE_LIMITS.READ.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async getMyOrderById(
    @Req() req: Request & { user?: AuthUser },
    @Param('order_id') order_id: string,
  ) {
    const order = await this.orderService.getMyOrderById(
      order_id,
      req.user?._id ?? '',
    );

    return {
      message: 'Order fetched successfully',
      data: order,
    };
  }

  @Patch('my/:order_id/cancel')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @HttpCode(HttpStatus.OK)
  async cancelMyOrder(
    @Req() req: Request & { user?: AuthUser },
    @Param('order_id') order_id: string,
    @Body() cancelOrderDto: CancelOrderDto,
  ) {
    const order = await this.orderService.cancelMyOrder(
      order_id,
      req.user?._id ?? '',
      cancelOrderDto,
    );

    return {
      message: 'Order cancelled successfully',
      data: order,
    };
  }


  @Get('all')
  @Throttle({
    default: {
      limit: RATE_LIMITS.READ.limit,
      ttl: RATE_LIMITS.READ.ttl * 1000,
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN, UserRole.EMPLOYEE])
  @HttpCode(HttpStatus.OK)
  async getAllOrders(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.orderService.getAllOrders(
      Number(limit),
      Number(page),
    );

    return {
      message: 'Orders fetched successfully',
      ...result,
    };
  }


  @Get(':order_id')
  @Throttle({
    default: {
      limit: RATE_LIMITS.READ.limit,
      ttl: RATE_LIMITS.READ.ttl * 1000,
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN, UserRole.EMPLOYEE])
  @HttpCode(HttpStatus.OK)
  async getOrderById(@Param('order_id') order_id: string) {
    const order = await this.orderService.getOrderById(order_id);

    return {
      message: 'Order fetched successfully',
      data: order,
    };
  }

  @Patch(':order_id/status')
  @Throttle({
    default: {
      limit: RATE_LIMITS.WRITE.limit,
      ttl: RATE_LIMITS.WRITE.ttl * 1000,
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN, UserRole.EMPLOYEE])
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Req() req: Request & { user?: AuthUser },
    @Param('order_id') order_id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateOrderStatus(
      order_id,
      updateOrderStatusDto,
      req.user?._id ?? '',
      req.user?.role,
    );

    return {
      message: 'Order status updated successfully',
      data: order,
    };
  }
}
