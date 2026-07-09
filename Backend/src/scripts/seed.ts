import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment-specific file if it exists, otherwise fallback to default .env
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: join(process.cwd(), `.env.${nodeEnv}`) });
dotenv.config();

import mongoose, { Model, Schema } from 'mongoose';
import {
  Bill,
  BillSchema,
  Cart,
  CartSchema,
  Category,
  CategorySchema,
  Offer,
  OfferDiscountType,
  OfferSchema,
  OfferType,
  Order,
  OrderSchema,
  OrderStatus,
  Product,
  ProductSchema,
  ProductUnit,
  User,
  UserRole,
  UserSchema,
  Wishlist,
  WishlistSchema,
} from 'src/db/schema';
import { hashedPassword } from 'src/utills/utills';

type AnyModel<T> = Model<T>;
type WithId<T> = T & { _id: mongoose.Types.ObjectId };

type CartItemSeed = {
  product_id: string;
  quantity_boxes: number;
  price_per_box: number;
  total_price: number;
  applied_offer_id?: string;
};

type ProductSeed = {
  category_id: string;
  name: string;
  description: string;
  unit: ProductUnit;
  unit_weight: number;
  pieces_per_box: number;
  selling_price_box: number;
  purchase_price_box: number;
  is_active: boolean;
};

const seedTag = 'seed-script';

function getModel<T>(name: string, schema: Schema<T>): AnyModel<T> {
  return (mongoose.models[name] as AnyModel<T>) ?? mongoose.model(name, schema);
}

function calcTotals(items: CartItemSeed[]) {
  const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);
  const total_discount = 0;
  const final_amount = Math.max(total_amount - total_discount, 0);
  return { total_amount, total_discount, final_amount };
}

async function safeDropIndex<T>(model: AnyModel<T>, indexName: string) {
  try {
    await model.collection.dropIndex(indexName);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes('index not found') ||
      message.includes('ns not found') ||
      message.includes('NamespaceNotFound')
    ) {
      return;
    }
  }
}

async function ensureOne<T>(
  model: AnyModel<T>,
  query: Record<string, unknown>,
  data: Partial<T>,
): Promise<T> {
  const existing = await model.findOne(query as never);
  if (existing) return existing;
  return model.create(data as unknown as T);
}

async function main() {
  const uri =
    process.env.MONGOURL ??
    process.env.MONGO_URL ??
    process.env.MONGO_URI ??
    '';

  const dbName = process.env.MONGO_DB ?? 'Marketing_E';

  const shouldReset =
    process.argv.includes('--reset') ||
    process.env.SEED_RESET === 'true' ||
    process.env.SEED_RESET === '1';

  if (!uri) {
    throw new Error('Mongo URI missing. Set it in environment variables.');
  }

  await mongoose.connect(uri, { dbName });

  const UserModel = getModel(User.name, UserSchema);
  const CategoryModel = getModel(Category.name, CategorySchema);
  const ProductModel = getModel(Product.name, ProductSchema);
  const OfferModel = getModel(Offer.name, OfferSchema);
  const CartModel = getModel(Cart.name, CartSchema);
  const OrderModel = getModel(Order.name, OrderSchema);
  const BillModel = getModel(Bill.name, BillSchema);
  const WishlistModel = getModel(Wishlist.name, WishlistSchema);

  await Promise.all([
    safeDropIndex(UserModel, 'user_id_1'),
    safeDropIndex(CategoryModel, 'category_id_1'),
    safeDropIndex(BillModel, 'bill_id_1'),
  ]);

  if (shouldReset) {
    await Promise.all([
      OrderModel.deleteMany({}),
      CartModel.deleteMany({}),
      WishlistModel.deleteMany({}),
      OfferModel.deleteMany({}),
      ProductModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  }

  const defaultPassword = await hashedPassword('Password@123');

  const admin = (await ensureOne(
    UserModel,
    { email: 'admin@mart.com' },
    {
      name: 'Admin User',
      email: 'admin@mart.com',
      phone: '9000000001',
      password: defaultPassword,
      role: UserRole.ADMIN,
      is_active: true,
      address: {
        line1: '12 Market Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380001',
      },
    },
  )) as WithId<User>;

  const employee = (await ensureOne(
    UserModel,
    { email: 'employee@mart.com' },
    {
      name: 'Operations Lead',
      email: 'employee@mart.com',
      phone: '9000000002',
      password: defaultPassword,
      role: UserRole.EMPLOYEE,
      is_active: true,
      address: {
        line1: '22 Warehouse Lane',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380002',
      },
    },
  )) as WithId<User>;

  const customerOne = (await ensureOne(
    UserModel,
    { email: 'priya@mart.com' },
    {
      name: 'Priya Shah',
      email: 'priya@mart.com',
      phone: '9000000003',
      password: defaultPassword,
      role: UserRole.USER,
      is_active: true,
      address: {
        line1: '55 Riverfront Ave',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380006',
      },
    },
  )) as WithId<User>;

  const customerTwo = (await ensureOne(
    UserModel,
    { email: 'arjun@mart.com' },
    {
      name: 'Arjun Mehta',
      email: 'arjun@mart.com',
      phone: '9000000004',
      password: defaultPassword,
      role: UserRole.USER,
      is_active: true,
      address: {
        line1: '18 Lake View',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
      },
    },
  )) as WithId<User>;

  const customerThree = (await ensureOne(
    UserModel,
    { email: 'neha@mart.com' },
    {
      name: 'Neha Joshi',
      email: 'neha@mart.com',
      phone: '9000000005',
      password: defaultPassword,
      role: UserRole.USER,
      is_active: true,
      address: {
        line1: '9 Sunrise Park',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380054',
      },
    },
  )) as WithId<User>;

  const adminId = admin._id.toString();

  const categorySeeds = [
    { name: 'Electronics', description: 'Latest gadgets and electronic devices' },
    { name: 'Groceries', description: 'Daily essential grocery items' },
    { name: 'Beverages', description: 'Refreshing drinks, tea, and coffee' },
    { name: 'Home & Kitchen', description: 'Appliances and home decor' },
    { name: 'Beauty & Personal Care', description: 'Skincare, haircare, and grooming' },
  ];

  const categories: Record<string, WithId<Category>> = {};
  for (const seed of categorySeeds) {
    const category = await ensureOne(
      CategoryModel,
      { name: seed.name },
      {
        ...seed,
        created_by: adminId,
        is_active: true,
      },
    );
    categories[seed.name] = category as WithId<Category>;
  }

  const productsSeed: ProductSeed[] = [
    // Electronics
    {
      category_id: categories['Electronics']._id.toString(),
      name: 'Smartphone Pro Max',
      description: 'Latest 5G smartphone with 256GB storage and triple camera system.',
      unit: ProductUnit.PIECE,
      unit_weight: 0.2,
      pieces_per_box: 1,
      selling_price_box: 89999,
      purchase_price_box: 82000,
      is_active: true,
    },
    {
      category_id: categories['Electronics']._id.toString(),
      name: 'Wireless Noise Cancelling Headphones',
      description: 'Premium over-ear headphones with 40-hour battery life.',
      unit: ProductUnit.PIECE,
      unit_weight: 0.3,
      pieces_per_box: 1,
      selling_price_box: 15999,
      purchase_price_box: 12000,
      is_active: true,
    },
    {
      category_id: categories['Electronics']._id.toString(),
      name: 'Smart Watch Series 7',
      description: 'Health tracking, GPS, and water resistance up to 50m.',
      unit: ProductUnit.PIECE,
      unit_weight: 0.1,
      pieces_per_box: 1,
      selling_price_box: 24999,
      purchase_price_box: 20000,
      is_active: true,
    },
    // Groceries
    {
      category_id: categories['Groceries']._id.toString(),
      name: 'Premium Basmati Rice',
      description: 'Long grain aromatic basmati rice, aged for 2 years.',
      unit: ProductUnit.KG,
      unit_weight: 5,
      pieces_per_box: 4,
      selling_price_box: 750,
      purchase_price_box: 600,
      is_active: true,
    },
    {
      category_id: categories['Groceries']._id.toString(),
      name: 'Organic Cold Pressed Coconut Oil',
      description: '100% pure and organic coconut oil for cooking and skin.',
      unit: ProductUnit.LITER,
      unit_weight: 1,
      pieces_per_box: 12,
      selling_price_box: 450,
      purchase_price_box: 350,
      is_active: true,
    },
    // Beverages
    {
      category_id: categories['Beverages']._id.toString(),
      name: 'Assam Gold Tea',
      description: 'Strong and refreshing black tea from the gardens of Assam.',
      unit: ProductUnit.GRAM,
      unit_weight: 500,
      pieces_per_box: 24,
      selling_price_box: 280,
      purchase_price_box: 210,
      is_active: true,
    },
    {
      category_id: categories['Beverages']._id.toString(),
      name: 'Roasted Coffee Beans',
      description: 'Medium roast arabica coffee beans with chocolatey notes.',
      unit: ProductUnit.GRAM,
      unit_weight: 250,
      pieces_per_box: 20,
      selling_price_box: 550,
      purchase_price_box: 400,
      is_active: true,
    },
    // Home & Kitchen
    {
      category_id: categories['Home & Kitchen']._id.toString(),
      name: 'Digital Air Fryer',
      description: '6L capacity, 8 preset programs, easy to clean.',
      unit: ProductUnit.PIECE,
      unit_weight: 4.5,
      pieces_per_box: 1,
      selling_price_box: 6999,
      purchase_price_box: 5500,
      is_active: true,
    },
    {
      category_id: categories['Home & Kitchen']._id.toString(),
      name: 'Non-Stick Cookware Set',
      description: '3-piece set including fry pan, kadhai, and tawa.',
      unit: ProductUnit.PIECE,
      unit_weight: 2.8,
      pieces_per_box: 1,
      selling_price_box: 3499,
      purchase_price_box: 2800,
      is_active: true,
    },
    // Beauty & Personal Care
    {
      category_id: categories['Beauty & Personal Care']._id.toString(),
      name: 'Hydrating Face Moisturizer',
      description: 'Deep hydration for 24 hours with hyaluronic acid.',
      unit: ProductUnit.ML,
      unit_weight: 100,
      pieces_per_box: 48,
      selling_price_box: 399,
      purchase_price_box: 250,
      is_active: true,
    },
    {
      category_id: categories['Beauty & Personal Care']._id.toString(),
      name: 'Charcoal Face Wash',
      description: 'Deep cleansing and oil control with activated charcoal.',
      unit: ProductUnit.ML,
      unit_weight: 150,
      pieces_per_box: 36,
      selling_price_box: 249,
      purchase_price_box: 150,
      is_active: true,
    },
  ];


  const products: Record<string, WithId<Product>> = {};
  const productById = new Map<string, WithId<Product>>();
  for (const seed of productsSeed) {
    const product = await ensureOne(
      ProductModel,
      { name: seed.name, category_id: seed.category_id },
      seed,
    );
    const typedProduct = product as WithId<Product>;
    products[seed.name] = typedProduct;
    productById.set(typedProduct._id.toString(), typedProduct);
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  await ensureOne(
    OfferModel,
    { offer_code: 'WELCOME10' },
    {
      offer_name: 'Welcome 10% Off',
      offer_code: 'WELCOME10',
      offer_type: OfferType.ORDER,
      discount_type: OfferDiscountType.PERCENTAGE,
      discount_value: 10,
      min_order_value: 1000,
      start_date: startDate,
      end_date: endDate,
      usage_limit: 500,
      usage_count: 0,
      is_active: true,
      created_by: adminId,
    },
  );

  await ensureOne(
    OfferModel,
    { offer_code: 'BEVERAGE50' },
    {
      offer_name: 'Beverage Flat 50',
      offer_code: 'BEVERAGE50',
      offer_type: OfferType.CATEGORY,
      discount_type: OfferDiscountType.FLAT,
      discount_value: 50,
      applicable_category_ids: [categories['Beverages']._id.toString()],
      min_order_boxes: 1,
      start_date: startDate,
      end_date: endDate,
      usage_limit: 200,
      usage_count: 0,
      is_active: true,
      created_by: adminId,
    },
  );

  await ensureOne(
    OfferModel,
    { offer_code: 'RICEBXGY' },
    {
      offer_name: 'Buy 2 Get 1 Rice',
      offer_code: 'RICEBXGY',
      offer_type: OfferType.BXGY,
      discount_type: OfferDiscountType.FREE_PRODUCT,
      discount_value: 0,
      applicable_product_ids: [products['Premium Basmati Rice']._id.toString()],
      buy_quantity: 2,
      free_quantity: 1,
      free_product_id: products['Premium Basmati Rice']._id.toString(),
      start_date: startDate,
      end_date: endDate,
      usage_limit: 100,
      usage_count: 0,
      is_active: true,
      created_by: adminId,
    },
  );

  const cartOneItems: CartItemSeed[] = [
    {
      product_id: products['Smartphone Pro Max']._id.toString(),
      quantity_boxes: 1,
      price_per_box: products['Smartphone Pro Max'].selling_price_box,
      total_price: products['Smartphone Pro Max'].selling_price_box,
    },
    {
      product_id: products['Assam Gold Tea']._id.toString(),
      quantity_boxes: 2,
      price_per_box: products['Assam Gold Tea'].selling_price_box,
      total_price: 2 * products['Assam Gold Tea'].selling_price_box,
    },
  ];

  const cartTwoItems: CartItemSeed[] = [
    {
      product_id: products['Premium Basmati Rice']._id.toString(),
      quantity_boxes: 1,
      price_per_box: products['Premium Basmati Rice'].selling_price_box,
      total_price: products['Premium Basmati Rice'].selling_price_box,
    },
    {
      product_id: products['Organic Cold Pressed Coconut Oil']._id.toString(),
      quantity_boxes: 1,
      price_per_box: products['Organic Cold Pressed Coconut Oil'].selling_price_box,
      total_price: products['Organic Cold Pressed Coconut Oil'].selling_price_box,
    },
  ];

  const cartThreeItems: CartItemSeed[] = [
    {
      product_id: products['Smartphone Pro Max']._id.toString(),
      quantity_boxes: 1,
      price_per_box: products['Smartphone Pro Max'].selling_price_box,
      total_price: products['Smartphone Pro Max'].selling_price_box,
    },
  ];


  const cartOneTotals = calcTotals(cartOneItems);
  const cartTwoTotals = calcTotals(cartTwoItems);
  const cartThreeTotals = calcTotals(cartThreeItems);

  await CartModel.findOneAndUpdate(
    { user_id: customerOne._id.toString() },
    {
      user_id: customerOne._id.toString(),
      items: cartOneItems,
      ...cartOneTotals,
    },
    { upsert: true, returnDocument: 'after' },
  );

  await CartModel.findOneAndUpdate(
    { user_id: customerTwo._id.toString() },
    {
      user_id: customerTwo._id.toString(),
      items: cartTwoItems,
      ...cartTwoTotals,
    },
    { upsert: true, returnDocument: 'after' },
  );

  await CartModel.findOneAndUpdate(
    { user_id: customerThree._id.toString() },
    {
      user_id: customerThree._id.toString(),
      items: cartThreeItems,
      ...cartThreeTotals,
    },
    { upsert: true, returnDocument: 'after' },
  );

  const existingSeedOrder = await OrderModel.exists({ notes: seedTag });
  if (!existingSeedOrder) {
    const orderOneItems = cartOneItems.map((item) => ({
      ...item,
      product_name: productById.get(item.product_id)?.name ?? 'Product',
    }));
    const orderTwoItems = cartTwoItems.map((item) => ({
      ...item,
      product_name: productById.get(item.product_id)?.name ?? 'Product',
    }));

    const orderOneTotals = calcTotals(cartOneItems);
    const orderTwoTotals = calcTotals(cartTwoItems);

    const orderOne = await OrderModel.create({
      user_id: customerOne._id.toString(),
      items: orderOneItems,
      status: OrderStatus.CONFIRMED,
      ...orderOneTotals,
      applied_offers: [],
      delivery_address: customerOne.address ?? {},
      notes: seedTag,
      created_by: employee._id.toString(),
    });

    const orderTwo = await OrderModel.create({
      user_id: customerTwo._id.toString(),
      items: orderTwoItems,
      status: OrderStatus.PROCESSING,
      ...orderTwoTotals,
      applied_offers: [],
      delivery_address: customerTwo.address ?? {},
      notes: seedTag,
      created_by: employee._id.toString(),
    });
    void orderOne;
    void orderTwo;
  }

  await WishlistModel.findOneAndUpdate(
    {
      user_id: customerOne._id.toString(),
      product_id: products['Assam Gold Tea']._id.toString(),
    },
    {
      user_id: customerOne._id.toString(),
      product_id: products['Assam Gold Tea']._id.toString(),
    },
    { upsert: true, returnDocument: 'after' },
  );

  await WishlistModel.findOneAndUpdate(
    {
      user_id: customerTwo._id.toString(),
      product_id: products['Charcoal Face Wash']._id.toString(),
    },
    {
      user_id: customerTwo._id.toString(),
      product_id: products['Charcoal Face Wash']._id.toString(),
    },
    { upsert: true, returnDocument: 'after' },
  );

  await WishlistModel.findOneAndUpdate(
    {
      user_id: customerThree._id.toString(),
      product_id: products['Digital Air Fryer']._id.toString(),
    },
    {
      user_id: customerThree._id.toString(),
      product_id: products['Digital Air Fryer']._id.toString(),
    },
    { upsert: true, returnDocument: 'after' },
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
