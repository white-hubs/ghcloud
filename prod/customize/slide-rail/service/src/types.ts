/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export interface ArrangeLastInfoVo {
  /**
   * 理货信息
   */
  porkArrange: PorkArrange;
  /**
   * 理货审核状态
   */
  porkArrangeAuditStatus: PorkArrangeAuditStatus;
  /**
   * 当前理货详细数据
   */
  porkArrangeDetail: PorkArrangeDetail;
  /**
   * 理货状态
   */
  porkArrangeStatus: PorkArrangeStatus;
  /**
   * 报备信息
   */
  porkReport: PorkReport;
  /**
   * 报备情况
   */
  porkReportStatAudit: PorkReportStatAudit;
  /**
   * 理货情况
   */
  porkStatArrangeAudit: PorkStatArrangeAudit;
  /**
   * 商户信息
   */
  supplierInfo: SupplierInfo;
}

/**
* 理货信息
*/
export interface PorkArrange {
  /**
   * 总片数
   */
  porkReportSlices: number;
  /**
   * 理货重量
   */
  porkReportWeight: number;
  /**
   * 理货片数
   */
  slices: number;
  /**
   * 理货重量
   */
  weight: number;
}

/**
* 理货审核状态
*/
export enum PorkArrangeAuditStatus {
  Audit = 'AUDIT',
  Failed = 'FAILED',
  Passed = 'PASSED',
}

/**
* 当前理货详细数据
*/
export interface PorkArrangeDetail {
  /**
   * 脚标编码
   */
  footMarkCode: string;
  /**
   * 商品品类
   */
  goodsCategoryId: string;
  /**
   * 商品品类名称
   */
  goodsCategoryName: string;
  /**
   * 主键
   */
  id: string;
  /**
   * 电子标签
   */
  label: string;
  /**
   * 图片文件地址
   */
  picFilePaths: string[];
  /**
   * 理货时间
   */
  porkArrangeTime: string;
  /**
   * 报备号
   */
  porkReportCode: string;
  /**
   * 批发商主键
   */
  supplierId: string;
  /**
   * 净重
   */
  weight: number;
}

/**
* 理货状态
*/
export enum PorkArrangeStatus {
  Finished = 'FINISHED',
  Paused = 'PAUSED',
  Progressed = 'PROGRESSED',
  Unknown = 'UNKNOWN',
  Waited = 'WAITED',
}

/**
* 报备信息
*/
export interface PorkReport {
  /**
   * 屠宰场编号
   */
  abattoirCode: string;
  /**
   * 屠宰场主键
   */
  abattoirId: string;
  /**
   * 屠宰场名称
   */
  abattoirName: string;
  /**
   * 到达时间
   */
  arrivedTime: string;
  code: string;
  /**
   * 检疫证号图片集合
   */
  files: Record<string, any>[];
  /**
   * 报备商品名称
   */
  goodsCategoryName: string;
  id: string;
  /**
   * 检疫证号
   */
  pratiqueCodes: string[];
  /**
   * 报备片数
   */
  reportSlices: number;
  /**
   * 报备时间
   */
  reportTime: string;
  /**
   * 报备重量
   */
  reportWeight: number;
  /**
   * 车辆号码
   */
  vehiclePlate: string;
}

/**
* 报备情况
*/
export interface PorkReportStatAudit {
  /**
   * 报备不合格数
   */
  porkReportAuditFailedNum: number;
  /**
   * 报备合格数
   */
  porkReportAuditPassedNum: number;
  /**
   * 报备数据审核总数
   */
  total: number;
}

/**
* 理货情况
*/
export interface PorkStatArrangeAudit {
  /**
   * 理货不合格数
   */
  porkArrangeAuditFailedNum: number;
  /**
   * 理货合格数
   */
  porkArrangeAuditPassedNum: number;
  /**
   * 理货数据审核总数
   */
  total: number;
}

/**
* 商户信息
*/
export interface SupplierInfo {
  /**
   * 详细地址
   */
  address: string;
  /**
   * 所属地区
   */
  area: string;
  /**
   * 商家编号
   */
  code: string;
  /**
   * 头像文件信息
   */
  fileVO: string;
  /**
   * 主键
   */
  id: string;
  /**
   * 联系人
   */
  liaison: string;
  /**
   * 商家名称
   */
  name: string;
  /**
   * 联系人手机号
   */
  phone: string;
}
export interface SpotCheckStat {
  /**
   * 抽检总次数
   */
  passQty: number;
  /**
   * 检测合格率
   */
  passRate: string;
  /**
   * 抽检总次数
   */
  totalQty: number;
}
