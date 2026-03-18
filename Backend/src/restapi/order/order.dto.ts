import { OrderStatus } from 'src/db/schema';

export class CreateOrderDto {
  delivery_address: Record<string, unknown>;
  notes?: string;
  refer_to?: string;
}

// export class EmploeeCreateOrder extends CreateOrderDto {}

export class UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}

export class CancelOrderDto {
  cancellation_reason: string;
}

export class AssignOrderDto {
  assign_to: string;
}
