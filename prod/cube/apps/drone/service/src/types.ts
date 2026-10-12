export interface DroneModulePlaceholder {
  readonly ready: boolean;
}

export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export type DroneRouteStatus = "DRAFT" | "ENABLED" | "DISABLED";

export interface DroneRoutePagePayload {
  pageSize: number;
  pageNumber: number;
  routeName?: string | undefined;
  status?: DroneRouteStatus | undefined;
  deviceId?: number | undefined;
}

export interface SecurityDevicePagePayload {
  applicationCode: string;
  pageSize: number;
  pageNumber: number;
  keyword?: string | undefined;
  ids?: string[] | undefined;
  tagCodes?: string[] | undefined;
  filterTagCodes?: string[] | undefined;
}

export interface SecurityDeviceRecord {
  id: string;
  deviceId?: string | number;
  deviceName?: string;
  name?: string;
  code?: string;
  deviceCode?: string;
  deviceProdCategoryName?: string;
  areaName?: string;
}

export interface DroneRouteListModel {
  /** 航线主键 */
  id: number;
  /** 航线名称 */
  routeName: string;
  /** 业务航线编码 */
  routeCode?: string;
  /** 系统设备ID */
  deviceId?: number;
  /** 设备名称 */
  deviceName?: string;
  /** 航点数量 */
  waypointCount?: number;
  /** 航线状态 */
  status: DroneRouteStatus;
  /** 创建人 */
  createBy?: string;
  /** 创建人名称 */
  createByName?: string;
  /** 更新时间 */
  updateTime?: string;
}

export interface DroneWaypointModel {
  /** 航点ID */
  id?: number;
  /** 所属航线ID */
  routeId?: number;
  /** 航点执行顺序 */
  seqNo: number;
  /** 航点名称 */
  waypointName: string;
  /** 当前地图经度 */
  mapLng?: number;
  /** 当前地图纬度 */
  mapLat?: number;
  /** 实际执行经度 */
  actualLng?: number;
  /** 实际执行纬度 */
  actualLat?: number;
  /** 实际执行高度，单位米 */
  actualHeight?: number;
  /** 云台重置模式：0回中、1向下、2偏航回中、3俯仰向下 */
  gimbalResetMode?: number;
  /** DJI 相机类型：ir、wide、zoom */
  cameraType?: string;
  /** 变焦倍数 */
  zoomFactor?: number;
  /** 是否拍照 */
  photoEnabled?: boolean;
  /** 是否录像 */
  recordEnabled?: boolean;
  /** 固定录像时长，单位秒 */
  recordDurationSeconds?: number;
  /** 图片 AI 巡检模板 ID */
  aiTemplateId?: number;
  /** 航点状态：DRAFT、READY */
  status?: string;
  /** 航点备注 */
  remark?: string;
}

export type DroneWaypointCommand = Omit<DroneWaypointModel, "routeId" | "status">;

export interface DroneRouteCommand {
  /** 航线名称 */
  routeName: string;
  /** 航线编码由服务端生成，前端不提交 */
  routeCode?: string | undefined;
  /** 新增和编辑只允许 DRAFT、ENABLED */
  status?: Exclude<DroneRouteStatus, "DISABLED"> | undefined;
  /** 默认飞行高度，单位米 */
  flightHeightM?: number | undefined;
  /** 飞行速度，单位米/秒 */
  flightSpeedMps?: number | undefined;
  /** 返航保留电量百分比 */
  returnBatteryThreshold?: number | undefined;
  /** 安全起飞高度，单位米 */
  safeTakeoffHeightM?: number | undefined;
  /** 返航高度，单位米 */
  rthAltitudeM?: number | undefined;
  /** 系统设备ID */
  deviceId?: number | undefined;
  /** 设备名称 */
  deviceName?: string | undefined;
  /** 设备控制链路类型 */
  controlChannelType?: string | undefined;
  /** 网关设备序列号 */
  gatewaySn?: string | undefined;
  /** 无人机序列号 */
  droneSn?: string | undefined;
  /** 负载索引 */
  payloadIndex?: string | undefined;
  /** 航线备注 */
  remark?: string | undefined;
  /** 航点行集合 */
  waypoints?: DroneWaypointCommand[] | undefined;
}

export interface DroneRouteModel extends Omit<DroneRouteCommand, "status" | "waypoints"> {
  id: number;
  status: DroneRouteStatus;
  version?: number;
  waypoints?: DroneWaypointModel[];
}

export interface DroneRouteStatusPayload {
  status: Extract<DroneRouteStatus, "ENABLED" | "DISABLED">;
}

export interface OSSFile {
  businessKey: string | null;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
  createTime?: string;
}

export interface TrackListModel {
  /** 航线ID */
  id: string;
  /** 航线文件下载地址 */
  fileUrl: string;
  /** 航线文件Web地址 */
  webFileUrl: string;
  /** 航线文件MD5 */
  fileMd5: string;
  /** 文件名称 */
  fileName: string;
  /** 航线名称 */
  trackName: string;
  /** 项目名称 */
  projectName: string;
  /** 航线状态 */
  status: number;
  /** 航线长度 */
  trackLength: number;
  /** 航点数量 */
  waypointCount: number;
  /** 预计飞行时长 秒 */
  estimatedTime: number;
  /** 航线类型 */
  type: number;
  /** 机型 */
  model: number;
  /** 创建类型 */
  createType: number;
  /** 拍照点数量 */
  photoTotal: number;
  /** 高度模式 */
  altitudeMode: number;
  /** 机巢编码 */
  nestSn: string;
  /** 机巢名称 */
  nestName: string;
  /** 飞行高度 */
  height: number;
  /** 飞行速度 */
  speed: number;
  /** 云台俯仰角 */
  pitchAngle: number;
  /** 创建时间 */
  createTime: number;
  /** 更新时间 */
  updateTime: number;
  /** 创建人 */
  createBy?: string;
  /** 创建人名称 */
  createByName?: string;
  /** 创建人名称 */
  createUserName?: string;
  /** 创建人名称 */
  creatorName?: string;
}

export interface FlightTaskListModel {
  /** 主键ID */
  id: string;
  /** 任务ID（唯一标识） */
  taskId: string;
  /** 任务名称 */
  taskName: string;
  /** 任务类型（标识任务的类型） */
  taskType: number;
  /** 状态标识（任务状态） */
  status: number;
  /** 备注信息（任务的补充说明） */
  remark: string;
  /** 航线ID（关联的航线） */
  trackId: string;
  /** 航线名称 */
  trackName: string;
  /** 文件URL（航线文件访问地址） */
  fileUrl: string;
  /** 机库序列号（执行任务的机库设备） */
  nestSn: string;
  /** 机库名称 */
  nestName: string;
  /** 开始时间（计划开始时间戳） */
  startTime: number;
  /** 结束时间（计划结束时间戳） */
  endTime: number;
  /** 结果状态（任务执行结果状态） */
  resultStatus: number;
  /** 天气冲突标识（是否因天气原因冲突） */
  weatherConflict: boolean;
  /** 起始航点索引（任务开始的航点位置） */
  startingPoint: number;
  /** 最后一个航点索引（任务结束的航点位置） */
  lastPoint: number;
  /** 执行时间（任务实际执行耗时，秒） */
  executionTime: number;
  /** 执行状态（任务当前的执行状态） */
  executionStatus: number;
}

export interface TaskAchievementListModel {
  /** 主键ID */
  id: string;
  /** 航线名称 */
  trackName: string;
  /** 任务名称 */
  taskName: string;
  /** 机库序列号 */
  nestSn: string;
  /** 无人机序列号 */
  droneSn: string;
  /** 任务ID */
  taskId: string;
  /** 计划ID */
  scheduledId: string;
  /** 文件密钥（用于文件访问） */
  fileKey: string;
  /** 缩略图密钥（用于缩略图访问） */
  thumbKey: string;
  /** 文件名称 */
  fileName: string;
  /** 文件MD5值（用于文件校验） */
  fileMd5: string;
  /** 分析状态（是否已完成分析） */
  analysisStatus: boolean;
  /** 文件大小（字节） */
  fileSize: number;
  /** 上传类型（标识文件上传方式） */
  uploadType: number;
  /** 坐标值（地理位置信息） */
  coordValue: string;
  /** 文件类型（如图片、视频等） */
  fileType: number;
  /** 负载类型（无人机搭载的设备类型） */
  podType: string;
  /** 通道类型（数据传输通道类型） */
  channelType: number;
  /** 经度坐标 */
  longitude: number;
  /** 纬度坐标 */
  latitude: number;
  /** 海拔高度（米） */
  altitude: number;
  /** 判定状态（任务结果判定状态） */
  judgeStatus: string;
  /** 类型标识 */
  type: string;
  /** 子类型标识 */
  ptype: number;
  /** 创建时间（时间戳） */
  createTime: number;
}

export interface NestDetailModel {
  nestSn: string;
  nestName: string;
  online: boolean;
  temperature: number;
  humidity: number;
  chargeStatus: boolean;
  doorStatus: boolean;
  smoke: boolean;
  longitude?: number;
  latitude?: number;
}

export interface DroneDetailModel {
  droneSn: string;
  name: string;
  nestSn: string;
  nestName: string;
  online: boolean;
  status: "standby" | "flying_auto" | "manual";
  batteryCharge: number;
  signal: number;
  gpsStars: number;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  yaw: number;
  pitch: number;
  roll: number;
}

export interface TrackPointModel {
  id: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  waypointType?: "waypoint" | "observe" | "inspect";
}

export interface TrackDetailModel {
  taskLogId: string;
  trackName: string;
  currentWaypoint: number;
  totalWaypoints: number;
  points: TrackPointModel[];
}

export interface TaskLogDetailModel {
  taskLogId: string;
  taskName: string;
  status: "running" | "completed";
  currentWaypoint: number;
  totalWaypoints: number;
  startTime: string;
}

export interface DroneControlPayload {
  sn: string;
  latitude?: number;
  longitude?: number;
  height?: number;
  levelSpeed?: number;
  flyType?: string;
}

export interface ShouterTransferPayload {
  nestSn: string;
  text: string;
}

export interface VideoStreamPayload {
  secret: string;
  app: string;
  vhost: string;
  stream: string;
  period: string;
}
