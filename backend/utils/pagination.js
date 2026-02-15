const MAX_PAGINATION_LIMIT = 100;

const isPositiveIntegerString = (value) => /^\d+$/.test(value);

const parsePositiveIntegerParam = (value, paramName) => {
  if (value === undefined) {
    return null;
  }

  if (Array.isArray(value) || typeof value !== 'string' || !isPositiveIntegerString(value)) {
    throw new Error(`Invalid ${paramName}. It must be a positive integer.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${paramName}. It must be a positive integer.`);
  }

  return parsed;
};

const getPaginationParams = (query, options = {}) => {
  const {
    defaultPage = 1,
    defaultLimit = 50,
    maxLimit = MAX_PAGINATION_LIMIT,
  } = options;

  const parsedPage = parsePositiveIntegerParam(query.page, 'page');
  const parsedLimit = parsePositiveIntegerParam(query.limit, 'limit');

  const page = parsedPage ?? defaultPage;
  const normalizedLimit = parsedLimit ?? defaultLimit;
  const limit = Math.min(normalizedLimit, maxLimit);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

module.exports = {
  getPaginationParams,
  MAX_PAGINATION_LIMIT,
};
