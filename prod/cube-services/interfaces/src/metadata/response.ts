
export interface Area {
  id: string;
  aliasName: string;
  code: string;
  children: Area[];
  parentId: string | null;
  name: string;
  //...其他字段
}

export interface AreaDetail {
  id: string;
  areaExtend?: {
    pictureFiles?: Array<{ path?: string | null }> | null;
    floorPlanFileId?: string | null;
    floorPlanFile?: { id?: string; path?: string | null } | null;
    coordinateAxis?: string | null;
  } | null;
}
