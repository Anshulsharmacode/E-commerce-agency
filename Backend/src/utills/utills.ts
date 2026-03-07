import * as bcrypt from 'bcrypt';
import {
  PAGINATION_MIN_LIMIT,
  PAGINATION_LIMITS,
  PaginationResult,
} from 'src/common/constant/constant';

export async function hashedPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hash: string = await bcrypt.hash(password, salt);
  return hash;
}

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  const isMatch: boolean = await bcrypt.compare(password, hash);
  return isMatch;
};

export type PaginationLimitKey = keyof typeof PAGINATION_LIMITS;

export function getMaxLimit(
  entityType: 'PRODUCT' | 'OFFER' | 'CATEGORY' | 'ORDER' | 'USER' | 'CART',
): number {
  const maxLimitKey = `${entityType}_MAX_LIMIT` as PaginationLimitKey;
  return PAGINATION_LIMITS[maxLimitKey] as number;
}


export function getDefaultLimit(
  entityType: 'PRODUCT' | 'OFFER' | 'CATEGORY' | 'ORDER' | 'USER' | 'CART',
): number {
  const defaultLimitKey = `${entityType}_DEFAULT_LIMIT` as PaginationLimitKey;
  return PAGINATION_LIMITS[defaultLimitKey] as number;
}

export function parsePagination(
  limit: unknown,
  page: unknown,
  entityType: 'PRODUCT' | 'OFFER' | 'CATEGORY' | 'ORDER' | 'USER' | 'CART',
): PaginationResult {
  const maxLimit = getMaxLimit(entityType);
  const defaultLimit = getDefaultLimit(entityType);

  const parsedLimit = Number(limit);
  const parsedPage = Number(page);

  // Validate and clamp limit
  const safeLimit =
    Number.isNaN(parsedLimit) || parsedLimit < PAGINATION_MIN_LIMIT
      ? defaultLimit
      : Math.min(Math.max(parsedLimit, PAGINATION_MIN_LIMIT), maxLimit);

  // Validate page (minimum 1)
  const safePage =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : Math.floor(parsedPage);


  const skip = (safePage - 1) * safeLimit;

  return {
    limit: safeLimit,
    skip,
  };
}

export function calculatePaginationMeta(
  total: number,
  limit: number,
  page: number,
) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    limit,
    page,
    totalPages,
    hasMore: page < totalPages,
  };
}
