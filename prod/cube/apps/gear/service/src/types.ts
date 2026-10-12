/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}
