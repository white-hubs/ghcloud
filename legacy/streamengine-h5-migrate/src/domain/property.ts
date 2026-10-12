import { TagType } from 'vant'

/**
 * 资产明细
 *
 * PropertyDetailedParam
 */
export interface PropertyDetailedParam {
  key: string;
  /**
  * 管理员id
  */
  adminId?: string;
  /**
  * 管理员姓名
  */
  adminName?: string;
  /**
   * 区域id
   */
  areaId?: number;
  /**
   * 区域名称
   */
  areaName?: string;
  /**
   * 资产图片
   */
  file?: string;
  id?: number;
  /**
   * 维保期限（月）
   */
  maintenanceTime?: number;
  /**
   * 资产名称
   */
  name: string;
  /**
   * 规格型号
   */
  norms?: string;
  /**
   * 数量
   */
  number?: string;
  /**
   * 原值
   */
  price?: string;
  /**
   * 购入时间
   */
  purchaseDate: string;
  /**
   * 资产编码
   */
  serialNumber?: string;
    /**
   * 资产编码
   */
    financeNumber?: string;
  /**
   * 资产类别id
   */
  typeId?: number;
  /**
   * 资产类别名称
   */
  typeName: string;
  /**
   * 计量单位
   */
  unit?: string;
  /**
   * 使用期限（月）
   */
  usageTime?: number;
  /**
   * 资产状态
   */
  status: string;
  imgs: Array<{ path: string; }>;
}

export interface ConsumableStoreStock {
  storeNum: number;
  /**
   * 当前仓库均价
   */
  price: number;
  avgPrice: number;
  /**
   * 品牌
   */
  brand: string;
  /**
   * 类型ID
   */
  categoryId: number;
  /**
   * 类型名称
   */
  categoryName: string;
  /**
   * 编码
   */
  code: string;
  /**
   * 商品码
   */
  goodsCode: string;
  id: string;
  /**
   * 型号
   */
  model: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 当前仓库库存
   */
  num: number;
  /**
   * 质保期
   */
  qualityPeriod: string;
  /**
   * 当前总库存
   */
  stock: number;
  /**
   * 最大库存
   */
  stockMax: number;
  /**
   * 最小库存
   */
  stockMin: number;
  /**
   * 仓库名称
   */
  stroeName: string;
  /**
   * 单位
   */
  unit: string;
  /**
   * 每人限领（人月）
   */
  useLimit: number;
  amount: string;
  file: Array<{ path: string; }>;
}

/** 资产状态 */
export const assetStatus: Array<{ label: string; value: string;tagType: TagType; }> = [
  { label: '闲置', value: 'LEAVE_UNUSED', tagType: 'warning' },
  { label: '在用', value: 'MAKE_USE_OF', tagType: 'success' },
  { label: '报废', value: 'WEED_OUT', tagType: 'danger' }
]
