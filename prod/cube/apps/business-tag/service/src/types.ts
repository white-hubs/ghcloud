/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export interface BusinessTagModel {
  id: string;
  name: string;
  description: string;
  updateTime: string;
  parentId: string;
  level: number;
  childList: BusinessTagModel[];
}


export interface AreaModel {
  id: string;
  name: string;
  code: string;
  parentId: string;
  children: AreaModel[];
  tagIds: string[];
  tagNames: string;
}

export interface StallModel {
  id: string;
  code: string;
  name: string;
  type: string;
  typeName: string;
  area: string;
  areaName: string;
  location: string;
  tagIds: string[];
  tagNames: string;
}

export interface DeviceModel {
  id: string;
  code: string;
  name: string;
  status: {
    onlineState: boolean;
    communicationTime: string;
  }
  department: {
    id: string;
    name: string;
  }
  area: {
    id: string;
    name: string;
    pathName: string;
    pathId: string;
  };
  picture: string;
  productInfo: {
    id: string;
    name: string;
    picture: string;
    icon: string;
    modelName: string;
    brandName: string;
    productCategory: {
      code: string;
      name: string;
      pathCode: string;
    }
  };
  tagIds: string[];
  tagNames: string;
}

export interface SitePointModel {
  id: string;
  name: string;
  codeNum: string;
  typeName: string;
  typeId: string;
  depName: string;
  depId: string;
  areaId: string;
  areaName: string;
  detailAddress: string;
  tagIds: string[];
  tagNames: string;
}

export interface PropertyModel {
  id: string;
  name: string;
  serialNumber: string;
  typeName: string;
  typeId: string;
  norms: string;
  unit: string;
  receiveDepId: string;
  receiveDepName: string;
  receiveUserId: string;
  receiveUserName: string;
  area: AreaModel;
  tagIds: string[];
  tagNames: string;
}

export interface RiskSourceModel {
  id: string;
  name: string;
  serialNumber: string;
  typeCode: string;
  typeName: string;
  areaId: string;
  areaName: string;
  maintenanceDepId: string;
  maintenanceDepName: string;
  tagIds: string[];
  tagNames: string;
}

export interface SmallEngineeringModel {
  id: string;
  projectNum: string;
  projectName: string;
  depName: string;
  projectType: string;
  projectTypeName: string;
  address: string;
  tagIds: string[];
  tagNames: string;
}

export interface PatrolPointModel {
  id: string;
  name: string;
  codeNum: string;
  typeName: string;
  typeId: string;
  depName: string;
  depId: string;
  areaId: string;
  areaName: string;
  detailAddress: string;
  tagIds: string[];
  tagNames: string;
}





