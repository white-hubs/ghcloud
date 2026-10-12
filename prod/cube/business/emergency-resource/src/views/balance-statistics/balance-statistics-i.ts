export interface GenreList {
  id: string;
  name: string;
}
export interface SearchType {
  period: [];
  pageNumber: number;
  pageSize: number;
}
export interface TableData {
  currentAmountTotal: string;
  day: string;
  inAmount: number;
  inAmountTotal: number;
  outAmount: number;
  outAmountTotal: number;
  preAmountTotal: number;
}
export interface ModalTableData {
  name: string;
  code: string;
  id: string;
  level: number;
  parentId: string | null;
}
