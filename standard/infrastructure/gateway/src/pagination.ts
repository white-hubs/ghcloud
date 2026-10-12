export interface Pagination<T> {
  // 总条数
  total: number;
  // 总页数
  pages: number;
  // 目前大多数接口未返回，但标准化需要
  currentPage: number;
  // 目前大多数接口未返回，但标准化需要
  pageSize: number;
  records: T[];
}

export type PaginationQuery<T> = T & {
  pageNumber: number;
  pageSize: number;
}
