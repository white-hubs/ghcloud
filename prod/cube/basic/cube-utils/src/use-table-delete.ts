/**
  使用场景：删除表格数据时，根据当前页码和删除的数据数量，更新当前页码。
**/
interface UseTableDelete {
  getCurrentPage: (pagination: Pagination, delRows: unknown[], records: unknown[]) => Pagination;
}
interface Pagination {
  pageNumber: number;
  pageSize: number;
  total: number;
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
