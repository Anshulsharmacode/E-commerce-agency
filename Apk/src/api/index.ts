
export * from './types';


export { default as api } from './config';


export {

  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type CreateProductData,
  type UpdateProductData,
  type ProductUnit,
} from './product.api';

export {

  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CreateCategoryData,
  type UpdateCategoryData,
} from './category.api';

export {

  getAllOffers,
  getActiveOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  type Offer,
  type CreateOfferData,
  type UpdateOfferData,
  type OfferType,
  type OfferDiscountType,
} from './offer.api';

export {

  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  type Order,
  type OrderItem,
  type OrderStatus,
  type CreateOrderData,
  type UpdateOrderStatusData,
  type CancelOrderData,
} from './order.api';

export {

  getMyCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  type Cart,
  type CartItem,
  type AddCartItemData,
  type UpdateCartItemData,
} from './cart.api';

export {
  // User API
  signup,
  verifyOtp,
  resendOtp,
  login,
  createStaff,
  getProfile,
  checkAdminAccess,
  type User,
  type UserRole,
  type SignupData,
  type LoginData,
  type GenerateOtpData,
  type VerifyOtpData,
  type LoginResponse,
} from './user.api';
