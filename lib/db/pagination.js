// Pagination utilities and helpers

/**
 * Format pagination params from query parameters
 */
export const parsePaginationParams = (skip, take) => {
  const parsedSkip = skip ? Math.max(0, parseInt(skip, 10)) : 0;
  const parsedTake = take ? Math.max(1, Math.min(100, parseInt(take, 10))) : 10;

  return { skip: parsedSkip, take: parsedTake };
};

/**
 * Wrap a query with pagination metadata
 */
export const withPagination = async (
  query,
  countQuery,
  { skip = 0, take = 10 } = {}
) => {
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
