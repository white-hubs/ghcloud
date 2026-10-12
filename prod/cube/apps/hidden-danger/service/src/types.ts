/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}
export type BusinessType = 'STALL_TYPE' | 'STALL' | 'DEVICE_PROD_CATEGORY_CODE' | 'DEVICE'

export interface ProductCategoryTree {
  associatedItem: unknown;
  dictId: string;
  id: string;
  itemLabel: string;
  itemLevel: string;
  itemParentId: number;
  itemSort: number;
  itemValue: string;
  logicId: string;
  remark: string;
  status: number;
  name?: string;
  children: ProductCategoryTree[];
}
export interface ProductCategory {
  name: string;
  code: string;
}
export interface NorthDeviceProp {
  key?: string;
  ts?: number;
  val?: string;
}

export interface ProductModel {
  id: string;
  name: string;
  picture?: null | string;
  icon?: null | string;
  modelName: string;
  brandName: string;
  productCategory: ProductCategory;
}

export interface ProductIotCategoryTree {
  categoryName: string;
  categoryCode: string;
  children?: [];
}

export interface DeviceInstancePageParams {
  pageSize: number;
  pageNumber: number;
  departmentId?: string | undefined;
  keyword?: string | undefined;
  lastAreaId?: string | undefined;
  prodCategoryId?: string | undefined;
  bizType?: string | undefined;
}
export interface DeviceInstancePageParamsAll {
  pageSize: number;
  pageNumber: number;
  departmentId?: string | undefined;
  keyword?: string | undefined;
  lastAreaId?: string | undefined;
  categoryCode: string;
  filterIds?: string[];
  filterTagCodes?: string[];
  productId: string;
}
export interface ProductState {
  id: string | undefined;
  prodName: string | undefined;
}
export interface DeviceSceneConfig {
  businessId: string;
  businessType: string;
  id: string;
  sceneType: string;
  sceneTypeSequence?: string;
}
/** 通用字典 */
export interface UniversalDictionary {
  id: string;
  dictId: string;
  itemLabel: string;
  itemLevel: string;
  itemValue: string;
}

/**
 * 产品
 */
export interface Product {
  accessTypeId: number;
  /**
   * 回显时提供
   */
  accessTypeName?: string;
  /**
   * 回显时提供
   */
  createTimeFormat?: string;
  extendConfig?: string;
  id: number;
  /**
   * 是否自定义
   */
  isCustom?: number;
  /**
   * 1直连设备 2网关设备 3网关子设备
   */
  nodeType: number;
  /**
   * 回显时提供
   */
  nodeTypeName?: string;
  prodBrandId: string;
  /**
   * 回显时提供
   */
  prodBrandName?: string;
  prodCategoryId: number;
  /**
   * 回显时提供
   */
  prodCategoryName?: string;
  /**
   * 回显时提供
   */
  prodCategoryNameWithCascade?: string;
  /**
   * 产品图标
   */
  prodIcon?: number | null;
  prodIconFile?: { id: string;path: string; };
  /**
   * 产品型号
   */
  prodModel: string;
  prodName: string;
  /**
   * 产品图片
   */
  prodPic?: number;
  prodPicFile?: { id: string;path: string; };
  protocolId: number;
  /**
   * 回显时提供
   */
  protocolName?: string;
  remark: string;
  /**
   * 1启用 0禁用
   */
  status: number;
  /**
   * 回显时提供
   */
  statusName?: string;
  /**
   * 回显时提供
   */
  updateTimeFormat?: string;
  deviceCount: number;
}

/** 设备标签占比 */
export interface DeviceTagPercentage {
  percentage: number;
  tagCode: string;
  tagDeviceNumber: number;
  tagName: string;
}

/** 设备状态数量统计 */
export interface DeviceTagStatusCount {
  alarmNumber: number;
  normalNumber: number;
  offlineNumber: number;
  totalNumber: number;
  troubleNumber: number;
}

export interface DeviceInstancePage {
  /**
   * 区域
   */
  area?: {
    id: string;
    /**
     * 单个区域名称
     */
    name: string;
    /**
     * 全路径id
     */
    pathId: string;
    /**
     * 全路径区域名称
     */
    pathName: string;
  };
  /**
   * 设备编码
   */
  code?: string;
  /**
   * 部门
   */
  department?: { id: string;name: string; };
  /**
   * 设备id
   */
  id?: string;
  /**
   * 经纬度
   */
  lntAndLat: string;
  /**
   * 设备名称
   */
  name?: string;
  /**
   * 图片id
   */
  picture?: number;
  /**
   * 产品信息
   */
  productInfo?: {
    /**
     * 品牌名称
     */
    brandName: string;
    /**
     * 产品图标
     */
    icon: string;
    /**
     * 产品id
     */
    id: string;
    /**
     * 型号名称
     */
    modelName: string;
    /**
     * 产品名称
     */
    name: string;
    /**
     * 产品图片
     */
    picture: null;
    /**
     * 品类信息
     */
    productCategory: {
      code: string;
      name: string;
      /**
     * 全路径code
     */
      pathCode: string;
    };
  };
  status?: {
    /**
     * 最后通信时间
     */
    communicationTime: string;
    /**
     * true：在线 false：离线
     */
    onlineState: boolean;
  };
  /**
   * 第三方id
   */
  thirdPartyId: string;
}
