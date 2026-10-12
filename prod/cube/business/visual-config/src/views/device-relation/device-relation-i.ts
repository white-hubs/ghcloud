export interface GenreList {
  categoryCode: string;
  categoryName: string;
  children?: [];
}
export interface SearchType {
  keyword?: string | undefined;
  productId?: string | undefined;
  categoryCode?: string[];
  pageNumber: number;
  pageSize: number;
}
export interface TableData {
  name: string;
  id: string;
  code: string;
  area: { pathName: string; };
}
export interface ModalTableData {
  name: string;
  code: string;
  id: string;
  level: number;
  parentId: string | null;
}
export interface SubmitDeviceSceneConfig {
  sceneTypes: string[];
  businessType: BusinessType;
  businessId: string;
}
