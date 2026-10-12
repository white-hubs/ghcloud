
/**
 * 文件提供类型
 */
export enum OcrFileProvideType {
  BASE64 = "BASE64",
  FILE = "FILE",
  URL = "URL",
}

/**
* 车牌识别厂家
*/
export enum VehicleOcrManufacture {
  ALI = "ALI",
}
export interface OcrVehicleRes {
  /**
   * 额外信息
   */
  extra?: { [key: string]: any };
  /**
   * 车牌号
   */
  vehicleNumber?: string;
  /**
   * 车辆类型
   */
  vehicleType?: string;
}
