export interface PageResult<T> {
  records: T[];
  pages: number;
  total: number;
}
export interface PersonCategory {
  id: string;
  code: string;
  name: string;
  remark: string;
}
