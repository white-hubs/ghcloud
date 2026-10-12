export interface GenreList {
  id: string;
  name: string;
}
export interface SearchType {
  name?: string;
  period: [];
  pageNumber: number;
  pageSize: number;
  meterId?: string;
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
