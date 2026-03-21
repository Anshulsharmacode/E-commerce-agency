import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
  MAX_PAGINATION_LIMIT,
} from 'src/common/constant/constant';

export type PaginationInput = {
  page?: number;
  limit?: number;
};

export type PaginationNormalization = {
  page: number;
  limit: number;
  skip: number;
};

const toSafeNumber = (value: number | undefined, fallback: number) => {
  if (value === undefined || Number.isNaN(value)) {
    return fallback;
  }
  return value;
};

export const normalizePagination = ({
  page,
  limit,
}: PaginationInput): PaginationNormalization => {
  const parsedLimit = toSafeNumber(limit, DEFAULT_PAGINATION_LIMIT);
  const safeLimit = Math.min(Math.max(parsedLimit, 1), MAX_PAGINATION_LIMIT);

  const parsedPage = toSafeNumber(page, DEFAULT_PAGINATION_PAGE);
  const safePage = Math.max(parsedPage, DEFAULT_PAGINATION_PAGE);

  const skip = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    skip,
  };
};

export const buildPaginationMeta = (
  total: number,
  { page, limit }: Pick<PaginationNormalization, 'page' | 'limit'>,
) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
