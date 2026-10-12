import type { Pagination } from "@ghcloud/cube-service-interface/base";

/** 资产/风险源所在区域节点 */
export interface PropertyAreaNode {
  id: string;
  name: string;
  level?: number;
  code?: string;
}

/** 资产类型选项 */
export interface PropertyClassifyOption {
  id: string;
  name: string;
}

/** 资产记录 */
export interface PropertyRecord {
  id: string;
  serialNumber?: string;
  name: string;
  typeId?: string;
  typeName?: string;
  area?: PropertyAreaNode[];
  areaName?: string;
  deviceNumber?: string;
}

/** 风险源记录 */
export interface RiskSourceRecord {
  id: string;
  serialNumber?: string;
  name: string;
  typeName?: string;
  area?: PropertyAreaNode[];
  areaName?: string;
  bimCode?: string;
}

export interface ListPropertyClassifyParams {
  pageNumber: number;
  pageSize: number;
  type: "assetType";
}

export interface ListBoundPropertiesParams {
  sceneType: string;
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  areaId?: string;
  typeId?: string;
}

export interface ListUnboundPropertiesParams {
  sceneType: string;
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  typeId?: string;
}

export interface BindVisualPropertiesParams {
  sceneType: string;
  businessIds?: string[];
  typeId?: string;
  keyword?: string;
  bindWay?: "ALL";
}

export interface UnbindVisualPropertiesParams {
  ids: string[];
}

export interface ListBoundRiskSourcesParams {
  sceneType: string;
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  areaId?: string;
  typeCode?: string;
}

export interface ListUnboundRiskSourcesParams {
  sceneType: string;
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  typeCode?: string;
}

export interface BindVisualRiskSourcesParams {
  sceneType: string;
  businessIds?: string[];
  typeCode?: string;
  keyword?: string;
  bindWay?: "ALL";
}

export interface UnbindVisualRiskSourcesParams {
  ids: string[];
}

export type PropertyPageResult = Pagination<PropertyRecord>;
export type RiskSourcePageResult = Pagination<RiskSourceRecord>;
export type PropertyClassifyPageResult = Pagination<PropertyClassifyOption>;
