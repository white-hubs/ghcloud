export const taskStatus = {
  ACCEPT: "待接收",
  EXECUTING: "待巡检",
  OVER: "已巡检",
  EXPIRE: "已过期",
  STOP: "已终止",
  CONFIRM: "待拆解",
  SPLIT: "待确认",
  OVERTIME: "超时完成",
  WAIT_REPAIR: "待修复",
  REPAIRED: "已修复",
  CANCEL_REPAIR: "取消修复",
};

export interface StandardItemsVo {
  alias: string; // 巡检项别名
  content: string; // 巡检项内容
  id: string; // 巡检项ID
  imageResult: string; // 巡检项图片结果
  isRawItem: number; // 是否为原始项
  itemTag: string; // 巡检项标签
  name: string; // 巡检项名称
  referType: string; // 巡检项参考类型
  remarkResult: string; // 巡检项备注结果
  resultId: string; // 巡检项结果ID
  resultItemValue: string; // 巡检项结果值
  standardId: string; // 巡检项所属标准ID
  resultVO: Record<string, unknown> | null; // 巡检项结果
}
export interface StandardVo {
  code: string; // 巡检标准Code
  describe: string; // 巡检标准描述
  enable: boolean; // 是否启用
  id: string; // 巡检标准ID
  name: string; // 巡检标准名称
  standardItems: StandardItemsVo[]; // 巡检标准项
}
export interface DataSourceType {
  targetName: string; // 巡检对象 设备名称
  targetId: string; // 巡检对象 ID
  targetParentId: string; // 巡检对象 父级id
  targetType: string; // 巡检对象 类型
  targetTypeName: string; // 巡检对象 类型名称
  targetCode: string; // 巡检对象 编码
  targetCategory: string; // 巡检对象 分类
  location: string; // 巡检对象 位置
  locationDes: string; // 巡检对象 位置
  latAndLon: string; // 巡检对象 经纬度
  lntAndLat: string; // 巡检对象 经纬度
  depName: string; // 巡检对象 所属部门
  areaName: string; // 巡检对象 所属区域
  areaNames: string; // 巡检对象 所属区域
  areaId: string; // 巡检对象 所属区域id
  address: string; // 巡检对象 地址
  standardDTOList: StandardVo[];
  code?: string;
  codeNum?: string;
  serialNumber?: string;
  projectNum?: string;
  area?: {
    id?: string;
    name?: string;
    pathId?: string;
    pathName?: string;
  };
}

export interface InspectDictionaryItem {
  variable?: string;
}

export interface InspectDictionaryResponse extends InspectDictionaryItem {
  data?: InspectDictionaryItem | InspectDictionaryItem[];
}

export interface InspectAiFlowRunPayload extends Record<string, unknown> {
  input?: string | null;
  sessionId?: string | null;
  inputType?: string | null;
  outputType?: string | null;
  tweaks?: Record<string, unknown> | null;
}

export interface InspectAiStandardItemPayload {
  name?: string;
  resultId?: string;
  resultItemValue?: string;
  defaultResult?: string;
  imageResult?: string[] | string | boolean | null;
  remarkResult?: string[] | string | boolean | null;
  itemTag?: string | null;
  isResultItem?: boolean;
}

export interface InspectAiStandardPayload {
  name?: string;
  safetyTip?: string;
  safetyTips?: string;
  defaultStandard?: boolean;
  items?: InspectAiStandardItemPayload[];
  standardItems?: InspectAiStandardItemPayload[];
}
