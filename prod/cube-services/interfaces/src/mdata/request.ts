/** 场景菜单文件信息 */
export interface SceneTypeFileVO {
  id: string;
  name: string;
  path: string;
  type?: string;
  size?: number;
}

/** 业务菜单（场景类型）树节点 */
export interface SceneTypeMenu {
  id: string;
  name: string;
  sort: number;
  code: string;
  parentId: string | null;
  level: number;
  scenarioType?: string;
  fileVO?: SceneTypeFileVO | null;
  children?: SceneTypeMenu[];
  remark?: string | null;
  sequence?: string | null;
}

export interface ListSceneTypeMenusParams {
  projectId: string;
}

export interface CreateSceneTypeMenuParams {
  projectId: string;
  name: string;
  parentId: string | null;
  fileId?: string;
  sort: number;
  scenarioType: string;
}

export interface UpdateSceneTypeMenuParams extends CreateSceneTypeMenuParams {
  id: string;
}

export type PanelPosition = "LEFT_PANEL" | "RIGHT_PANEL" | "CACHE";

export interface AreaScenePanelUniversalVo {
  id?: string;
  businessId?: string;
  tableOne?: string;
  tableOneName?: string;
  tableTwo?: string;
  tableTwoName?: string;
  tableThree?: string;
  tableThreeName?: string;
  items?: string | null;
}

export interface AreaScenePanelConfig {
  id?: string;
  businessId?: string;
  businessType?: string;
  panelConfig: string;
  panelPosition: PanelPosition;
  universalPanelVo?: AreaScenePanelUniversalVo;
}

export interface GetAreaScenePanelConfigParams {
  areaId: string;
  sceneType: string;
}

export interface AreaScenePanelModifyParam {
  panelConfig: string;
  panelPosition: "LEFT_PANEL" | "RIGHT_PANEL";
  universalPanelParam?: {
    tableOne?: string;
    tableOneName?: string;
    tableTwo?: string;
    tableTwoName?: string;
    tableThree?: string;
    tableThreeName?: string;
    items?: string | null;
  };
}

export interface SaveAreaScenePanelConfigParams {
  areaId: string;
  sceneType: string;
  panelConfigModifyParams: AreaScenePanelModifyParam[];
}

/** 业务区域树节点（隐藏楼栋等 Cascader） */
export interface BusinessAreaNode {
  id: string;
  name: string;
  aliasName: string;
  parentId?: string | null;
  level?: number;
  children?: BusinessAreaNode[];
}

/** 档位类型 */
export interface StallCategory {
  id: string;
  name: string;
  code?: string;
}

/** 档位记录 */
export interface StallRecord {
  id: string;
  code: string;
  name: string;
  type?: string;
  typeName?: string;
  areaNames?: string;
  visualizationCode?: string;
}

export interface ListBoundStallsParams {
  sceneType: string;
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  categoryId?: string;
  areaId?: string;
}

export interface ListUnboundStallsParams {
  sceneType: string;
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  categoryId?: string;
}

export interface BindVisualStallsParams {
  sceneType: string;
  businessIds?: string[];
  stallBindWay: "ALL_STALL" | "APPOINT_STALL";
  categoryId?: string;
  keyword?: string;
}

export interface UnbindVisualStallsParams {
  sceneType: string;
  businessIds: string[];
  projectId?: string;
}
