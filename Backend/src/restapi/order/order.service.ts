import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  Cart,
  CartDocument,
  Order,
  OrderDocument,
  OrderStatus,
  UserRole,
} from 'src/db/schema';
import { apiError } from 'src/utills/apiResponse';
import {
  CancelOrderDto,
  CreateOrderDto,
  UpdateOrderStatusDto,
} from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  private orderQuery(order_id: string) {
    return isValidObjectId(order_id)
      ? { $or: [{ _id: order_id }, { order_id }] }
      : { order_id };
  }

  async createOrder(user_id: string, createOrderDto: CreateOrderDto) {
    const { delivery_address, notes } = createOrderDto;

    if (!user_id) {
      apiError('User not found in token', null, HttpStatus.UNAUTHORIZED);
    }

    if (!delivery_address || Object.keys(delivery_address).length === 0) {
      apiError('delivery_address is required', null, HttpStatus.BAD_REQUEST);
    }

    const cart = await this.cartModel.findOne({ user_id });

    if (!cart || cart.items.length === 0) {
      apiError('Cart is empty', null, HttpStatus.BAD_REQUEST);
    }

    const cartDoc = cart!;

    const orderItems = cartDoc.items.map((item) => ({
      product_id: item.product_id,
      quantity_boxes: item.quantity_boxes,
      price_per_box: item.price_per_box,
      applied_offer_id: item.applied_offer_id,
      total_price: item.total_price,
    }));

    const appliedOffers = cartDoc.items
      .filter((item) => item.applied_offer_id)
      .map((item) => ({
        offer_id: item.applied_offer_id,
        product_id: item.product_id,
      }));

    const order = await this.orderModel.create({
      user_id,
      items: orderItems,
      status: OrderStatus.PENDING,
      total_amount: cartDoc.total_amount,
      total_discount: cartDoc.total_discount,
      final_amount: cartDoc.final_amount,
      applied_offers: appliedOffers,
      delivery_address,
      notes: notes?.trim(),
      created_by: user_id,
    });

    cartDoc.items = [];
    cartDoc.total_amount = 0;
    cartDoc.total_discount = 0;
    cartDoc.final_amount = 0;
    await cartDoc.save();

    return order;
  }

  async getMyOrders(user_id: string) {
    if (!user_id) {
      apiError('User not found in token', null, HttpStatus.UNAUTHORIZED);
    }

    return this.orderModel.find({ user_id: user_id }).sort({ created_at: -1 });
  }

  async getAllOrders() {
    return this.orderModel.find().sort({ created_at: -1 });
  }

  async getOrderById(order_id: string) {
    const order = await this.orderModel.findOne({ _id: order_id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getMyOrderById(order_id: string, user_id: string) {
    const order = await this.getOrderById(order_id);

    if (order.user_id !== user_id) {
      throw new ForbiddenException('You are not allowed to access this order');
    }

    return order;
  }

  async cancelMyOrder(
    order_id: string,
    user_id: string,
    cancelOrderDto: CancelOrderDto,
  ) {
    const { cancellation_reason } = cancelOrderDto;

    if (!cancellation_reason?.trim()) {
      apiError('cancellation_reason is required', null, HttpStatus.BAD_REQUEST);
    }

    const order = await this.getMyOrderById(order_id, user_id);

    if (order.status === OrderStatus.DELIVERED) {
      throw new ForbiddenException('Delivered order cannot be cancelled');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new ForbiddenException('Order is already cancelled');
    }

    if (order.status === OrderStatus.SHIPPED) {
      throw new ForbiddenException('Shipped order cannot be cancelled');
    }

    const updatedOrder = await this.orderModel.findOneAndUpdate(
      { _id: order._id },
      {
        status: OrderStatus.CANCELLED,
        cancellation_reason: cancellation_reason.trim(),
        cancelled_by: user_id,
      },
      { returnDocument: 'after' },
    );

    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }

    return updatedOrder;
  }

  async updateOrderStatus(
    order_id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    actorId: string,
    actorRole?: UserRole,
  ) {
    const { status, notes } = updateOrderStatusDto;

    if (!status) {
      apiError('status is required', null, HttpStatus.BAD_REQUEST);
    }

    if (!Object.values(OrderStatus).includes(status)) {
      apiError('Invalid order status', null, HttpStatus.BAD_REQUEST);
    }

    if (actorRole !== UserRole.ADMIN && actorRole !== UserRole.EMPLOYEE) {
      throw new ForbiddenException(
        'Only admin/employee can update order status',
      );
    }

    const order = await this.getOrderById(order_id);

    if (
      order.status === OrderStatus.CANCELLED &&
      status !== OrderStatus.CANCELLED
    ) {
      throw new ForbiddenException('Cancelled order status cannot be changed');
    }

    const payload: Record<string, unknown> = {
      status,
    };

    if (notes !== undefined) {
      payload.notes = notes.trim();
    }

    if (status === OrderStatus.CANCELLED) {
      payload.cancelled_by = actorId;
      payload.cancellation_reason = notes?.trim() || 'Cancelled by staff';
    }

    const updatedOrder = await this.orderModel.findOneAndUpdate(
      { _id: order._id },
      payload,
      { returnDocument: 'after' },
    );

    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }

    return updatedOrder;
  }
}
