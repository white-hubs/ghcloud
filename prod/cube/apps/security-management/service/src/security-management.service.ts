import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}`

export interface SecurityDeviceRecord {
  id: string;
  deviceName: string;
  deviceId: string;
  deviceCode: string;
  applicationCode: string;
  brandName: string;
  brandCode: string;
  areaName: string;
  areaId: string;
  code: string;
  lntAndLat: string;
  thirdPartyId: string;
  deviceStatus: false;
  deviceProdCategoryCode: string;
  deviceProdCategoryCodeConcat: string;
  deviceProdCategoryName: string;
  deviceProdId: string;
  deviceProdName: string;
  communicationStatus: string;
  collection: boolean;
  picture: {
    businessKey: string | null;
    createTime: number;
    endpointPath: string;
    id: string;
    name: string;
    path: string;
    refCount: number;
    size: number;
    suffix: string;
    type: string;
  } | null;
}
export interface AreaTreeType {
  'id': string;
  'parentId': string;
  'level': number;
  children?:
  {
    'id': string;
    'parentId': string;
    'level': number;
    children?: AreaTreeType[];
    'name': string;
    'code': string;
    'sequence': string;
    'deviceNum': number;
    'builtUpArea': null;
    'areaManagerId': string;
    'areaDepartmentId': string;
    'areaManagerIds': string[];
    'areaManagerName': string[];
    'sort': number;
    'aliasName': string;
  }[]
  ;
  'name': string;
  'code': string;
  'sequence': string;
  'deviceNum': number;
  'builtUpArea': null;
  'areaManagerId': string;
  'areaDepartmentId': string;
  'areaManagerIds': string[];
  'areaManagerName': string[];
  'sort': number;
  'aliasName': string;

}
export interface GenreVoType {
  deviceProdCategoryCode: string;
  deviceProdCategoryCodeConcat: string;
  deviceProdCategoryName: string;
  num: number;
  proportion: string;
}

export interface DeviceStatus {
  'total': number;
  'statusListVos': [
    {
      'name': 'ONLINE';
      'num': number;
    },
    {
      'name': 'OFFLINE';
      'num': number;
    }
  ];
}

export interface GroupAttributive {
  id: string;
  name: string;
  groupAttributiveDetailsVos: {
    applicationCode: string;
    attributiveName: string;
    code: string;
    groupId: string;
  }[];
}

export interface CameraPatrolLineAbnormalStatistics {
  /**
   * 线路分组异常数量集合
   */
  cameraPatrolLineAbnormalStatisticsVOS:
  {
    /**
       * 线路主键
       */
    id: string;
    /**
       * 线路名称
       */
    name: string;
    totalNum: number;
  }[];
  /**
   * 线路总数
   */
  countNum: string;
  /**
   * 异常数最多的线路名称
   */
  mostAbnormalPatrolName: string;
  /**
   * 最多异常数的线路异常数量
   */
  mostAbnormalPatrolNum: string;
}

/** 视频巡逻记录 */
export interface CameraPatrolRecord {
  /**
     * 巡逻异常数量
     */
  abnormalNum: number;
  /**
       * 巡逻线路主键
       */
  cameraPatrolLineId: number;
  /**
       * 巡逻线路名称
       */
  cameraPatrolLineName: string;
  /**
       * 巡逻完成数量
       */
  completeNum: number;
  /**
       * 完成时间
       */
  completeTime: string;
  /**
       * 巡逻耗时
       */
  duration: string;
  /**
       * 巡逻空闲数量
       */
  freeNum: number;
  id: number;
  /**
       * 巡逻正常数量
       */
  normalNum: number;
  /**
       * 巡逻总数
       */
  num: number;
  /**
       * 巡逻时间
       */
  patrolTime: string;
  /**
       * 巡逻状态
       */
  status: string;
  /**
       * 巡逻人员
       */
  userId: number;
  /**
       * 巡逻人员名称
       */
  userName: string;
}

export interface CameraPatrolDeviceVO {
  area: string;
  areaIds: string[];
  areaNames: string;
  cameraPatrolLineId: string;
  deviceCode: string;
  deviceId: string;
  deviceName: string;
  id: string;
  sort: number;
  streamMedia: string | null;
  thirdPartyId: string;
}

/** 视频巡逻记录 */
export interface CameraPatrolLine {
  cameraNum: number;
  createBy: string;
  createByName: string;
  createTime: number;
  enabled: boolean;
  id: string;
  name: string;
  patrolLastTime: number;
  patrolNum: number;
  patrolProposalTime: string;
  patrolUserNames: string;
  cameraPatrolDeviceVOS: CameraPatrolDeviceVO[];
}

/** 视频巡逻设备 */
export interface CameraPatrolRecordDevice {
  /**
     * 异常数量
     */
  abnormalNum: number;
  /**
       * 所属区域名称
       */
  areaNames: string;
  /**
       * 巡逻记录主键
       */
  cameraPatrolRecordId: number;
  /**
       * 完成时间
       */
  completeTime: string;
  /**
       * 巡逻监控设备编号
       */
  deviceCode: string;
  /**
       * 巡逻监控设备主键
       */
  deviceId: number;
  /**
       * 巡逻监控设备名称
       */
  deviceName: string;
  id: number;
  /**
       * 图片
       */
  image: {
    businessKey: string | null;
    createTime: number;
    endpointPath: string;
    id: string;
    name: string;
    path: string;
    refCount: number;
    size: number;
    suffix: string;
    type: string;
  } | null;
  /**
       * 巡逻时间
       */
  patrolTime: string;
  /**
       * 巡逻结果
       */
  result: string;
  /**
       * 序号
       */
  sort: number;
  /**
       * 巡逻状态
       */
  status: string;
}

export interface CameraPatrolRecordDeviceRemark {
  /**
     * 视频巡逻设备记录主键
     */
  cameraPatrolRecordDeviceId: string;
  cameraPatrolRecordId: string;
  /**
       * 设备编号
       */
  deviceCode: string;
  /**
       * 巡逻监控设备主键
       */
  deviceId: string;
  /**
       * 设备名称
       */
  deviceName: string;
  /**
       * 附件地址集合
       */
  filePathList: {
    extranetFilePath: string;
    intranetFilePath: string;
  }[];
  id: string;
  /**
       * 设备图片
       */
  image: {
    businessKey: string | null;
    createTime: number;
    endpointPath: string;
    id: string;
    name: string;
    path: string;
    refCount: number;
    size: number;
    suffix: string;
    type: string;
  } | null;
  /**
       * 备注
       */
  remark: string;
  /**
       * 序号
       */
  sort: string;
  filePaths: string;
}

export enum CameraPatrolResult {
  abnormal = 'CAMERA_PATROL_ABNORMAL',
  normal = 'CAMERA_PATROL_NORMAL',
  unknown = 'CAMERA_PATROL_UNKNOWN',
}
export enum CameraPatrolStatus {
  complete = 'CAMERA_PATROL_COMPLETE',
  unknown = 'CAMERA_PATROL_UNKNOWN',
}

export interface MonitorAreaTreeItem {
  code: string;
  deviceCount: number;
  id: string;
  level: number;
  name: string;
  parentId: string | null;
  sequence: string;
  status: string;
  statusName: string;
  streamMedia: null;
  thirdPartyId: string;
  type: string;
  children: MonitorAreaTreeItem[];
}

export interface MultipleVideoDevice {
  /**
     * 区域主键
     */
  areaId: boolean;
  /**
   * 区域名称
   */
  areaName: string;
  /**
   * 是否收藏，是否收藏
   */
  collected: boolean;
  /**
   * 在线状态，true:在线,false:离线
   */
  deviceStatus: boolean;
  id: string;
  /**
   * 设备实例名称
   */
  name: string;
  /**
   * 产品信息
   */
  product: {
    /**
     * 品牌名称
     */
    brandName: string;
    /**
     * 设备产品主键
     */
    id: string;
    /**
     * 产品图片，文件对象
     */
    image: {
      path: string;
    };
    /**
     * 设备产品名称
     */
    name: string;
    /**
     * 品类信息
     */
    prodCategory: {
      /**
     * 产品品类编号
     */
      prodCategoryCode: string;
      /**
     * 产品品类编号序列号
     */
      prodCategoryCodeConcat: string;
      /**
     * 产品品类名称
     */
      prodCategoryName: string;
    };
  };
  /**
   * 流媒体信息
   */
  streamMedia: {
    /**
     * 流媒体主键
     */
    steamMediaConfigId: string;
    /**
     * 流媒体内网地址
     */
    steamMediaIntranetAddress: string;
    /**
     * 流媒体外网地址
     */
    steamMediaIpAddress: string;
    /**
     * 流媒体名称
     */
    steamMediaName: string;
  };
  /**
   * 第三方设备标识，原token
   */
  thirdPartyId: string;
  /**
   * 设备标签集合
   */
  tags: [
    {
      /**
       * 标签标识
       */
      id: string;
      /**
       * 标签名称
       */
      tagName: string;
      /**
       * 标签编码
       */
      tagCode: string;
      /**
       * 标签描述
       */
      description: string;
      /**
       * 启用状态
       */
      enableStatus: boolean;
    }
  ];
}

export interface VideoGroupDevice {
  areaId: boolean;
  areaName: string;
  /** 设备中心分组接口可能返回 area 替代 areaName */
  area?: {
    pathName: string;
    pathId: string | null;
    name: string;
    id: string | null;
  } | null;
  collected: boolean;
  deviceStatus?: boolean;
  id: string;
  name: string;
  /** 与 product 二选一，设备中心分组接口常用 productInfo */
  productInfo?: {
    brandName?: string;
    id?: string;
    image?: {
      path?: string;
    };
    name?: string;
    prodCategory?: {
      prodCategoryCode?: string;
      prodCategoryCodeConcat?: string;
      prodCategoryName?: string;
    };
  } | null;
  product?: {
    brandName: string;
    id: string;
    image: {
      path: string;
    };
    name: string;
    prodCategory: {
      prodCategoryCode: string;
      prodCategoryCodeConcat: string;
      prodCategoryName: string;
    };
  };
  streamMedia: {
    steamMediaConfigId: string;
    steamMediaIntranetAddress: string;
    steamMediaIpAddress: string;
    steamMediaName: string;
  };
  thirdPartyId: string;
  tags: [
    {
      id: string;
      tagName: string;
      tagCode: string;
      description: string;
      enableStatus: boolean;
    }
  ];
  status?: {
    onlineState?: boolean;
    communicationTime?: string | null;
  };
}

export interface VideoDeviceGroup {
  deviceCount?: number;
  devices: VideoGroupDevice[];
  id: string;
  name: string;
  remark?: string;
}

export interface MeetingApplyType {
  id: string;
  applyCode: string;
  applyTime: string;
  applyPersonId: string;
  applyPersonName: string;
  meetingType: string;
  meetingStartTime: string;
  meetingEndTime: string;
  meetingTypeName: string;
  meetingReason: string;
  meetingTime: string;
  approvalResult: string;
  approvalResultReason: string;
  thirdRecordId: string;
  meetingPersons: string;
  accompanyingPersonCount: number;
  visitedPersons: string;
}
export interface MeetingApplyDetail {
  id: string;
  applyCode: string;
  applyTime: string;
  applyPersonId: string;
  applyPersonName: string;
  meetingType: string;
  meetingTypeName: string;
  meetingStartTime: string;
  meetingEndTime: string;
  meetingReason: string;
  meetingTime: string;
  approvalResult: string;
  approvalResultReason: string;
  thirdRecordId: string;
  meetingCode: string;
  meetingProcessAudio: string;
  meetingPersons: {
    id: string;
    businessKey: string;
    businessCode: string;
    businessType: string;
    meetingPersonId: string;
    meetingPersonCode: string;
    meetingPersonType: string;
    meetingPersonTypeName: string;
    meetingPersonName: string;
    meetingPersonDocumentType: string;
    meetingPersonDocumentTypeName: string;
    meetingPersonDocumentNumber: string; }[];
}
export interface MeetingRecordType {
  id: string;
  meetingCode: string;
  meetingType: string;
  meetingStartTime: string;
  meetingEndTime: string;
  meetingTypeName: string;
  meetingReason: string;
  meetingTime: string;
  meetingProcessAudio: string;
  thirdRecordId: string;
  meetingPersons: string;
  accompanyingPersonCount: number;
  visitedPersons: string;
}
export interface RollCallTask {
  id: string;
  taskCode: string;
  taskName: string;
  locationName: string;
  callType: string;
  callStartTime: string;
  callEndTime: string;
  status: string;
  attendedCount: number;
  unattendedCount: number;
  specialCount: number;
  duration: string;
  thirdRecordId: string;
}
export interface RollCall {
  id: string;
  recordCode: string;
  personName: string;
  indexCode: string;
  facePhoto: string;
  capturePhoto: string;
  deviceCode: string;
  taskType: string;
  similarity: number;
  status: number;
  remark: string;
  rollcallTime: string;
  areaIndexCode: string;
  departmentIndexCode: string;
  departmentName: string;
  deviceName: string;
  areaName: string;
}
export interface DeviceProductVo {
  deviceProdName: string;
  deviceProdId: string;
}
export class CubeSecurityManagementService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 关联设备分页 */
  public async getSecurityDevicePage (params: {
    applicationCode: string;
    pageSize: number;
    pageNumber: number;
    areaId?: string[] | string;
    tenant?: string;
    keyword?: string;
    ids?: string[];
    tagCodes?: string[];
  }): Promise<{ total: number;records: SecurityDeviceRecord[]; pages: number; }> {
    const url = `${baseURL}/securitymanagement/getSecurityDevicePage/${params.applicationCode}`
    this.gateway.updateAuth({ tenant: params.tenant })
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;records: SecurityDeviceRecord[]; pages: number; }>>({ url, payload: params })
    return resp?.data || resp
  }

  /** 设备监测 分页（洁净手术-根据租户id查询） */
  public async getDeviceMonitoringByTenantPage (params: {
    applicationCode: string;
    pageSize: number;
    pageNumber: number;
    areaId?: string | undefined;
    keyword?: string;
    tenant?: string | undefined;
    deviceProdCategoryCodeConcat?: string | undefined;
  }): Promise<{ total: number;records: SecurityDeviceRecord[]; page: number; }> {
    const url = `${baseURL}/securitymanagement/getDeviceMonitoringByTenantPage/${params.applicationCode}`
    const headers = params.tenant ? { headers: { tenant: params.tenant } } : {}
    const resp = await this.gateway.custom<LegacyServiceError<{ total: number;records: SecurityDeviceRecord[]; page: number; }>>({
      url,
      query: params,
      method: 'GET',
      ...headers
    })
    return resp?.data || resp
  }

  // 监测设备分页列表
  public async getDeviceMonitoringPage (params: {
    applicationCode: string;
    appAreaId?: string;
    status?: string;
    genre?: string;
    deviceId?: string;
    tagCodes?: string[];
    pageNumber: number;
    keyword?: string;
  }): Promise<{ total: number;records: SecurityDeviceRecord[]; pages: number; }> {
    const url = `${baseURL}/securitymanagement/getDeviceMonitoringPage/${params.applicationCode}`
    const res = await this.gateway.get<LegacyServiceError<{ total: number;records: SecurityDeviceRecord[]; pages: number; }>>({ url, payload: params })
    return res?.data || res
  }

  // 设备区域
  public async getAreaTree (params: {
    applicationCode: string;
  }): Promise< AreaTreeType[]> {
    const url = `${baseURL}/securitymanagement/getAreaTree/${params.applicationCode}`
    const res = await this.gateway.get<LegacyServiceError<AreaTreeType[]>>({ url, payload: params })
    return res?.data || res
  }

  // 获取设备产品列表
  public async getDeviceProductList (params: {
    applicationCode: string;
  }): Promise<DeviceProductVo[]> {
    const url = `${baseURL}/securitymanagement/getApplicationModels/${params.applicationCode}`
    const res = await this.gateway.get<LegacyServiceError<DeviceProductVo[]>>({ url, payload: params })
    return res?.data || res
  }

  // app监测收藏设备分页列表
  public async getCollectionDeviceMonitoringPage (params: {
    applicationCode: string;
    appAreaId?: string;
    status?: string;
    genre?: string;
    deviceId?: string;
    tagCodes?: string[];
    pageNumber: number;
    keyword?: string;
  }): Promise<{ total: number;records: SecurityDeviceRecord[]; pages: number; }> {
    const url = `${baseURL}/securitymanagement/getCollectionDeviceMonitoringPage/${params.applicationCode}`
    const res = await this.gateway.get<LegacyServiceError<{ total: number;records: SecurityDeviceRecord[]; pages: number; }>>({ url, payload: params })
    return res?.data || res
  }

  // 收藏/取消
  public async addDeviceCollection (params: {
    applicationCode: string;
    deviceId: string;
  }): Promise< unknown> {
    const url = `${baseURL}/securitymanagement//addDeviceCollection`
    const res = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload: params })
    return res?.data || res
  }

  // 产品类型
  public async getApplicationGenreVo (params: {
    applicationCode: string;
  }): Promise<GenreVoType[]> {
    const url = `${baseURL}/securitymanagement/getApplicationGenreVo/${params.applicationCode}`
    const res = await this.gateway.get<LegacyServiceError<GenreVoType[]>>({ url, payload: params })
    return res?.data || res
  }

  /** 设备状态数据数 */
  public async getStatusList (applicationCode: string): Promise<DeviceStatus> {
    const url = `${baseURL}/securitymanagement/getStatusList/${applicationCode}`
    const res = await this.gateway.get<LegacyServiceError<DeviceStatus>>({ url })
    return res?.data || res
  }

  /** 应用内设备属性分组 */
  public async getGroupAttributive (applicationCode: string): Promise<GroupAttributive[]> {
    const url = `${baseURL}/securitymanagement/group-attributive/${applicationCode}`
    const res = await this.gateway.get<LegacyServiceError<GroupAttributive[]>>({ url })
    return res?.data || res
  }

  /** 视频播放地址获取 标准接口 */
  public async getVideoGatewayPlayUrl (deviceId: string, protocol?: string): Promise<string> {
    const url = `${baseURL}/videogw/video/${deviceId}/preview-url?protocol=${protocol}`
    const res = await this.gateway.get<LegacyServiceError<{ url: string; }>>({ url })
    return res?.data?.url || res?.url
  }

  /** 摄像头控制 标准接口 */
  public async videoControl (deviceId: string, payload?: {
    action: string;
    command: string;
    speed: number;
  }): Promise<void> {
    const url = `${baseURL}/videogw/video/${deviceId}/ptz/control`
    await this.gateway.create<LegacyServiceError<void>>({ url, payload })
  }

  // 历史数据
  public async getHistorical (params: {
    deviceId: string;
    period: string;
    attributives: string [
    ];
  }): Promise<Record<string, string[]>> {
    const url = `${baseURL}/securitymanagement/historical-attribute`
    const res = await this.gateway.create<LegacyServiceError<Record<string, string[]>>>({ url, payload: params })
    return res?.data || res
  }

  /** 会见申请分页 */
  public async getMeetingApplyPage (params: {
    pageSize: number;
    pageNumber: number;
    meetingPeriod?: string;
    applyPersonName?: string;
    visitedPerson?: string;
  }): Promise<{ total: number;records: MeetingApplyType[]; pages: number; }> {
    const url = `${baseURL}/securitymanagement/meeting/apply/page`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;records: MeetingApplyType[]; pages: number; }>>({ url, payload: params })
    return resp?.data || resp
  }

  /** 会见记录分页 */
  public async getMeetingPage (params: {
    pageSize: number;
    pageNumber: number;
    meetingPeriod?: string;
    visitedPerson?: string;
  }): Promise<{ total: number;records: MeetingRecordType[]; pages: number; }> {
    const url = `${baseURL}/securitymanagement/meeting/page`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;records: MeetingRecordType[]; pages: number; }>>({ url, payload: params })
    return resp?.data || resp
  }

  /** 会见申请详情 */
  public async meetingApplyGetById (id: string): Promise<MeetingApplyDetail> {
    const url = `${baseURL}/securitymanagement/meeting/apply/detail?id=${id}`
    const resp = await this.gateway.get<LegacyServiceError<MeetingApplyDetail>>({ url })
    return resp?.data || resp
  }

  /** 会见记录详情 */
  public async meetingGetById (id: string): Promise<MeetingApplyDetail> {
    const url = `${baseURL}/securitymanagement/meeting/detail?id=${id}`
    const resp = await this.gateway.get<LegacyServiceError<MeetingApplyDetail>>({ url })
    return resp?.data || resp
  }

  /** 点名任务记录 */
  public async personRollCallTaskPage (params: {
    pageSize: number;
    pageNumber: number;
    callTimePeriod?: string;
    callType?: string;
    taskName: string;
  }): Promise<{ total: number;records: RollCallTask[]; pages: number; }> {
    const url = `${baseURL}/securitymanagement/person/roll/call/task/page`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;records: RollCallTask[]; pages: number; }>>({ url, payload: params })
    return resp?.data || resp
  }

  /** 获取人员点名类别枚举 */
  public async personCallType (): Promise<{ total: number;records: RollCallTask[]; pages: number; }> {
    const url = `${baseURL}/securitymanagement/person/roll/call/task/call-type`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;records: RollCallTask[]; pages: number; }>>({ url })
    return resp?.data || resp
  }

  /** 人员点到明细 */
  public async personRollCallPage (params: {
    pageSize: number;
    pageNumber: number;
    recordCode?: string;
    name?: number;
    indexCode?: string;
    status?: string;
    channelName?: string;
  }): Promise<{ total: number;records: RollCall[]; pages: number; }> {
    const url = `${baseURL}/securitymanagement/person/roll/call/page`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;records: RollCall[]; pages: number; }>>({ url, payload: params })
    return resp?.data || resp
  }

  /** 视频巡逻异常数增长率统计 */
  public async getCameraPatrolGrowthRate (params: {
    type: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR';
    period: string;
  }): Promise<{
      ringRatio: string;
      totalNum: number;
    }> {
    const url = '/api/vmonitor/camera-patrol-line-statistics/abnormal-growth-rate'
    const res = await this.gateway.get<LegacyServiceError<{
      ringRatio: string;
      totalNum: number;
    }>>({ url, payload: params })
    return res?.data || res
  }

  /** 巡逻异常情况统计 */
  public async getCameraPatrolAbnormalStatistics (period: string): Promise<CameraPatrolLineAbnormalStatistics> {
    const url = '/api/vmonitor/camera-patrol-line-statistics/abnormal'
    const res = await this.gateway.get<LegacyServiceError<CameraPatrolLineAbnormalStatistics>>({ url, payload: { period } })
    return res?.data || res
  }

  /** 巡逻记录 */
  public async getCameraPatrolRecords (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string;
  }): Promise<{ total: number; records: CameraPatrolRecord[];pages: number; }> {
    const url = '/api/vmonitor/camera-patrol-records'
    const res = await this.gateway.get<LegacyServiceError<{ total: number; records: CameraPatrolRecord[];pages: number; }>>({ url, payload })
    return res?.data || res
  }

  /** 巡逻路线 */
  public async getCameraPatrolLineAuthPage (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string;
    enabled?: boolean;
  }): Promise<{ total: number; records: CameraPatrolLine[];pages: number; }> {
    const url = '/api/vmonitor/camera-patrol-line/auth-page'
    const res = await this.gateway.get<LegacyServiceError<{ total: number; records: CameraPatrolLine[];pages: number; }>>({ url, payload })
    return res?.data || res
  }

  /** 巡逻记录详情 */
  public async getCameraPatrolDetailById (id: string): Promise<CameraPatrolRecord> {
    const url = `/api/vmonitor/camera-patrol-record/${id}`
    const res = await this.gateway.get<LegacyServiceError<CameraPatrolRecord>>({ url })
    return res?.data || res
  }

  /** 巡逻路线详情 */
  public async getCameraPatrolLineById (id: string): Promise<CameraPatrolLine> {
    const url = `/api/vmonitor/camera-patrol-line/${id}`
    const res = await this.gateway.get<LegacyServiceError<CameraPatrolLine>>({ url })
    return res?.data || res
  }

  /** 视频巡逻设备记录列表(根据巡逻记录获取) */
  public async getCameraPatrolRecordDevices (cameraPatrolRecordId: string): Promise<CameraPatrolRecordDevice[]> {
    const url = `/api/vmonitor/camera-patrol-record-devices/${cameraPatrolRecordId}`
    const res = await this.gateway.get<LegacyServiceError<CameraPatrolRecordDevice[]>>({ url })
    return res?.data || res
  }

  /** 视频巡逻设备记录列表(根据巡逻记录获取) */
  public async getCameraPatrolRecordDeviceRemarks (cameraPatrolRecordId: string): Promise<CameraPatrolRecordDeviceRemark[]> {
    const url = `/api/vmonitor/camera-patrol-record-device-remarks/${cameraPatrolRecordId}`
    const res = await this.gateway.get<LegacyServiceError<CameraPatrolRecordDeviceRemark[]>>({ url })
    return res?.data || res
  }

  /** 视频巡逻记录添加 */
  public async createCameraPatrolRecord (params: {
    /**
     * 巡逻线路主键
     */
    cameraPatrolLineId: string;
    /**
        * 巡逻线路名称
        */
    cameraPatrolLineName: string;
    /**
        * 完成时间
        */
    completeTime: string;
    deviceModifyParams: {
      /**
       * 巡逻设备区域
       */
      area: string;
      /**
       * 巡逻设备区域名称
       */
      areaNames: string;
      /**
       * 设备编号
       */
      deviceCode: string;
      /**
       * 巡逻设备主键
       */
      deviceId: string;
      /**
       * 设备名称
       */
      deviceName: string;
      /**
       * 巡逻状态描述
       */
      deviceRemarksModifyParams: {
        'sort': string;
        'remark': string;
        'filePathList': string[];
      }[];
      /**
       * 巡逻时间
       */
      patrolTime: string;
      /**
       * 巡逻结果
       */
      result: CameraPatrolResult;
      /**
       * 序号
       */
      sort: number;
      /**
       * 巡逻状态
       */
      status: CameraPatrolStatus;
    }[];
  }): Promise<Record<string, string[]>> {
    const url = '/api/vmonitor/camera-patrol-record'
    const res = await this.gateway.create<LegacyServiceError<Record<string, string[]>>>({ url, payload: params })
    return res?.data || res
  }

  /** H5S 截图 */
  public async h5sVideoScreenshot (token: string): Promise<{
    extranetFilePath: string;
    intranetFilePath: string;
  }> {
    const url = '/api/vmonitor/camera-ptz/photograph'
    const res = await this.gateway.create<LegacyServiceError<{
      extranetFilePath: string;
      intranetFilePath: string;
    }>>({ url, payload: { token } })
    return res?.data || res
  }

  /** 视频截图 */
  public async videoScreenshot (payload:{
    deviceId: string
  } ): Promise<{
    previewUrl: string;
  }> {
    const url = `${baseURL}/vmonitor/camera-patrol-record/snap-capture`
    const res = await this.gateway.create<LegacyServiceError<{
      previewUrl: string;
    }>>({ url ,payload })
    return res?.data || res
  }

  /** 多路视频树形列表 */
  public async getMonitorAreaTree (): Promise<MonitorAreaTreeItem[]> {
    const url = '/api/vmonitor/multiple-video/area-tree-devices'
    const res = await this.gateway.get<LegacyServiceError<MonitorAreaTreeItem[]>>({ url })
    return res?.data || res
  }

  /** 多路视频设备分页列表 */
  public async getMultipleVideoDevicesPage (params: {
    /**
     * 区域
     */
    area?: string;
    /**
         * 区域id
         */
    areaId?: string;
    /**
         * 设备产品品类编号
         */
    deviceProdCategoryCodeConcat?: string;
    /**
         * 设备名称或者编号搜索
         */
    keyword?: string;
    /**
         * 页码
         */
    pageNumber?: number;
    /**
         * 页大小
         */
    pageSize?: number;
    /**
         * 在线状态,true:在线.false:离线
         */
    status?: boolean;
    /**
         * 设备标签集合
         */
    tagCodes?: string[];
  }): Promise<{ total: number;records: MultipleVideoDevice[]; pages: number; }> {
    const url = '/api/vmonitor/multiple-video/devices'
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;records: MultipleVideoDevice[]; pages: number; }>>({ url, payload: params })
    return resp?.data || resp
  }

  /** 收藏视频分页 */
  public async getCollectVideoDevicesPage (params: {

    /**
         * 区域id
         */
    areaId?: string;

    /**
         * 设备名称或者编号搜索
         */
    keyword?: string;
    /**
         * 页码
         */
    pageNumber?: number;
    /**
         * 页大小
         */
    pageSize?: number;
  }): Promise<{ total: number;records: MultipleVideoDevice[]; pages: number; }> {
    const url = '/api/vmonitor/multiple-video-collect-camera/page'
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;records: MultipleVideoDevice[]; pages: number; }>>({ url, payload: params })
    return resp?.data || resp
  }

  /** 收藏/取消收藏 视频 */
  public async collectCamera (deviceId: string, collect = true): Promise<void> {
    const url = '/api/vmonitor/multiple-video-collect-camera'
    if (collect) {
      await this.gateway.create<LegacyServiceError<unknown>>({ url, payload: { deviceId } })
    } else {
      await this.gateway.delete({ url: `${url}/${deviceId}` })
    }
  }

  /** 视频分组列表（包含分组内设备） */
  public async getVideoDeviceGroupAll (params?: { deviceName?: string }): Promise<VideoDeviceGroup[]> {
    const url = '/api/vmonitor/multiple-video/device-groups'
    const resp = await this.gateway.get<LegacyServiceError<VideoDeviceGroup[]>>({ url, payload: params })
    return resp?.data || resp
  }

  /** 会议室设备分页 */
  public async getSecurityScreenOutDevicePage (payload: {
    applicationCode: string;
    pageSize: number;
    pageNumber: number;
    areaId?: string[] | string;
    keyword?: string;
    ids?: string[];
  }): Promise<{ total: number;records: unknown[]; pages: number; }> {
    const url = `${baseURL}/securitymanagement/screen-out-existing-data`
    const resp = await this.gateway.custom<LegacyServiceError<{ total: number;records: unknown[]; pages: number; }>>({ url, payload, method: 'POST' })
    return resp?.data || resp
  }
}
