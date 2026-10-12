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
  dataType?: string;
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
