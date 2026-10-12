export interface GenreList {
  id: string;
  name: string;
}
export interface SearchType {
  meterId: string;
  pageNumber: number;
  pageSize: number;
}
export interface TableData {
  meterId: string;
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
