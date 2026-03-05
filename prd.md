Below is a **complete `PRD.md` tailored to your requirements**:

- **Backend:** NestJS
- **Database:** MongoDB
- **Structure:** flat module files like
  `user.controller.ts`, `user.service.ts`, `user.dto.ts`
- **Frontend:** React Native
- **Architecture:** REST + WebSocket
- **Ordering:** Box-based

This PRD is derived from the plan you shared.

---

# PRD.md

B2B E-Commerce Platform
Box-Based Ordering System

React Native • NestJS • MongoDB • AWS

Version 1.0
March 2026

---

# 1. Product Overview

The platform is a **B2B mobile commerce application** where businesses order products in **box quantities only**.

The system includes:

- Product catalog
- Category management
- Cart and order management
- Offer & discount engine
- Invoice & billing system
- Real-time chat between admin and customers
- Analytics dashboard
- Push notifications

---

# 2. Technology Stack

## Backend

- NestJS
- MongoDB (Mongoose)
- Redis (cache & queues)
- Socket.IO (chat)
- JWT authentication

## Frontend

- React Native
- Redux Toolkit
- RTK Query
- React Navigation
- Socket.IO client

## Cloud

- AWS EC2
- AWS S3
- AWS SES
- AWS SNS
- Redis (ElastiCache)

---

# 3. Backend Folder Structure (Your Preferred Structure)

Each module contains only **3 main files**.

```
src
│
├── user
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.dto.ts
│
├── category
│   ├── category.controller.ts
│   ├── category.service.ts
│   └── category.dto.ts
│
├── product
│   ├── product.controller.ts
│   ├── product.service.ts
│   └── product.dto.ts
│
├── cart
│   ├── cart.controller.ts
│   ├── cart.service.ts
│   └── cart.dto.ts
│
├── order
│   ├── order.controller.ts
│   ├── order.service.ts
│   └── order.dto.ts
│
├── bill
│   ├── bill.controller.ts
│   ├── bill.service.ts
│   └── bill.dto.ts
│
├── offer
│   ├── offer.controller.ts
│   ├── offer.service.ts
│   └── offer.dto.ts
│
├── chat
│   ├── chat.controller.ts
│   ├── chat.service.ts
│   └── chat.dto.ts
│
├── app.module.ts
└── main.ts
```

---

# 4. User Roles

## Admin

Admin can:

- create/edit products
- manage categories
- manage offers
- view all orders
- generate invoices
- manage payments
- chat with customers
- view analytics
- manage users

---

## Customer (Buyer)

Customer can:

- browse products
- add items to cart
- place orders
- view invoices
- chat with admin
- see discounts

---

# 5. User Schema (MongoDB)

```
User

_id
name
email
phone
password
role
isActive
address
createdAt
updatedAt
```

### Role

```
admin
user
```

---

# 6. Category System

Categories support **nested hierarchy**.

Example:

```
Beverages
   ├ Coffee
   ├ Tea
   └ Soft Drinks
```

### Category Schema

```
_id
name
description
image
parentId
isActive
sortOrder
createdAt
```

---

# 7. Product Management

Products are sold **only in boxes**.

### Product Schema

```
_id
name
description
categoryId
unit
piecesPerBox
sellingPriceBox
purchasePriceBox
purchasePricePiece
images
stockBoxes
isActive
createdAt
updatedAt
```

### Derived Values

```
sellingPricePiece = sellingPriceBox / piecesPerBox

marginPerBox = sellingPriceBox − purchasePriceBox

stockPieces = stockBoxes × piecesPerBox
```

---

# 8. Cart System

Cart is stored server-side.

### Cart Schema

```
_id
userId
items
totalAmount
totalDiscount
finalAmount
updatedAt
```

### Cart Item

```
productId
quantityBoxes
pricePerBox
appliedOfferId
totalPrice
```

### Rules

- quantities only in **boxes**
- best offer applied automatically
- price snapshot stored

---

# 9. Order Management

### Order Schema

```
_id
userId
items
status
totalAmount
totalDiscount
finalAmount
deliveryAddress
notes
appliedOffers
createdAt
updatedAt
```

### Order Status

```
pending
confirmed
processing
shipped
delivered
cancelled
```

---

# 10. Billing System

Each order generates **1 invoice**.

### Bill Schema

```
_id
orderId
userId
billNumber
itemsSnapshot
subtotal
discountAmount
taxAmount
finalAmount
paymentMethod
paymentStatus
amountPaid
amountDue
dueDate
paymentReference
pdfUrl
createdAt
```

---

### Payment Methods

```
cash
upi
bank_transfer
cheque
credit
cod
```

---

### Payment Status

```
pending
partial
paid
overdue
refunded
```

---

# 11. Offer Engine

Offer system supports **multiple types**.

### Offer Schema

```
_id
offerName
offerType
discountType
discountValue
minOrderValue
minOrderBoxes
applicableProductIds
applicableCategoryIds
buyQuantity
freeQuantity
freeProductId
targetBoxes
rewardAmount
startDate
endDate
usageLimit
usageCount
isActive
```

---

## Offer Types

### Order Offer

Example:

```
₹1000 off on orders above ₹50000
```

---

### Product Offer

Example:

```
10% off on Product X
```

---

### Category Offer

Example:

```
8% off on Beverages
```

---

### Target Offer

Example:

```
Buy 500 boxes → get ₹5000 reward
```

---

### BXGY

Example:

```
Buy 10 boxes → Get 1 free
```

---

# 12. Chat System

Real-time messaging between **admin and customers**.

### Conversation Schema

```
_id
userId
adminId
status
createdAt
updatedAt
```

### Message Schema

```
_id
conversationId
senderId
senderRole
messageType
content
isRead
readAt
createdAt
```

### Message Types

```
text
image
file
order_link
```

---

# 13. Notifications

Push notifications sent for:

```
new order
order status update
invoice generated
new chat message
offer alerts
low stock alert
```

---

# 14. Analytics Dashboard (Admin)

Admin dashboard shows:

```
daily revenue
monthly revenue
orders today
top selling products
low stock products
outstanding payments
```

---

# 15. API Endpoints

### Authentication

```
POST /auth/login
POST /auth/register
POST /auth/refresh
```

---

### Users

```
GET /users
GET /users/:id
PATCH /users/:id
DELETE /users/:id
```

---

### Categories

```
POST /categories
GET /categories
PATCH /categories/:id
DELETE /categories/:id
```

---

### Products

```
POST /products
GET /products
GET /products/:id
PATCH /products/:id
DELETE /products/:id
```

---

### Cart

```
POST /cart/add
PUT /cart/update
GET /cart
DELETE /cart/item/:id
```

---

### Orders

```
POST /orders
GET /orders
GET /orders/:id
PUT /orders/:id/status
```

---

### Bills

```
GET /bills/:id
PUT /bills/:id/payment
```

---

### Offers

```
POST /offers
GET /offers
PATCH /offers/:id
DELETE /offers/:id
```

---

### Chat

```
POST /chat/message
GET /chat/:conversationId
```

WebSocket:

```
WS /chat
```

---

# 16. Redis Usage

Redis used for:

```
product caching
offer caching
session storage
cart caching
job queues
```

---

# 17. Background Jobs

Using **BullMQ**

Queues:

```
invoice generation
overdue bill detection
abandoned cart reminder
offer expiry cleanup
```

---

# 18. AWS Architecture

Infrastructure:

```
EC2 → NestJS backend
MongoDB Atlas → database
S3 → images & invoices
Redis → cache
SES → email invoices
SNS → push notifications
CloudFront → CDN
```

---

# 19. Security

Security measures:

```
JWT authentication
bcrypt password hashing
role-based guards
rate limiting
request validation
HTTPS enforced
```

---

# 20. Performance Requirements

```
API response < 400ms
chat latency < 200ms
mobile app launch < 3 seconds
```

---

# 21. Development Order (Important)

Build modules in this order:

```
1 Auth
2 Users
3 Categories
4 Products
5 Cart
6 Orders
7 Bills
8 Offers
9 Chat
10 Notifications
11 Analytics
```

---

If you want, I can also generate **a full NestJS + MongoDB starter backend with your exact structure**:

```
user.controller.ts
user.service.ts
user.dto.ts
```

including:

- JWT auth
- MongoDB schemas
- product module
- cart system
- order system
- offer engine
- chat gateway

So you can **run the backend in ~10 minutes**.
