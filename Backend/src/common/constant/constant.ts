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

export const RATE_LIMITS = {
  // Default rate limit for all endpoints
  // 100 requests per 60 seconds (about 1-2 requests per second)
  DEFAULT: {
    ttl: 60, // 60 seconds window
    limit: 100, // 100 requests max
  },

  // Stricter limits for authentication endpoints (login, register)
  // These are sensitive and should have stricter limits to prevent brute force
  AUTH: {
    ttl: 60, // 60 seconds window
    limit: 5, // Only 5 attempts per minute
  },

  // Limits for write operations (create, update, delete)
  // These modify data, so we limit them more strictly
  WRITE: {
    ttl: 60, // 60 seconds window
    limit: 20, // 20 write operations per minute
  },

  // Limits for read operations (get all, get by id)
  // These are less sensitive, so we allow more requests
  READ: {
    ttl: 60, // 60 seconds window
    limit: 60, // 60 read operations per minute
  },

  // Public endpoints (no authentication required)
  // Stricter limits since anyone can access them
  PUBLIC: {
    ttl: 60, // 60 seconds window
    limit: 30, // 30 requests per minute
  },
} as const;
