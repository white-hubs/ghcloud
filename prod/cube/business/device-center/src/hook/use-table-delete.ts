interface UseTableDelete {
  getCurrentPage: (pagination: Pagination, delRows: unknown[], records: unknown[]) => Pagination;
}
interface Pagination {
  pageNumber: number;
  pageSize: number;
  total?: number;
}

export const useTableDelete = (): UseTableDelete => {
  const getCurrentPage = (pagination: Pagination, delRows: unknown[], records: unknown[]): Pagination => {
    if (pagination.pageNumber > 1 && delRows.length >= records.length) pagination.pageNumber -= 1
    return pagination
  }

  return {
    getCurrentPage
  }
}
