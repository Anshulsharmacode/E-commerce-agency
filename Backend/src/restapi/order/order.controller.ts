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
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { UserRole } from 'src/db/schema';
import {
  CancelOrderDto,
  CreateOrderDto,
  AssignOrderDto,
  UpdateOrderStatusDto,
} from './order.dto';
import { OrderService } from './order.service';

interface AuthUser {
  _id: string;
  role: UserRole;
}

@Controller('order')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
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

  // @Post('employee/create')
  // @UseGuards(AuthGuard, RolesGuard)
  // @SetMetadata('roles', [UserRole.ADMIN, UserRole.EMPLOYEE])
  // @HttpCode(HttpStatus.CREATED)
  // async empCreateOrderRef(
  //   @Req() req: Request & { user?: AuthUser },
  //   @Body() createOrderDto: CreateOrderDto,
  // ) {
  //   const order = await this.orderService.empcreateOrderRef(
  //     req.user?._id ?? '',
  //     createOrderDto,
  //   );

  //   return {
  //     message: 'Order created successfully',
  //     data: order,
  //   };
  // }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  async getMyOrders(@Req() req: Request & { user?: AuthUser }) {
    const orders = await this.orderService.getMyOrders(req.user?._id ?? '');

    return {
      message: 'My orders fetched successfully',
      data: orders,
    };
  }

  @Get('my/:order_id')
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
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN, UserRole.EMPLOYEE])
  @HttpCode(HttpStatus.OK)
  async getAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.orderService.getAllOrders(
      Number(page),
      Number(limit),
    );

    return {
      message: 'Orders fetched successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('assigned/my')
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.EMPLOYEE])
  @HttpCode(HttpStatus.OK)
  async getAssignedOrders(@Req() req: Request & { user?: AuthUser }) {
    const orders = await this.orderService.getAssignedOrders(
      req.user?._id ?? '',
    );

    return {
      message: 'Assigned orders fetched successfully',
      data: orders,
    };
  }

  @Get(':order_id')
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

  @Patch(':order_id/assign')
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  async assignOrder(
    @Req() req: Request & { user?: AuthUser },
    @Param('order_id') order_id: string,
    @Body() assignOrderDto: AssignOrderDto,
  ) {
    const order = await this.orderService.assignOrder(
      order_id,
      assignOrderDto,
      req.user?._id ?? '',
      req.user?.role,
    );

    return {
      message: 'Order assigned successfully',
      data: order,
    };
  }
}
