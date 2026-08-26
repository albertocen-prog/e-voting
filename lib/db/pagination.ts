// Database utilities and helpers

export interface PaginationParams {
  skip?: number;
  take?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
}

/**
 * Format pagination params from query parameters
 */
export const parsePaginationParams = (skip?: string, take?: string) => {
  const parsedSkip = skip ? Math.max(0, parseInt(skip, 10)) : 0;
  const parsedTake = take ? Math.max(1, Math.min(100, parseInt(take, 10))) : 10;

  return { skip: parsedSkip, take: parsedTake };
};

/**
 * Wrap a query with pagination metadata
 */
export const withPagination = async <T>(
  query: (params: PaginationParams) => Promise<T[]>,
  countQuery: () => Promise<number>,
  { skip = 0, take = 10 }: PaginationParams
): Promise<PaginationResult<T>> => {
  const data = await query({ skip, take });
  const total = await countQuery();

  return {
    data,
    total,
    skip,
    take,
    hasMore: skip + take < total,
  };
};
