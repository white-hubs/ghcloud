/** 通用分页 */
export interface PropertyType{
  name: string;
  totalRatio: number;
  ringRatio:number;
  value:number;
  id:string
}
export interface SuppliesType{
  id: string;
  name: string;
  code: string;
  categoryId: string;
  categoryName:string;
  brand:string;
  model:string;
  goodsCode:string;
  unit: string;
  qualityPeriod:string;
  stockMax:  number;
  stockMin:  number;
  useLimit: string;
  stock:  number;
  amount:  number;
  fileIds:string;
  file: {
          id: string;
          name: string;
          suffix: string;
          path: string;
          size:  number;
          refCount:  number;
          type: string;
          businessKey: string;
          endpointPath: string;
          createTime:  number;
      }[];
  num: number;
  price: number;
  avgPrice: number;
  status: string;
}
export interface CheckAsset{
  [x:string]:string|number|any[]|{};
  id: string;
  checkId:string;
  status: string;
  name:string;
  taskName: string;
  checkTotalNumber:number;
  checkWaitNumber: number;
  checkCompleteNumber: number;
  checkWinNumber: number;
  checkLossNumber: number;
  estimateEndTime: string;
  realityEndTime: number;
  dutyUserName: string;
  dutyUserId: string;
  propertyDetailed: [],
  purchaseDate:string;
  checkUserId: string;
  checkUserName:string;
  checkDepName:string;
  abnormalNumber:number;
  storageLocation:string;
  area:string[];
  receiveDepId:string;
  receiveDepName:string;
  receiveUserId:string;
  receiveUserName:string;
  endTime:string;
  startTime:string;
  remark:string;
  avgPrice: number;
  stat:{
    addNum:number;
    checkWaitNumber:number;
    checkedNum:number;
    consumableNum:number;
    reduceNum:number;
  };
  file:{path:string}[]
}
export interface AssetType{
  id: string;
  depositoryNumbers:string;
  serialNumber?: string;
  name:string;
  typeId?: string;
  typeName?: string;
  norms?:string;
  unit?: string;
  price?: null,
  priceTotal?: number;
  sourceName?: string;
  sourceId?: string;
  purchaseDate?: number;
  startTime?: number;
  receiveUserPhone?: number;
  supplier?: string;
  supplierUser?: string;
  supplierPhone?: string;
  maintenanceDate?: number;
  maintenanceTime?: number;
  usageDate?: number;
  usageTime?: number;
  status?: string;
  statusName?: string;
  adminId?: string;
  adminName?:string;
  areaId?:string;
  chooseType:string;
  area?: {name:string;id:string}[],
  remarks?: string;
  typeCode?: string;
  receiveDepId?: string;
  receiveDepName?:string;
  receiveUserId?:string;
  receiveUserName?:string;
  createBy?: string;
  createByName?: string;
  createTime?: number;
  imgs?: {path:string}[],
  file?: {
    id: string;
    name: string;
    suffix: string;
    path: string;
    size:  number;
    refCount:  number;
    type: string;
    businessKey: string;
    endpointPath: string;
    createTime:  number;  
  }[];
  imgsStr?: string;
  fileStr?:string;
  number?:number;
  storageLocation?: string;
  areaName?: string;
  financeNumber?:string;
  maintenanceDepId?: string;
  maintenanceDepName?:string;
  deviceNumber?: number;
  latAndLon?:string;
  location?: string;
}
export interface AssetClassifyType{
  id: string;
  name: string;
  remarks: string;
  type: string;
}
export interface PropertyDetailed{
  pageNumber:number;
  pageSize:number;
  keyword:string;
  status: string;
  areaId:string;
  typeId:string;
  typeName:string;
  sourceId:string;
  sourceName:string;
  receiveDepId:string;
  receiveDepName:string;
  warehousingStartDate?:string;
  purchaseStartDate:string;
  purchaseEndDate:string;
  warehousingEndDate?:string;
  usageDate:string;
}
export interface HistoryRecordType{
  propertyId: string;
  handleTime: number;
  handleTypeName:string;
  createByName: string;
  createBy: string;
  remarks: string;
  name: string;
  imgs:string;
  img: [],
  serialNumber:number;
  typeName: string;
  status: string;
  price: number;
  receiveUserName: string;
  receiveDepName: string;
  purchaseDate: string;
}
export interface AssetDetailType{
  file:{
    id: string;
    name: string;
    suffix:string;
    path: string;
    size:  number;
    refCount: number;
    type: string;
    businessKey: string;
    endpointPath: string;
    createTime:  number;
}[]
}
export interface QrcodeEntityVO {
  /**
   * 编号
   */
  code?: null | string;
  /**
   * 实体ID
   */
  entityId?: null | string;
  targetId?: null | string;
  /**
   * 实体名称
   */
  entityName?: null | string;
  /**
   * 实体类型
   */
  entityType?: null | string;
  id?: number | null;
  /**
   * 名称
   */
  name?: null | string;
}