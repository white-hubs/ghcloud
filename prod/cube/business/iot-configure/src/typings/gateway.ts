/** 网关列表 */
export interface GatewayListState {
  gwDeviceNum: string;
  gwEnable: number;
  gwId: number;
  gwName: string;
  gwOnlineTime: string;
  pluginCode: string;
  status: number;
  linkStatus: number;
  switchStatus: boolean;
}

export interface GatewayState {
  name: string;
  deviceNum: string;
  pluginCode: string;
  secret: string;
  id?: string | number;
  remark?: string;
  gwConfig?: string;
  gwConfigSchema?: string;
}

export interface SelectOptions {
  children?: SelectOptions[];
  code?: string;
  id?: string | number;
  name?: string;
}

/** 通道 */
export interface ChannelState {
  channelName?: string;
  chlProtocolCode?: string;
  commCode?: string;
  chlProtocolId?: string | number;
  gwId?: string | number;
  id?: string | number;
  interfaceId?: string | number;
  appConfig?: string;
  linkConfig?: string;
  remark?: string;
  pluginCode?: string;
  chlName?: string;
  chlCode?: string;
  interfaceCode?: string;
  chlId?: string | number;
  appConfigSchema?: string;
  linkConfigSchema?: string;
}

/** 控制器 */
export interface ControllerState {
  appConfig?: string;
  linkConfig?: string;
  appConfigSchema?: string;
  linkConfigSchema?: string;
  ctlCode?: string;
  ctlId?: string | number;
  ctlName?: string;
  ctlStatus?: string | number;
  dynamicConfig?: string;
  lastOnlineTime?: string;
  chlId?: string | number;
  remark?: string;
}
/** 变量 */
export interface VarState {
  appConfig?: string;
  linkConfig?: string;
  ctlId?: string | number;
  chlId?: string | number;
  varId?: string | number;
  remark?: string;
  dataType?: string | undefined;
  enable?: string | number;
  gwId?: string | number;
  readType?: string | number;
  varCode?: string;
  varName?: string;
  appConfigSchema?: string;
  linkConfigSchema?: string;

  groupName?: string;
  lastUpdateTime?: string;
  val?: string;
  virtualCode?: string;
  virtualName?: string;
  zoomExpr?: string;
  precision?: string | number;
  zoomExpression?: string | number;
  reportStrategy?: string | undefined;
  intervalReportMill?: string | number;
  changeUpVal?: string | number;
  convertStyleConfig?: {
    precision?: string | number;
    zoomExpression?: string | number;
  };
  reportStrategyConfig?: {
    reportStrategy?: string | undefined;
    intervalReportMill?: string | number;
    changeUpVal?: string | number;
  };

}

/** 控制器状态 */
export enum CtlStatus {
  OFFLINE = 0,
  ONLINE = 1,
}
export const CtlStatusOptions = [
  { label: '离线', value: CtlStatus.OFFLINE, color: 'warn' },
  { label: '在线', value: CtlStatus.ONLINE, color: 'sucess' },
]

/** 工作状态 */
export enum StatusE {
  UNACTIVATED = -1,
  OFFLINE = 0,
  ONLINE = 1,
}
export const StatusOptions = [
  { label: '未激活', value: StatusE.UNACTIVATED, color: 'info' },
  { label: '离线', value: StatusE.OFFLINE, color: 'warn' },
  { label: '在线', value: StatusE.ONLINE, color: 'sucess' },
]

/** 链接状态 */
export enum LinkStatusE {
  STOPPED = 0,
  STARTING = 1,
  RUNNING = 2,
  STOPPING = 3,
  ABNORMAL = 4,
}
export const LinkStatusOptions = [
  { label: '停止', value: LinkStatusE.STOPPED, color: 'warn' },
  { label: '启动中', value: LinkStatusE.STARTING, color: 'info' },
  { label: '运行中', value: LinkStatusE.RUNNING, color: 'sucess' },
  { label: '停止中', value: LinkStatusE.STOPPING, color: 'info' },
  { label: '异常', value: LinkStatusE.ABNORMAL, color: 'error' },
]
export interface GroupDataItem {
  ctlName: string;
  ctlCode: string;
  varName: string;
  varCode: string;
  zoomExpr: string;
  groupName: string;
  groupNumber: string;
  virtualCode: string;
  id: string;
  ctlId: string;
  handle: boolean;
  groupNameError?: boolean;
  groupNameErrorMsg?: string;
  groupNumberError?: boolean;
  groupNumberErrorMsg?: string;
  virtualCodeError?: boolean;
  virtualCodeErrorMsg?: string;
}
export interface GatewayUrlParams {
  gwId?: string;
  channelId?: string;
  controllerId?: string;
}

/** 任务类型 */
// 1: 控制器变量扫描  2:控制器扫描  3:变量扫描
export enum TaskTypeEnum {
  SCAN_CONTROLLER_VAR = 1,
  SCAN_CONTROLLER = 2,
  SCAN_VAR = 3,
}
/** 扫描结果 */
// 1、进行中 2、扫描已完成 4、查找时间超时退出
export enum ScanResultEnum {
  SCAN_ING = 1,
  SCAN_COMPLETE = 2,
  SCAN_TIMEOUT = 4,
}

export interface ScanCtlResultData {
  scanCtlResults: ScanCtlResult[];
  scanResult: number;
  scanResultMsg: string;
}

export interface ScanCtlResult {
  ctlCode: string;
  id: number;
  name: string;
  scanVarResultList: ScanVarResultList[];
}

export interface ScanVarResultList {
  controllerId: null;
  /**
   * code
   */
  dataType: string;
  devName: string;
  id: number;
  name: string;
  propCode: string;
  propName: string;
  /**
   * 0只读 1读写
   */
  readType: string;
  scanControllerId: number;
  varCode: string;
}
export interface ScanVarResultListData {
  scanResult: number;
  scanResultMsg: string;
  scanVarResultList: ScanVarResultList[];
}

export interface ScanVarResultList {
  controllerId: number;
  /**
   * code
   */
  dataType: string;
  devName: null;
  id: number;
  name: string;
  propCode: null;
  propName: null;
  /**
   * 0 只读 1读写
   */
  readType: number;
  scanControllerId: null;
  varCode: string;
}
