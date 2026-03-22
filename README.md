# E-commerce Agency

A full-stack B2B e-commerce platform with three apps in one repository:

- `Backend`: NestJS + MongoDB REST API
- `Website`: React admin/public web portal
- `Apk`: React + Capacitor mobile app

This monorepo supports product catalog management, cart and order workflows, role-based staff operations, offers/discounts, and profile/wishlist features.

## Platform Access Model

- `Website` is the admin portal. Admins log in from `/login` and manage/monitor business activity generated from the app (orders, products, categories, offers, employees).
- `Apk` is the client app for all users (customers by default, with employee-specific order routes for staff operations).

## Architecture

```text
E-commerce_Agency/
├── Backend/   # NestJS API + MongoDB
├── Website/   # Admin + marketing web app (React + Vite)
└── Apk/       # Mobile web/app client (React + Vite + Capacitor)
```

## Tech Stack

- Backend: NestJS 11, MongoDB (Mongoose), JWT auth, role guards
- Website: React 19, TypeScript, Vite, React Router
- Apk: React 19, TypeScript, Vite, React Router, Capacitor Android

## Quick Start

### 1) Backend

```bash
cd Backend
npm install
npm run start:dev
```

API runs at `http://localhost:3000` (default).

### 2) Website

```bash
cd Website
npm install
npm run dev
```

### 3) Apk

```bash
cd Apk
npm install
npm run dev
```

For Android build/sync (optional):

```bash
npm run cap:sync
npm run android:build
```

## Environment

Create/update `Backend/.env` with required keys:

```env
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
AWS_REGION=
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
CORS_ORIGINS=
PORT=3000
```

Notes:

- API currently connects MongoDB using defaults from code: `mongodb://localhost:27017`, DB `Marketing_E`.
- Frontends currently call backend at `http://localhost:3000`.

## Frontend Routes

### Website Routes

| Path | Access | Screen |
|---|---|---|
| `/` | Public | HomePage |
| `/about` | Public | AboutPage |
| `/contact` | Public | ContactPage |
| `/features` | Public | FeaturesPage |
| `/pricing` | Public | PricingPage |
| `/login` | Public (Admin login page) | Admin Login |
| `/admin` | Admin | Dashboard |
| `/admin/products` | Admin | ProductManagement |
| `/admin/categories` | Admin | CategoryManagement |
| `/admin/offers` | Admin | OfferManagement |
| `/admin/orders` | Admin | OrderManagement |
| `/admin/employees` | Admin | EmployeeManagement |

### Apk Routes

| Path | Access | Screen |
|---|---|---|
| `/` | Public/App | HomePage |
| `/categories` | Public/App | CategoriesPage |
| `/categories/:categoryId` | Public/App | CategoryProductsPage |
| `/products` | Public/App | ProductsPage |
| `/products/:productId` | App user | ProductDetialsPage |
| `/cart` | Auth | CartPage |
| `/orders` | Auth | OrdersPage |
| `/orders/:orderId` | Auth | OrderDetailsPage |
| `/employee/orders` | Employee | EmployeeOrdersPage |
| `/employee/orders/:orderId` | Employee | EmployeeOrderDetailsPage |
| `/profile` | Auth | ProfilePage |
| `/wishlist` | Auth | WishlistPage |
| `/login` | Public | LoginPage |
| `/signup` | Public | SignupPage |

Access meaning:

- `Public/App`: app navigation available to everyone.
- `App user` / `Auth`: signed-in APK user.
- `Employee`: signed-in user with employee role.
- `Admin`: signed-in user with admin role (website admin panel).

## Backend API Routes

Base URL: `http://localhost:3000`

### Health

| Method | Route | Access |
|---|---|---|
| `GET` | `/` | Public |

### User

| Method | Route | Access |
|---|---|---|
| `POST` | `/user/signup` | Public |
| `POST` | `/user/verify-otp` | Public |
| `POST` | `/user/resend-otp` | Public |
| `POST` | `/user/login` | Public |
| `POST` | `/user/create-staff` | Admin |
| `GET` | `/user/profile` | Auth |
| `GET` | `/user/admin` | Admin |
| `GET` | `/user/employees` | Admin |
| `GET` | `/user/:user_id` | Admin, Employee |

### Product

| Method | Route | Access |
|---|---|---|
| `POST` | `/product/create` | Admin |
| `POST` | `/product/image/upload-url` | Admin |
| `PATCH` | `/product/:product_id` | Admin |
| `DELETE` | `/product/:product_id` | Admin |
| `GET` | `/product/all` | Public |
| `GET` | `/product/:product_id` | Auth |

### Category

| Method | Route | Access |
|---|---|---|
| `POST` | `/category/create` | Admin |
| `GET` | `/category/all` | Public |
| `GET` | `/category/:category_id` | Public |
| `PATCH` | `/category/:category_id` | Admin |
| `DELETE` | `/category/:category_id` | Admin |

### Offer

| Method | Route | Access |
|---|---|---|
| `POST` | `/offer/create` | Admin |
| `GET` | `/offer/all` | Public |
| `GET` | `/offer/active` | Public |
| `GET` | `/offer/eligible` | Auth |
| `GET` | `/offer/:offer_id` | Public |
| `PATCH` | `/offer/:offer_id` | Admin |
| `DELETE` | `/offer/:offer_id` | Admin |

### Cart

| Method | Route | Access |
|---|---|---|
| `GET` | `/cart/my` | Auth |
| `POST` | `/cart/add-item` | Auth |
| `PATCH` | `/cart/item/:product_id` | Auth |
| `DELETE` | `/cart/item/:product_id` | Auth |
| `DELETE` | `/cart/clear` | Auth |

### Wishlist

| Method | Route | Access |
|---|---|---|
| `GET` | `/wishlist/my` | Auth |
| `POST` | `/wishlist/toggle/:product_id` | Auth |

### Order

| Method | Route | Access |
|---|---|---|
| `POST` | `/order/create` | Auth |
| `GET` | `/order/my` | Auth |
| `GET` | `/order/my/:order_id` | Auth |
| `PATCH` | `/order/my/:order_id/cancel` | Auth |
| `GET` | `/order/all` | Admin, Employee |
| `GET` | `/order/assigned/my` | Employee |
| `GET` | `/order/:order_id` | Admin, Employee |
| `PATCH` | `/order/:order_id/status` | Admin, Employee |
| `PATCH` | `/order/:order_id/assign` | Admin |

## API DTOs (What To Send / What You Get)

Response pattern used by controllers:

- Most endpoints return `{ message, data }`
- List endpoints with pagination return `{ message, data, pagination }`
- Auth endpoints like login/otp may return custom objects

Common path/query inputs:

- Path params: `:user_id`, `:product_id`, `:category_id`, `:offer_id`, `:order_id`
- Pagination query (where supported): `?page=1&limit=50`

### User DTOs

`POST /user/signup` and `POST /user/create-staff` body:

| Field | Type | Required |
|---|---|---|
| `name` | `string` | Yes |
| `email` | `string` | Yes |
| `phone` | `string` | Yes |
| `password` | `string` | Yes |
| `role` | `"admin" | "user" | "employee"` | No (server sets role depending on endpoint) |
| `address` | `Record<string, unknown>` | Yes for signup flow in current service logic |

Response:

- Signup: `{ message: "User created successfully. Please verify OTP sent to your email." }`
- Create staff: `{ message: "Employee created successfully", data: User }`

`POST /user/verify-otp` body:

| Field | Type | Required |
|---|---|---|
| `emailOrPhone` | `string` | Yes |
| `otp` | `string` | Yes |

Response:

- `{ message: "OTP verified successfully" }`

`POST /user/resend-otp` body:

| Field | Type | Required |
|---|---|---|
| `emailOrPhone` | `string` | Yes |

Response:

- `{ message: "OTP sent successfully" }`

`POST /user/login` body:

| Field | Type | Required |
|---|---|---|
| `email` | `string` | Yes |
| `password` | `string` | Yes |

Response:

- `{ message: "Login successful", email: string, token: string }`

`GET /user/profile`, `GET /user/:user_id`, `GET /user/employees` response:

- `{ message, data: User | User[] }` (password excluded)

`GET /user/admin` response:

- `{ message: "Admin access granted", user: decodedTokenPayload }`

User role enum:

- `admin`
- `user`
- `employee`

### Product DTOs

`POST /product/create` body:

| Field | Type | Required |
|---|---|---|
| `category_id` | `string` | Yes |
| `product_name` | `string` | Present in DTO (server persists `name`) |
| `name` | `string` | Yes |
| `description` | `string` | No |
| `unit` | `"kg" | "gram" | "liter" | "ml" | "piece"` | Yes |
| `unit_weight` | `number` | Yes |
| `pieces_per_box` | `number` | Yes |
| `selling_price_box` | `number` | Yes |
| `purchase_price_box` | `number` | Yes |
| `image_url` | `string` | No |
| `is_active` | `boolean` | No |

Response:

- `{ message: "Product created successfully", data: Product }`

`POST /product/image/upload-url` body:

| Field | Type | Required |
|---|---|---|
| `fileType` | `string` (example: `image/png`) | Yes |

Response:

- `{ message: "Product image upload URL generated", data: { uploadUrl, key, publicUrl } }`

`PATCH /product/:product_id` body (`UpdateProductDto`):

- Any subset of create fields
- Additional optional flag in DTO: `is_activate?: boolean`

Response:

- `{ message: "Product updated successfully", data: Product }`

`DELETE /product/:product_id` response:

- `{ message: "Product deleted successfully", data: Product }`

`GET /product/all` response:

- `{ message, data: Product[], pagination }`

`GET /product/:product_id` response:

- `{ message: "Product fetched successfully", data: Product }`

### Category DTOs

`POST /category/create` body:

| Field | Type | Required |
|---|---|---|
| `name` | `string` | Yes |
| `description` | `string` | No |
| `is_active` | `boolean` | No |

Response:

- `{ message: "Category created successfully", data: Category }`

`PATCH /category/:category_id` body:

- Any subset of:
  - `name?: string`
  - `description?: string`
  - `is_active?: boolean`
  - `is_activate?: boolean`

Response:

- `{ message: "Category updated successfully", data: Category }`

`GET /category/all` response:

- `{ message, data: Category[], pagination }`

`GET /category/:category_id` response:

- `{ message: "Category fetched successfully", data: Category }`

`DELETE /category/:category_id` response:

- `{ message: "Category deleted successfully", data: Category }`

### Offer DTOs

`POST /offer/create` body:

| Field | Type | Required |
|---|---|---|
| `offer_name` | `string` | Yes |
| `offer_code` | `string` | Yes |
| `offer_type` | `"ORDER" | "PRODUCT" | "CATEGORY" | "TARGET" | "BXGY"` | Yes |
| `discount_type` | `"flat" | "percentage" | "free_product"` | Yes |
| `discount_value` | `number` | Yes |
| `min_order_value` | `number` | No |
| `min_order_boxes` | `number` | No |
| `applicable_product_ids` | `string[]` | No |
| `applicable_category_ids` | `string[]` | No |
| `buy_quantity` | `number` | No |
| `free_quantity` | `number` | No |
| `free_product_id` | `string` | No |
| `target_boxes` | `number` | No |
| `reward_amount` | `number` | No |
| `start_date` | `Date` / ISO string | Yes |
| `end_date` | `Date` / ISO string | Yes |
| `usage_limit` | `number | null` | No |
| `usage_count` | `number` | No |
| `is_active` | `boolean` | No |

Response:

- `{ message: "Offer created successfully", data: Offer }`

`PATCH /offer/:offer_id` body:

- Any subset of create fields
- Additional optional flag in DTO: `is_activate?: boolean`

Response:

- `{ message: "Offer updated successfully", data: Offer }`

Other offer responses:

- `GET /offer/all`: `{ message, data: Offer[], pagination }`
- `GET /offer/active`: `{ message: "Active offers fetched successfully", data: Offer[] }`
- `GET /offer/eligible`: `{ message: "Eligible offers fetched successfully", data: EligibleOffer[] }`
- `GET /offer/:offer_id`: `{ message: "Offer fetched successfully", data: Offer }`
- `DELETE /offer/:offer_id`: `{ message: "Offer deleted successfully", data: Offer }`

### Cart DTOs

`POST /cart/add-item` body:

| Field | Type | Required |
|---|---|---|
| `product_id` | `string` | Yes |
| `quantity_boxes` | `number` | Yes |
| `applied_offer_id` | `string` | No |

Response:

- `{ message: "Item added to cart successfully", data: Cart }`

`PATCH /cart/item/:product_id` body:

| Field | Type | Required |
|---|---|---|
| `quantity_boxes` | `number` | Yes |
| `applied_offer_id` | `string` | No |

Responses:

- `GET /cart/my`: `{ message: "Cart fetched successfully", data: Cart }`
- `PATCH /cart/item/:product_id`: `{ message: "Cart item updated successfully", data: Cart }`
- `DELETE /cart/item/:product_id`: `{ message: "Item removed from cart successfully", data: Cart }`
- `DELETE /cart/clear`: `{ message: "Cart cleared successfully", data: Cart }`

### Wishlist DTOs

No request body required.

- `GET /wishlist/my` response: `{ message: "Wishlist fetched successfully", data: Wishlist[] }`
- `POST /wishlist/toggle/:product_id` response: `{ message: "Wishlist updated successfully", data: Wishlist | null }`

### Order DTOs

`POST /order/create` body:

| Field | Type | Required |
|---|---|---|
| `delivery_address` | `Record<string, unknown>` | Yes |
| `notes` | `string` | No |
| `refer_to` | `string` | No |

Response:

- `{ message: "Order created successfully", data: Order }`

`PATCH /order/my/:order_id/cancel` body:

| Field | Type | Required |
|---|---|---|
| `cancellation_reason` | `string` | Yes |

`PATCH /order/:order_id/status` body:

| Field | Type | Required |
|---|---|---|
| `status` | `"pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"` | Yes |
| `notes` | `string` | No |

`PATCH /order/:order_id/assign` body:

| Field | Type | Required |
|---|---|---|
| `assign_to` | `string` | Yes |

Order responses:

- `GET /order/my`: `{ message: "My orders fetched successfully", data: Order[] }`
- `GET /order/my/:order_id`: `{ message: "Order fetched successfully", data: Order }`
- `PATCH /order/my/:order_id/cancel`: `{ message: "Order cancelled successfully", data: Order }`
- `GET /order/all`: `{ message, data: Order[], pagination }`
- `GET /order/assigned/my`: `{ message: "Assigned orders fetched successfully", data: Order[] }`
- `GET /order/:order_id`: `{ message: "Order fetched successfully", data: Order }`
- `PATCH /order/:order_id/status`: `{ message: "Order status updated successfully", data: Order }`
- `PATCH /order/:order_id/assign`: `{ message: "Order assigned successfully", data: Order }`

## Common Dev Commands

### Backend

```bash
npm run start:dev
npm run build
npm run test
npm run seed
```

### Website

```bash
npm run dev
npm run build
npm run lint
```

### Apk

```bash
npm run dev
npm run build
npm run android:dev
npm run android:build
```

## Current Notes

- `Backend/Dockerfile` exists but is empty in this repository state.
- API clients in `Website` and `Apk` are currently pointed to `http://localhost:3000`.
