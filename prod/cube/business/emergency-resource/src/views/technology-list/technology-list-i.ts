export interface GenreList {
  id: string;
  name: string;
}
export interface SearchType {
  name: string;
  remark: string;
  pageNumber: number;
  pageSize: number;
}
export interface TableData {
  id: string ;
  name?: string ;
  remark?: string ;
  filePath?: string ;
  fileIds?: string ;
}
export interface ModalTableData {
  name: string;
  code: string;
  id: string;
  level: number;
  parentId: string | null;
}
