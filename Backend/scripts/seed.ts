import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';
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

  // 2. Load Data from data.json
  console.log('Loading data.json...');
  const dataPath = join(__dirname, 'data.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found at ${dataPath}`);
  }
  const rawData = fs.readFileSync(dataPath, 'utf8');

  let allProducts: any[] = [];
  try {
    allProducts = JSON.parse(rawData);
  } catch (e) {
    console.warn(
      'JSON is truncated or invalid, attempting to recover products using regex...',
    );

    // Each product object starts with { at 4 spaces indentation and ends with } at 4 spaces indentation
    const objectRegex = /^    \{[\s\S]*?\n    \}/gm;
    const matches = rawData.match(objectRegex);

    if (matches) {
      console.log(`Found ${matches.length} potential product objects.`);
      for (const match of matches) {
        try {
          // Clean up potential trailing commas and other common issues
          const cleanedMatch = match.replace(/,\s*([\]\}])/g, '$1').trim();

          const parsed = JSON.parse(cleanedMatch);
          allProducts.push(parsed);
        } catch (parseError) {
          // Skip invalid ones
        }
      }
    }
  }
  const productsToSeed = allProducts.slice(0, 100);

  // 3. Extract and Seed Categories
  console.log('Seeding Categories...');
  const uniqueCategoryNames = Array.from(
    new Set(productsToSeed.map((p: any) => p.category).filter(Boolean)),
  );
  const categoryMap = new Map<string, string>();

  for (const catName of uniqueCategoryNames) {
    const category = await ensureOne(
      CategoryModel,
      { name: catName },
      {
        name: catName as string,
        description: `${catName} category`,
        created_by: adminId,
        is_active: true,
      },
    );
    categoryMap.set(catName as string, category._id.toString());
  }

  // 4. Seed Products
  console.log('Clearing existing products...');
  await ProductModel.deleteMany({});

  console.log(
    `Seeding up to ${productsToSeed.length} Products with S3 Uploads...`,
  );
  let seededCount = 0;
  for (const p of productsToSeed) {
    if (!p.title) {
      console.warn('Skipping product with missing title');
      continue;
    }
    const catId = categoryMap.get(p.category);
    if (!catId) {
      console.warn(
        `Skipping product "${p.title}" due to missing category mapping for "${p.category}"`,
      );
      continue;
    }

    const sellingPrice = parseFloat(p.selling_price?.replace(/,/g, '') || '0');
    const actualPrice = parseFloat(p.actual_price?.replace(/,/g, '') || '0');

    // Attempt to upload image to S3
    const imageUrl = Array.isArray(p.images) ? p.images[0] : p.images;
    let s3Key = 'images/product-placeholder.jpg';

    if (imageUrl && imageUrl.startsWith('http')) {
      console.log(`Uploading image for "${p.title}"...`);
      const uploadedKey = await uploadImageFromUrl(imageUrl, bucket);
      if (uploadedKey) {
        s3Key = uploadedKey;
      }
    }

    try {
      await ensureOne(
        ProductModel,
        { name: p.title, category_id: catId },
        {
          name: p.title,
          description: p.description || '',
          category_id: catId,
          unit: ProductUnit.PIECE,
          unit_weight: 1,
          pieces_per_box: 1,
          selling_price_box: sellingPrice,
          purchase_price_box: actualPrice || sellingPrice,
          image_key: s3Key,
          variant: 'Standard',
          stock_boxes: Math.floor(Math.random() * 91) + 10,
          is_active: true,
        },
      );
      seededCount++;
    } catch (err) {
      console.error(
        `Failed to seed product "${p.title}":`,
        err instanceof Error ? err.message : err,
      );
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
