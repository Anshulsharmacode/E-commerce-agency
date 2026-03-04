Bulk B2B eCommerce Platform – Product Requirements Document (PRD)

1. Product Overview
   1.1 Purpose

Build a B2B eCommerce platform designed for agencies, wholesalers, and bulk buyers. The platform enables verified businesses to purchase products in bulk (box-based ordering), access advanced discount systems, and manage repeat purchases efficiently.

1.2 Target Users

Retail agencies

Distributors

Institutional buyers

Franchise operators

Bulk procurement managers

1.3 Business Objective

Increase bulk transaction volume

Enable recurring purchases

Provide flexible discount and pricing models

Support credit-based B2B commerce

2. Core Features

Agency Signup & Verification

Product Category Management

Product & Variant Management (Box-based pricing)

Advanced Offer & Discount Engine

Tiered Pricing System

Cart & Checkout

Wishlist / Like System

Order Management

Credit Wallet System (Phase 2)

Admin Dashboard

3. User Authentication & Verification
   3.1 Signup Requirements
   Required Fields

Full Name

Shop Name

Phone Number (OTP verified)

Email (optional but recommended)

Password

Business Address

GST / Business ID (optional in MVP)

User Schema
{
user_id: UUID,
name: String,
shop_name: String,
phone: String,
email: String,
password_hash: String,
is_verified_user: Boolean,
verification_status: "pending | approved | rejected",
credit_limit: Decimal,
available_credit: Decimal,
due_amount: Decimal,
created_at: Timestamp
}
Verification Flow

OTP verification via phone

Admin approval

Verified badge enabled

Only approved users can place orders

4. Product Category Module

Supports hierarchical categories.

Examples:

Beverages

Cold Drink

Juice

Grocery

Dry Fruits

Category Schema
{
category_id: UUID,
category_name: String,
category_slug: String,
parent_category_id: UUID | null,
description: Text,
image_url: String,
status: "active | inactive",
created_at: Timestamp
} 5. Product Management
5.1 Product Rules

Products are sold in boxes only.

Unit price means price per box.

Minimum order quantity defined in boxes.

5.2 Product Schema
{
product_id: UUID,
product_name: String,
product_description: Text,
sku_code: String,
brand: String,

unit_price_per_box: Decimal,
cost_price_per_box: Decimal,

pieces_per_box: Integer,
minimum_order_boxes: Integer,
stock_boxes: Integer,

category_id: UUID,
has_variants: Boolean,

status: "active | inactive",
created_at: Timestamp,
updated_at: Timestamp

//Skip This varient for now
} 6. Product Variants

Examples:

250ml

500ml

2kg

20ml

Variant Schema
{
variant_id: UUID,
product_id: UUID,
variant_name: String,
sku_code: String,
unit_price_per_box: Decimal,
pieces_per_box: Integer,
stock_boxes: Integer,
status: "active | inactive"
} 7. Tiered Pricing (Volume-Based Pricing)

Encourages larger purchases.

Example:

Min Boxes Price Per Box
1–50 ₹1000
51–200 ₹950
201+ ₹900
Tier Pricing Schema
{
tier_id: UUID,
product_id: UUID,
min_boxes: Integer,
price_per_box: Decimal
}

System automatically applies best tier price.

8. Offer & Discount Engine

Supports multiple offer types.

8.1 Master Offer Schema
{
offer_id: UUID,
offer_name: String,
offer_type: "ORDER | PRODUCT | CATEGORY | TARGET | BXGY",
discount_type: "flat | percentage | free_product",
discount_value: Decimal,

min_order_value: Decimal,
min_order_boxes: Integer,

applicable_product_ids: Array,
applicable_category_ids: Array,

start_date: Date,
end_date: Date,
usage_limit: Integer,
is_active: Boolean
}
8.2 Offer Types

1. Order-Level Offer

Applies to entire cart.
Example:

₹1000 off above ₹50,000

5% off above 100 boxes

2. Product-Level Offer

Applies to specific product.

3. Category-Level Offer

Applies to all products in a category.

4. Target / Trip Offer

Reward based on total purchase quantity.

Example:

Buy 500 boxes → Get ₹5000 reward

5. Buy X Get Y (BXGY)

Example:

Buy 10 boxes → Get 1 free

{
buy_quantity: Integer,
free_quantity: Integer
} 9. Cart System
9.1 Cart Schema
{
cart_id: UUID,
user_id: UUID,
items: [
{
product_id: UUID,
variant_id: UUID,
quantity_boxes: Integer,
price_per_box: Decimal,
applied_offer_id: UUID,
total_price: Decimal
}
],
total_amount: Decimal,
total_discount: Decimal,
final_amount: Decimal,
updated_at: Timestamp
}
9.2 Cart Logic

Box-based quantity only

Auto-apply best eligible offer

Persistent cart

Stock validation

Show savings summary

10. Wishlist / Like System
    Like Schema
    {
    like_id: UUID,
    user_id: UUID,
    product_id: UUID,
    created_at: Timestamp
    }
    Features

Save products

Quick reorder

Show trending liked products

11. Order Management
    Order Schema
    {
    order_id: UUID,
    user_id: UUID,

total_boxes: Integer,
total_amount: Decimal,
total_discount: Decimal,
final_amount: Decimal,

applied_offer_ids: Array,

payment_status: "pending | paid | credit",
order_status: "placed | confirmed | shipped | delivered | cancelled",

created_at: Timestamp
} 12. Payment System
Phase 1

UPI

Net Banking

COD (optional)

Phase 2

Credit limit system

Partial payments

Due tracking

Monthly statement

13. Admin Panel Requirements

Approve/reject users

Add/edit categories

Add/edit products & variants

Manage stock

Create/manage offers

View orders

Sales analytics

Bulk product upload (CSV)

User credit management

14. Business Logic Rules

Only verified users can place orders

Orders must meet minimum box quantity

Offers cannot stack unless explicitly allowed

System applies highest benefit offer

Stock deducted after order confirmation

Cart reserves stock temporarily

15. Non-Functional Requirements

Scalable to 100k+ products

High concurrency support

Secure authentication (JWT)

Optimized DB indexing

Audit logs for admin changes

16. MVP Scope
    Must Have

Signup + Verification

Category management

Product listing

Box pricing

Cart

Basic offers (flat + percentage)

Order placement

Admin panel

Phase 2

Tier pricing

Credit system

Target offers

CSV quick order upload

Analytics dashboard

Smart recommendations

17. Key KPIs

Average Order Value (AOV)

Repeat Purchase Rate

Monthly GMV

Cart Abandonment Rate

Offer Utilization Rate

Credit Recovery Rate

18. Future Enhancements

One-click reorder

Subscription-based auto-refill

Geo-based offers

Sales rep assignment

Territory management

Mobile app (Flutter/React Native)
