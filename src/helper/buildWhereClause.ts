export function buildWhereClause(
  query: Record<string, any>,
  allowedFilters: string[]
): { where: string; values: any[] } {
  const whereClauses: string[] = [];
  const values: any[] = [];

  const addFilter = (key: string, value: any) => {
    if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
      whereClauses.push(`${key} BETWEEN ? AND ?`);
      values.push(value.min, value.max);
    } else {
      whereClauses.push(`${key}=?`);
      values.push(value);
    }
  };

  for (const key of allowedFilters) {
    if (query[key] !== undefined) {
      addFilter(key, query[key]);
    }
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  return {
    where: whereClause,
    values,
  };
}
