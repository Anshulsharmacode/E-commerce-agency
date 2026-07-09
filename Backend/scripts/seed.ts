import * as dotenv from 'dotenv';
import { join } from 'path';
import mongoose, { Model, Schema } from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Load environment variables
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: join(process.cwd(), `.env.${nodeEnv}`) });
dotenv.config();

// Using paths relative to baseUrl specified in tsconfig.json
import {
  Category,
  CategorySchema,
  Offer,
  OfferDiscountType,
  OfferSchema,
  OfferType,
  Product,
  ProductSchema,
  ProductUnit,
  User,
  UserRole,
  UserSchema,
} from '../src/db/schema';
import { hashedPassword } from '../src/utills/utills';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

async function uploadImageFromUrl(
  url: string,
  bucket: string,
): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.split('/')[1] || 'jpg';
    const key = `images/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${extension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return key;
  } catch (error) {
    console.warn(
      `Failed to upload image from ${url}:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

type AnyModel<T> = Model<T>;

function getModel<T>(name: string, schema: Schema<T>): AnyModel<T> {
  return (mongoose.models[name] as AnyModel<T>) ?? mongoose.model(name, schema);
}

async function ensureOne<T>(
  model: AnyModel<T>,
  query: Record<string, unknown>,
  data: Partial<T>,
): Promise<any> {
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
  const bucket = process.env.AWS_S3_BUCKET || 'ecom-agency';

  if (!uri) {
    throw new Error('Mongo URI missing. Set it in environment variables.');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { dbName });
  console.log('Connected to database:', dbName);

  const UserModel = getModel(User.name, UserSchema);
  const CategoryModel = getModel(Category.name, CategorySchema);
  const ProductModel = getModel(Product.name, ProductSchema);
  const OfferModel = getModel(Offer.name, OfferSchema);

  // 1. Seed Admin User
  console.log('Seeding Admin...');
  const defaultPassword = await hashedPassword('Password@123');
  const admin = await ensureOne(
    UserModel,
    { email: 'admin@mart.com' },
    {
      name: 'Admin User',
      email: 'admin@mart.com',
      phone: '9000000001',
      password: defaultPassword,
      role: UserRole.ADMIN,
      is_active: true,
    },
  );
  const adminId = admin._id.toString();

  // 2. Define Dummy Data
  console.log('Preparing dummy data...');
  const dummyCategories = [
    { name: 'Electronics', description: 'Latest gadgets and electronic devices' },
    { name: 'Groceries', description: 'Daily essential grocery items' },
    { name: 'Beverages', description: 'Refreshing drinks, tea, and coffee' },
    { name: 'Home & Kitchen', description: 'Appliances and home decor' },
    { name: 'Beauty & Personal Care', description: 'Skincare, haircare, and grooming' },
  ];

  const dummyProducts = [
    // Electronics
    {
      name: 'Smartphone Pro Max',
      description: 'Latest 5G smartphone with 256GB storage and triple camera system.',
      category: 'Electronics',
      unit: ProductUnit.PIECE,
      unit_weight: 0.2,
      pieces_per_box: 1,
      selling_price: 89999,
      purchase_price: 82000,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      stock: 50,
    },
    {
      name: 'Wireless Noise Cancelling Headphones',
      description: 'Premium over-ear headphones with 40-hour battery life.',
      category: 'Electronics',
      unit: ProductUnit.PIECE,
      unit_weight: 0.3,
      pieces_per_box: 1,
      selling_price: 15999,
      purchase_price: 12000,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      stock: 30,
    },
    {
      name: 'Smart Watch Series 7',
      description: 'Health tracking, GPS, and water resistance up to 50m.',
      category: 'Electronics',
      unit: ProductUnit.PIECE,
      unit_weight: 0.1,
      pieces_per_box: 1,
      selling_price: 24999,
      purchase_price: 20000,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      stock: 45,
    },
    // Groceries
    {
      name: 'Premium Basmati Rice',
      description: 'Long grain aromatic basmati rice, aged for 2 years.',
      category: 'Groceries',
      unit: ProductUnit.KG,
      unit_weight: 5,
      pieces_per_box: 4,
      selling_price: 750,
      purchase_price: 600,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
      stock: 100,
    },
    {
      name: 'Organic Cold Pressed Coconut Oil',
      description: '100% pure and organic coconut oil for cooking and skin.',
      category: 'Groceries',
      unit: ProductUnit.LITER,
      unit_weight: 1,
      pieces_per_box: 12,
      selling_price: 450,
      purchase_price: 350,
      image: 'https://images.unsplash.com/photo-1590779033100-9f60705a2f3b?w=500',
      stock: 80,
    },
    // Beverages
    {
      name: 'Assam Gold Tea',
      description: 'Strong and refreshing black tea from the gardens of Assam.',
      category: 'Beverages',
      unit: ProductUnit.GRAM,
      unit_weight: 500,
      pieces_per_box: 24,
      selling_price: 280,
      purchase_price: 210,
      image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=500',
      stock: 150,
    },
    {
      name: 'Roasted Coffee Beans',
      description: 'Medium roast arabica coffee beans with chocolatey notes.',
      category: 'Beverages',
      unit: ProductUnit.GRAM,
      unit_weight: 250,
      pieces_per_box: 20,
      selling_price: 550,
      purchase_price: 400,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
      stock: 60,
    },
    // Home & Kitchen
    {
      name: 'Digital Air Fryer',
      description: '6L capacity, 8 preset programs, easy to clean.',
      category: 'Home & Kitchen',
      unit: ProductUnit.PIECE,
      unit_weight: 4.5,
      pieces_per_box: 1,
      selling_price: 6999,
      purchase_price: 5500,
      image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500',
      stock: 25,
    },
    {
      name: 'Non-Stick Cookware Set',
      description: '3-piece set including fry pan, kadhai, and tawa.',
      category: 'Home & Kitchen',
      unit: ProductUnit.PIECE,
      unit_weight: 2.8,
      pieces_per_box: 1,
      selling_price: 3499,
      purchase_price: 2800,
      image: 'https://images.unsplash.com/photo-1584990344468-ca4cc7c44b4b?w=500',
      stock: 40,
    },
    // Beauty & Personal Care
    {
      name: 'Hydrating Face Moisturizer',
      description: 'Deep hydration for 24 hours with hyaluronic acid.',
      category: 'Beauty & Personal Care',
      unit: ProductUnit.ML,
      unit_weight: 100,
      pieces_per_box: 48,
      selling_price: 399,
      purchase_price: 250,
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500',
      stock: 200,
    },
    {
      name: 'Charcoal Face Wash',
      description: 'Deep cleansing and oil control with activated charcoal.',
      category: 'Beauty & Personal Care',
      unit: ProductUnit.ML,
      unit_weight: 150,
      pieces_per_box: 36,
      selling_price: 249,
      purchase_price: 150,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      stock: 180,
    },
  ];

  // 3. Seed Categories
  console.log('Seeding Categories...');
  const categoryMap = new Map<string, string>();

  for (const cat of dummyCategories) {
    const category = await ensureOne(
      CategoryModel,
      { name: cat.name },
      {
        name: cat.name,
        description: cat.description,
        created_by: adminId,
        is_active: true,
      },
    );
    categoryMap.set(cat.name, category._id.toString());
  }

  // 4. Seed Products
  console.log('Clearing existing products...');
  await ProductModel.deleteMany({});

  console.log(`Seeding ${dummyProducts.length} Products...`);
  let seededCount = 0;
  for (const p of dummyProducts) {
    const catId = categoryMap.get(p.category);
    if (!catId) {
      console.warn(`Skipping product "${p.name}" due to missing category mapping for "${p.category}"`);
      continue;
    }

    // Attempt to upload image to S3 if URL is provided
    let s3Key = 'images/product-placeholder.jpg';
    if (p.image && p.image.startsWith('http')) {
      console.log(`Uploading image for "${p.name}"...`);
      const uploadedKey = await uploadImageFromUrl(p.image, bucket);
      if (uploadedKey) {
        s3Key = uploadedKey;
      }
    }

    try {
      await ProductModel.create({
        name: p.name,
        description: p.description,
        category_id: catId,
        unit: p.unit,
        unit_weight: p.unit_weight,
        pieces_per_box: p.pieces_per_box,
        selling_price_box: p.selling_price,
        purchase_price_box: p.purchase_price,
        image_key: s3Key,
        variant: 'Standard',
        stock_boxes: p.stock,
        is_active: true,
      });
      seededCount++;
    } catch (err) {
      console.error(`Failed to seed product "${p.name}":`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`Successfully seeded ${seededCount} products.`);


  // 5. Seed a dummy Offer
  console.log('Seeding Offer...');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  await ensureOne(
    OfferModel,
    { offer_code: 'FLAT20' },
    {
      offer_name: 'Flat 20% Off',
      offer_code: 'FLAT20',
      offer_type: OfferType.ORDER,
      discount_type: OfferDiscountType.PERCENTAGE,
      discount_value: 20,
      min_order_value: 500,
      start_date: startDate,
      end_date: endDate,
      usage_limit: 100,
      usage_count: 0,
      is_active: true,
      created_by: adminId,
    },
  );

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Seed failed:', error);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
