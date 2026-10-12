/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export interface ClientEntity {
  id: string;
  name: string;
  code: string;
  remark: string;
  enabled: boolean;
}

export interface QrCodeTypeEntity {
  id: string;
  code: string;
  name: string;
  remark?: string;
  grantClientId: string; //授权项目id
  grantClientName: string; //授权项目名称
  updateTime?: string;
}

export interface CloudQrRouteEntity {
  targetUrl?: string; //实际跳转的目标URL
  targetParams?: string; //跳转参数（JSON格式）
}

export interface QrCodeEntity {
  id: string;
  code: string;
  name: string;
  qrTypeId: string; // 二维码类型ID
  qrContentType: string; // 内容类型
  qrContent: string; // 二维码内容
  mode?: string; //行为
  modeContent?: string; //行为内容
  grantClientId: string; // 授权项目id
  grantClientName: string; // 授权项目名称
  route?: CloudQrRouteEntity; // 路由信息
  enabled: boolean; // 是否启用
  updateTime?: string; // 更新时间
}

/**
 * 二维码内容类型选项常量
 */
export interface QrCodeContentTypeOption {
  label: string;
  value: string;
}

export const QrCodeContentTypeOptions: QrCodeContentTypeOption[] = [
  { label: "链接", value: "LINK" },
  { label: "文本", value: "TEXT" },
];

/**
 * 根据值获取标签
 * @param value 二维码内容类型值
 * @returns 对应的标签，如果未找到返回 '--'
 */
export const getQrCodeContentTypeLabel = (value: string): string =>
  QrCodeContentTypeOptions.find((option) => option.value === value)?.label || "--";

/**
 * 二维码行为类型选项常量
 */
export interface QrCodeModeOption {
  label: string;
  value: string;
}

export const QrCodeModeOptions: QrCodeModeOption[] = [
  { label: "跳转", value: "ROUTE" },
  { label: "纯文本", value: "TEXT" },
];

/**
 * 根据值获取标签
 * @param value 二维码行为类型值
 * @returns 对应的标签，如果未找到返回 '--'
 */
export const getQrCodeModeLabel = (value: string): string => QrCodeModeOptions.find((option) => option.value === value)?.label || "--";

/** 二维码路由配置 */
export interface ModifyQrRouteCommand {
  targetUrl?: string; // 目标URL
  targetParams?: string; // 跳转参数（JSON格式）
  [key: string]: unknown;
}

/** 新增二维码请求参数 */
export interface CreateQrCodeCommand {
  name: string;
  qrTypeId: string;
  qrContentType: string;
  qrContent: string;
  grantClientId: string;
  mode?: string; //行为
  modeContent?: string; //行为内容
  enabled: boolean;
  route?: ModifyQrRouteCommand;
  [key: string]: unknown;
}

/** 编辑二维码请求参数 */
export interface UpdateQrCodeCommand {
  id: string;
  name: string;
  qrContentType: string;
  qrContent: string;
  mode?: string; //行为
  modeContent?: string; //行为内容
  enabled: boolean;
  route?: ModifyQrRouteCommand;
  [key: string]: unknown;
}
