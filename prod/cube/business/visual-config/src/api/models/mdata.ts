export interface GetSceneMenu {
  id: string;
  name: string;
  sort: number;
  code: string;
  parentId: string | null;
  level: number;
  fileVO: ReturnFileType;
  children: GetSceneMenu[];
  remark: string | null;
  sequence?: string | null;
  perspective?: string;
  hideActors?: string;
}
export interface RecordItf {
  modelTypeName: string;
  address: string;
  name: string;
  id: string;
  file: {
    name: string;
    path: string;
    id: string;
  };
  modelRoute: {
    name: string;
    code: string;
  }[];
}
export interface RecordType {
  modelTypeName: string;
  address: string;
  name: string;
  id: string;
  file: {
    name: string;
    path: string;
    id: string;
  };
  modelRoute: {
    name: string;
    code: string;
  }[];
}
export interface RouteList {
  id: string;
  name: string ;
  code: string ;
  level: number;
  parentId: string;
  sequence: string;
  url: string ;
  directory: string ;
}
export interface ModelList {
  total: number;
  records: RecordItf[];
}
export interface ReturnAreaScenePanelConfig {
  businessId: string;
  businessType: string;
  id: string;
  panelConfig: string;
  panelPosition: PanelPosition;
  universalPanelVo: {
    businessId: string;
    id: string;
    tableOne: string;
    tableOneName: string;
    tableThree: string;
    tableThreeName: string;
    tableTwo: string;
    tableTwoName: string;
    items: string;
  };
}
export interface ModelType {
  pages: number;
  records: {
    id: string;
    modelUrl: string;
    name: string;
    type: string; }[];
  total: number;
}

export interface GlobalPerspectiveType {
  pages: number;
  records: {
    id: string;
    name: string;
    remark: string;
  }[];
  total: number;
}

export interface BuildPerspectiveType {
  pages: number;
  records: {
    area: string | undefined;
    areaId: string[] | undefined;
    remark: string | undefined;
    id: string | undefined;
  }[];
  total: number;
}
export interface RoamingType {
  pages: number;
  records: {
    id?: string | undefined;
    name?: string | undefined;
    remark?: string | undefined;
    routeDetailsVos?: [] | undefined;
  }[];
  total: number;
}
export interface StallPageRecord {
  id: string;
  code: string;
  name: string;
  type: string;
  typeName: string;
  area: { name: string; }[];
  areaNames: string;
  location: string;
  builtUpArea: string;
  practicalArea: string;
  deptId: string;
  deptIds: string[];
  deptNames: string[];
  leaseType: boolean;
  remark: string;
  enabled: boolean;
  bimBind: boolean;
  masterName: string;
  masterPhone: string;
  updateTime: number;
  visualizationCode: string;
}

export interface StallPage {
  total: number;
  pages: number;
  records: StallPageRecord[];
}

export interface Area {
  id: string;
  level: number;
  name: string;
  code: string;
  sequence: string;
  enabled: boolean;
  areaManagerId: string;
}

export interface PropertyRecord {
  id: string;
  serialNumber: string;
  name: string;
  typeId: string;
  typeName: string;
  norms: string;
  unit: string;
  priceTotal: number;
  sourceName: string;
  sourceId: string;
  purchaseDate: number;
  startTime: number;
  maintenanceDate: number;
  maintenanceTime: number;
  usageDate: number;
  usageTime: number;
  status: string;
  statusName: string;
  adminId: string;
  adminName: string;
  areaId: string;
  area: Area[];
  receiveDepName: string;
  receiveUserId: string;
  receiveUserName: string;
  createBy: string;
  createByName: string;
  createTime: number;
  imgsStr: string;
  fileStr: string;
  storageLocation: string;
  areaName: string;
  financeNumber: string;
  maintenanceDepName: string;
  deviceNumber: string;
}

export interface GetPropertyDetailedPage {
  total: number;
  pages: number;
  records: PropertyRecord[];
}
