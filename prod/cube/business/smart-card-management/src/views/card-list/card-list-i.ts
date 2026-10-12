export interface GenreList {
  id: string;
  name: string;
}
export interface SearchType {
  useStatus?: string;
  keyword?: string;
  pageNumber: number;
  pageSize: number;
}
export interface TableData {
  name: string;
  id: string;
  code: string;
  areaName: string;
}
export interface ModalTableData {
  name: string;
  code: string;
  id: string;
  level: number;
  parentId: string | null;
}
