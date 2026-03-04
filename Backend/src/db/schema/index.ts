import { ModelDefinition } from '@nestjs/mongoose';
import { Bill, BillSchema } from './bill.schema';
import { Cart, CartSchema } from './cart.schema';
import { Category, CategorySchema } from './category.schema';
import {
  ChatConversation,
  ChatConversationSchema,
} from './chat-conversation.schema';
import { ChatMessage, ChatMessageSchema } from './chat-message.schema';
import { Offer, OfferSchema } from './offer.schema';
import { Order, OrderSchema } from './order.schema';
import { Product, ProductSchema } from './product.schema';
import { User, UserSchema } from './user.schema';

export const DATABASE_MODELS: ModelDefinition[] = [
  { name: User.name, schema: UserSchema },
  { name: Category.name, schema: CategorySchema },
  { name: Product.name, schema: ProductSchema },
  { name: Cart.name, schema: CartSchema },
  { name: Offer.name, schema: OfferSchema },
  { name: Order.name, schema: OrderSchema },
  { name: Bill.name, schema: BillSchema },
  { name: ChatConversation.name, schema: ChatConversationSchema },
  { name: ChatMessage.name, schema: ChatMessageSchema },
];

export * from './bill.schema';
export * from './cart.schema';
export * from './category.schema';
export * from './chat-conversation.schema';
export * from './chat-message.schema';
export * from './offer.schema';
export * from './order.schema';
export * from './product.schema';
export * from './user.schema';
