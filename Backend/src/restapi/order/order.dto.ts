import { OrderStatus } from 'src/db/schema';

export class CreateOrderDto {
  delivery_address: Record<string, unknown>;
  notes?: string;
}

export class UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}

export class CancelOrderDto {
  cancellation_reason: string;
}
