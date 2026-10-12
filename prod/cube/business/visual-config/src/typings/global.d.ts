/**
 * 后端返回文件接口类型
 */
declare interface ReturnFileType {
  id: string;
  name: string;
  path: string;
  type?: string;
  size?: number;
  accessPrefix?: string;
  businessKey?: string | null;
}
/**
 * 后端分页接口类型
 */
declare interface ReturnPageType<T = unknown> {
  page: number;
  total: number;
  records: T[];
}
/**
 * @说明 业务类型：档位类型、档位、设备类型、设备
 */
declare type BusinessType = 'STALL_TYPE' | 'STALL' | 'DEVICE_PROD_CATEGORY_CODE' | 'DEVICE'

/**
 * 面板位置参数
 */
declare type PanelPosition = 'LEFT_PANEL' | 'RIGHT_PANEL' | 'CENTER'

declare interface Window {
  config: {
    terminal: string;
  };
}
