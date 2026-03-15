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
  image_urls?: string[];
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
  const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DB ?? 'Marketing_E';
  const shouldReset =
    process.argv.includes('--reset') ||
    process.env.SEED_RESET === 'true' ||
    process.env.SEED_RESET === '1';

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
    { name: 'Fresh Produce', description: 'Fruits and vegetables' },
    { name: 'Dairy & Eggs', description: 'Milk, yogurt, cheese, eggs' },
    { name: 'Staples', description: 'Grains, flour, lentils, oils' },
    { name: 'Snacks', description: 'Chips, nuts, ready to eat' },
    { name: 'Beverages', description: 'Juices and soft drinks' },
    { name: 'Personal Care', description: 'Soap, shampoo, daily care' },
    { name: 'Household', description: 'Cleaning and home essentials' },
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
    {
      category_id: categories['Fresh Produce']._id.toString(),
      name: 'Banana',
      description: 'Fresh yellow bananas',
      unit: ProductUnit.KG,
      unit_weight: 1,
      pieces_per_box: 10,
      selling_price_box: 320,
      purchase_price_box: 240,
      is_active: true,
    },
    {
      category_id: categories['Fresh Produce']._id.toString(),
      name: 'Tomato',
      description: 'Farm tomatoes',
      unit: ProductUnit.KG,
      unit_weight: 1,
      pieces_per_box: 10,
      selling_price_box: 280,
      purchase_price_box: 200,
      is_active: true,
    },
    {
      category_id: categories['Dairy & Eggs']._id.toString(),
      name: 'Full Cream Milk 1L',
      description: 'Dairy milk 1 liter packs',
      unit: ProductUnit.LITER,
      unit_weight: 1,
      pieces_per_box: 12,
      selling_price_box: 720,
      purchase_price_box: 600,
      is_active: true,
    },
    {
      category_id: categories['Dairy & Eggs']._id.toString(),
      name: 'Eggs 30 Pack',
      description: 'Tray of 30 eggs',
      unit: ProductUnit.PIECE,
      unit_weight: 1,
      pieces_per_box: 10,
      selling_price_box: 1500,
      purchase_price_box: 1200,
      is_active: true,
    },
    {
      category_id: categories['Staples']._id.toString(),
      name: 'Basmati Rice 5kg',
      description: 'Premium basmati rice',
      unit: ProductUnit.KG,
      unit_weight: 5,
      pieces_per_box: 4,
      selling_price_box: 2200,
      purchase_price_box: 1800,
      is_active: true,
    },
    {
      category_id: categories['Staples']._id.toString(),
      name: 'Whole Wheat Atta 5kg',
      description: 'Fresh milled wheat flour',
      unit: ProductUnit.KG,
      unit_weight: 5,
      pieces_per_box: 4,
      selling_price_box: 1800,
      purchase_price_box: 1400,
      is_active: true,
    },
    {
      category_id: categories['Snacks']._id.toString(),
      name: 'Potato Chips 50g',
      description: 'Classic salted chips',
      unit: ProductUnit.GRAM,
      unit_weight: 50,
      pieces_per_box: 24,
      selling_price_box: 720,
      purchase_price_box: 480,
      is_active: true,
    },
    {
      category_id: categories['Snacks']._id.toString(),
      name: 'Salted Peanuts 200g',
      description: 'Roasted peanuts',
      unit: ProductUnit.GRAM,
      unit_weight: 200,
      pieces_per_box: 12,
      selling_price_box: 900,
      purchase_price_box: 600,
      is_active: true,
    },
    {
      category_id: categories['Beverages']._id.toString(),
      name: 'Cola 1L',
      description: 'Sparkling cola',
      unit: ProductUnit.LITER,
      unit_weight: 1,
      pieces_per_box: 12,
      selling_price_box: 960,
      purchase_price_box: 720,
      is_active: true,
    },
    {
      category_id: categories['Beverages']._id.toString(),
      name: 'Orange Juice 1L',
      description: 'Fresh orange juice',
      unit: ProductUnit.LITER,
      unit_weight: 1,
      pieces_per_box: 12,
      selling_price_box: 1200,
      purchase_price_box: 900,
      is_active: true,
    },
    {
      category_id: categories['Personal Care']._id.toString(),
      name: 'Bath Soap 100g',
      description: 'Moisturizing soap bar',
      unit: ProductUnit.GRAM,
      unit_weight: 100,
      pieces_per_box: 48,
      selling_price_box: 1440,
      purchase_price_box: 1000,
      is_active: true,
    },
    {
      category_id: categories['Household']._id.toString(),
      name: 'Dishwash Liquid 500ml',
      description: 'Lemon fresh dishwash',
      unit: ProductUnit.ML,
      unit_weight: 500,
      pieces_per_box: 12,
      selling_price_box: 1500,
      purchase_price_box: 1100,
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
    { offer_code: 'DAIRY50' },
    {
      offer_name: 'Dairy Flat 50',
      offer_code: 'DAIRY50',
      offer_type: OfferType.CATEGORY,
      discount_type: OfferDiscountType.FLAT,
      discount_value: 50,
      applicable_category_ids: [categories['Dairy & Eggs']._id.toString()],
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
      applicable_product_ids: [products['Basmati Rice 5kg']._id.toString()],
      buy_quantity: 2,
      free_quantity: 1,
      free_product_id: products['Basmati Rice 5kg']._id.toString(),
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
      product_id: products['Banana']._id.toString(),
      quantity_boxes: 2,
      price_per_box: products['Banana'].selling_price_box,
      total_price: 2 * products['Banana'].selling_price_box,
    },
    {
      product_id: products['Cola 1L']._id.toString(),
      quantity_boxes: 1,
      price_per_box: products['Cola 1L'].selling_price_box,
      total_price: products['Cola 1L'].selling_price_box,
    },
  ];

  const cartTwoItems: CartItemSeed[] = [
    {
      product_id: products['Basmati Rice 5kg']._id.toString(),
      quantity_boxes: 1,
      price_per_box: products['Basmati Rice 5kg'].selling_price_box,
      total_price: products['Basmati Rice 5kg'].selling_price_box,
    },
    {
      product_id: products['Full Cream Milk 1L']._id.toString(),
      quantity_boxes: 1,
      price_per_box: products['Full Cream Milk 1L'].selling_price_box,
      total_price: products['Full Cream Milk 1L'].selling_price_box,
    },
  ];

  const cartThreeItems: CartItemSeed[] = [
    {
      product_id: products['Potato Chips 50g']._id.toString(),
      quantity_boxes: 2,
      price_per_box: products['Potato Chips 50g'].selling_price_box,
      total_price: 2 * products['Potato Chips 50g'].selling_price_box,
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
      product_id: products['Orange Juice 1L']._id.toString(),
    },
    {
      user_id: customerOne._id.toString(),
      product_id: products['Orange Juice 1L']._id.toString(),
    },
    { upsert: true, returnDocument: 'after' },
  );

  await WishlistModel.findOneAndUpdate(
    {
      user_id: customerTwo._id.toString(),
      product_id: products['Bath Soap 100g']._id.toString(),
    },
    {
      user_id: customerTwo._id.toString(),
      product_id: products['Bath Soap 100g']._id.toString(),
    },
    { upsert: true, returnDocument: 'after' },
  );

  await WishlistModel.findOneAndUpdate(
    {
      user_id: customerThree._id.toString(),
      product_id: products['Dishwash Liquid 500ml']._id.toString(),
    },
    {
      user_id: customerThree._id.toString(),
      product_id: products['Dishwash Liquid 500ml']._id.toString(),
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
