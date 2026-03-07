export const PAGINATION_LIMITS = {
  // Maximum limit for products in a single request
  PRODUCT_MAX_LIMIT: 200,
  PRODUCT_DEFAULT_LIMIT: 50,

  // Maximum limit for offers in a single request
  OFFER_MAX_LIMIT: 100,
  OFFER_DEFAULT_LIMIT: 50,

  // Maximum limit for categories in a single request
  CATEGORY_MAX_LIMIT: 100,
  CATEGORY_DEFAULT_LIMIT: 50,

  // Maximum limit for orders in a single request
  ORDER_MAX_LIMIT: 100,
  ORDER_DEFAULT_LIMIT: 50,

  // Maximum limit for users in a single request
  USER_MAX_LIMIT: 100,
  USER_DEFAULT_LIMIT: 50,

  // Maximum limit for carts in a single request
  CART_MAX_LIMIT: 100,
  CART_DEFAULT_LIMIT: 50,
} as const;

// Generic min limit for all endpoints
export const PAGINATION_MIN_LIMIT = 1;

// Pagination result interface
export interface PaginationResult {
  limit: number;
  skip: number;
}

// Response with pagination metadata
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
