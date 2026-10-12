import { type CubeAuth, CubeGateway, type LegacyServiceError, type Pagination } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type {
  AlarmDetails,
  AlarmEventStatisticsType,
  AreaAnalysis,
  EfficiencyTenAnalysis,
  EventAnalysis,
  LevelHandlerEfficiencyAnalysis,
  OperatorRecord,
  TrendAnalysis,
  AlarmNearbyDevice,
  AlarmStaticDTO,
} from "./type";
import type {
  AlarmFollowVo,
  AlarmLevel,
  AlarmLevelPlayConfigVO,
  AlarmReason,
  AlarmRecord,
  AlarmStatisticsTrend,
  AlarmStatisticsTypeRank,
  AlarmStatisticsVO,
  AlarmType,
  FileVOState,
  HandleAnalysis,
} from "./types/alarm-center";

const baseURL = `${BASE_API}/alarm`;

export class CubeAlarmCenterService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 报警级别 */
  public async getSatAlarmLevels(): Promise<AlarmLevel[]> {
    const url = `${baseURL}/sat-alarm-levels`;
    const resp = await this.gateway.get<LegacyServiceError<AlarmLevel[]>>({
      url,
    });
    return resp.data || resp;
  }

  /** 报警类型 */
  public async getSatAlarmTypes(): Promise<AlarmType[]> {
    const url = `${baseURL}/sat-alarm-types`;
    const resp = await this.gateway.get<LegacyServiceError<AlarmType[]>>({
      url,
    });
    return resp.data || resp;
  }

  /** 报警原因 */
  public async getAlarmReasons(): Promise<AlarmReason[]> {
    const url = `${baseURL}/alarm-reasons`;
    const resp = await this.gateway.get<LegacyServiceError<AlarmReason[]>>({
      url,
    });
    return resp.data || resp;
  }

  /** 报警记录分页 */
  public async getAlarmRecordsPage(payload: {
    areaLike?: boolean;
    /**
     * 报警事件
     */
    alarmEvent?: string | null;
    /**
     * 事件分类信息
     */
    alarmEventTypeId?: string | null;
    /**
     * 处理结果,实报:ALARM_ACTUAL,误报:ALARM_IMPRACTICAL
     */
    alarmHandlerResult?: string | null;
    /**
     * 报警超时状态 超时:TIMED_OUT,正常:NORMAL
     */
    alarmHandlerTimeoutStatus?: string | null;
    /**
     * 报警级别编号
     */
    alarmLevelCode?: string | null;
    /**
     * 报警级别主键
     */
    alarmLevelId?: string | number | null;
    /**
     *
     * 确认状态待确认:ALARM_UN_CONFIRMED,处理中:ALARM_PROGRESS_CONFIRMED,已挂起:ALARM_SUSPEND,已处理:ALARM_HANDLER
     */
    alarmStatus?: string | null;
    /**
     * 报警对象类型主键
     */
    alarmTargetTypeId?: number | null;
    /**
     * 报警类型主键
     */
    alarmTypeId?: string | null;
    /**
     * 应用编号
     */
    applicationCode?: string | null;
    /**
     * 区域主键
     */
    areaId?: string | null;
    /**
     * 报警区域
     */
    areaIds?: string | null;
    /**
     * 业务类型,设备报警:DEVICE_ALARM,预案中心报警:EMERGENCY_CENTER
     */
    businessType?: string | null;
    /**
     * 部门主键
     */
    departmentId?: string | null;
    /**
     * 设备主键集合
     */
    deviceIds?: string[] | null;
    /**
     * 设备标签集合
     */
    deviceTags?: string | null;
    /**
     * 关键字
     */
    keyword?: string | null;
    pageNumber?: number;
    pageSize?: number;
    /**
     * 报警时间范围
     */
    period?:
      | string
      | {
          begin: string;
          end: string;
        };
    /**
     * 场景id
     */
    sceneType?: string | null;
    /**
     * 用户主键
     */
    userId?: string | null;
    /**
     * 用户负责的报警,true:只查询负责的报警数(不包含待接收),false:查询用户所有的报警数
     */
    userResponsible?: string | null;
  }): Promise<{ total: number; records: AlarmRecord[]; pages: number }> {
    const url = `${baseURL}/alarm-records`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: AlarmRecord[]; pages: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 报警移交 */
  public async handleAlarmTransfer(
    id: string,
    payload: {
      departmentId: string;
      departmentName: string;
      userId: string;
      userName: string;
    },
  ): Promise<void> {
    const url = `${baseURL}/alarm-record/transfer/${id}`;
    await this.gateway.update({ url, payload });
  }

  /** 报警处理 */
  public async handleAlarm(
    id: string,
    payload: {
      alarmHandlerResult: string;
      alarmHandlerResultRemark: string;
      fileVOS: FileVOState[];
    },
  ): Promise<void> {
    const url = `${baseURL}/alarm-record/handler/${id}`;
    await this.gateway.update({ url, payload });
  }

  /** 报警接收确认 */
  public async handleAlarmConfirm(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/alarm-record/confirmed/${payload.id}`;
    await this.gateway.update({ url, payload });
  }

  /** 详情 */
  public async getAlarmDetails(id: string): Promise<AlarmDetails> {
    const url = `${baseURL}/alarm-record/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<AlarmDetails>>({
      url,
    });
    return resp.data || resp;
  }

  /** 报警处理记录 */
  public async getAlarmHandlerRecords(id: string): Promise<OperatorRecord[]> {
    const url = `${baseURL}/alarm-record/operatorLogs/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<OperatorRecord[]>>({
      url,
    });
    return resp.data || resp;
  }

  /** 报警消息发送 */
  public async satAlarmMsgSend(payload: {
    /**
     * 可能是报警事件或者能耗异常类型（用于指定此次报警是什么引起的）
     */
    alarmEvent?: string;
    /**
     * 报警事件名称
     */
    alarmEventName: string;
    /**
     * 级别主键
     */
    alarmLevelId: string;
    /**
     * 对象编号
     */
    alarmTargetCode: string;
    /**
     * 对象主键
     */
    alarmTargetKey: string;
    /**
     * 对象名称
     */
    alarmTargetName: string;
    /**
     * 对象类型主键
     */
    alarmTargetTypeId: string;
    /**
     * 对象类型名称
     */
    alarmTargetTypeName: string;
    /**
     * 报警阀值
     */
    alarmThreshold?: string;
    /**
     * 报警发生时间
     */
    alarmTime: string;
    /**
     * 类型主键
     */
    alarmTypeId?: number;
    /**
     * 应用编号
     */
    applicationCode: string;
    /**
     * 应用名称
     */
    applicationName: string;
    /**
     * 报警区域
     */
    area: string;
    /**
     * 报警区域名称
     */
    areaName: string;
    /**
     * 业务主键
     */
    businessKey: number;
    /**
     * 业务类型
     */
    businessType: string;
    /**
     * 发送对象
     */
    sendTargetParams?: { userId: number; userName: string }[];
  }): Promise<void> {
    const url = `${baseURL}/sat-alarm-msg/send`;
    await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
  }

  /** 报警总数环比率统计 */
  public async getAlarmStatisticsRingRatioAnalysis(payload: { period: string; type: string; applicationCode?: string }): Promise<{
    /**
     * 报警数量
     */
    alarmNum?: number | null;
    /**
     * 环比率
     */
    ringRatio?: null | string;
    /**
     * 同比率
     */
    sameRatio?: null | string;
  }> {
    const url = `${baseURL}/alarm-statistics/ring-ratio-analysis`;
    const resp = await this.gateway.get<
      LegacyServiceError<{
        /**
         * 报警数量
         */
        alarmNum?: number | null;
        /**
         * 环比率
         */
        ringRatio?: null | string;
        /**
         * 同比率
         */
        sameRatio?: null | string;
      }>
    >({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 报警级别占比 */
  public async getAlarmStatisticsLevel(payload: { period: string; type?: string; applicationCode: string }): Promise<
    {
      alarmNum: number;
      code: string;
      id: string;
      name: string;
      ratio: string;
    }[]
  > {
    const url = `${baseURL}/alarm-statistics/level`;
    const resp = await this.gateway.get<
      LegacyServiceError<
        {
          alarmNum: number;
          code: string;
          id: string;
          name: string;
          ratio: string;
        }[]
      >
    >({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 报警处理分析（员工） */
  public async getAlarmHandleAnalysis(payload: { applicationCode?: string; period: string }): Promise<HandleAnalysis> {
    const url = `${baseURL}/alarm-statistics/user-handler-analysis`;
    const resp = await this.gateway.get<LegacyServiceError<HandleAnalysis>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 报警事件报警分析
  public async getEventAnalysis(payload: { applicationCode: string; period: string }): Promise<EventAnalysis> {
    const url = `${baseURL}/alarm-statistics/event-analysis`;
    const resp = await this.gateway.get<LegacyServiceError<EventAnalysis>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 报警趋势分析
  public async getTrendAnalysis(payload: { applicationCode: string; period: string }): Promise<TrendAnalysis> {
    const url = `${baseURL}/alarm-statistics/trend-analysis`;
    const resp = await this.gateway.get<LegacyServiceError<TrendAnalysis>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 报警区域报警分析
  public async getAreaAnalysis(payload: { applicationCode: string; period: string }): Promise<AreaAnalysis[]> {
    const url = `${baseURL}/alarm-statistics/area-analysis`;
    const resp = await this.gateway.get<LegacyServiceError<AreaAnalysis[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 报警级别处理效率统计
  public async getLevelHandlerEfficiencyAnalysis(payload: {
    applicationCode: string;
    period: string;
    alarmLevelId: string;
  }): Promise<LevelHandlerEfficiencyAnalysis[]> {
    const url = `${baseURL}/alarm-statistics/level-handler-efficiency-analysis`;
    const resp = await this.gateway.get<LegacyServiceError<LevelHandlerEfficiencyAnalysis[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 用户报警处理效率排名倒数前10
  public async getEfficiencyLastTenAnalysis(payload: {
    applicationCode: string;
    period: string;
    alarmLevelId: string;
  }): Promise<EfficiencyTenAnalysis[]> {
    const url = `${baseURL}/alarm-statistics/user-handler-efficiency-last-top-ten-analysis`;
    const resp = await this.gateway.get<LegacyServiceError<EfficiencyTenAnalysis[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 用户报警处理效率排名前10
  public async getEfficiencyTopTenAnalysis(payload: {
    applicationCode: string;
    period: string;
    alarmLevelId: string;
  }): Promise<EfficiencyTenAnalysis[]> {
    const url = `${baseURL}/alarm-statistics/user-handler-efficiency-top-ten-analysis`;
    const resp = await this.gateway.get<LegacyServiceError<EfficiencyTenAnalysis[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 报警事件分类列表总数统计
  public async getEventAlarmStatistics(payload: { applicationCode: string; period: string }): Promise<AlarmEventStatisticsType[]> {
    const url = `${baseURL}/alarm/event-type/statistics`;
    const resp = await this.gateway.create<LegacyServiceError<AlarmEventStatisticsType[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 新增报警记录跟进信息
  public async createAlarmFollow(payload: { id: string; content: string; files: string[] }): Promise<unknown> {
    const url = `${baseURL}/alarm-record/follow-up`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 获取报警记录跟进信息
  public async getAlarmFollowList(payload: { id: string }): Promise<AlarmFollowVo[]> {
    const url = `${baseURL}/alarm-record/${payload.id}/follow-ups`;
    const resp = await this.gateway.get<LegacyServiceError<AlarmFollowVo[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 报警级别播放配置保存
  public async saveAlarmLevelPlayConfig(payload: {
    alarmLevelCode: string;
    file?: string;
    looped?: boolean;
    playNum?: number;
  }): Promise<unknown> {
    const url = `${baseURL}/alarm-level/play-config`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 获取报警级别播放配置集合
  public async getAlarmLevelPlayConfigList(): Promise<AlarmLevelPlayConfigVO[]> {
    const url = `${baseURL}/alarm-level/play-configs`;
    const resp = await this.gateway.get<LegacyServiceError<AlarmLevelPlayConfigVO[]>>({
      url,
    });
    return resp.data || resp;
  }

  // 获取报警级别的播放配置
  public async getAlarmLevelPlayConfig(payload: { alarmLevelCode: string }): Promise<AlarmLevelPlayConfigVO> {
    const url = `${baseURL}/alarm-level/play-config/${payload.alarmLevelCode}`;
    const resp = await this.gateway.get<LegacyServiceError<AlarmLevelPlayConfigVO>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 报警统计 */
  public async getAlarmStatistics(payload: {
    applicationCode?: string;
    period: string;
    alarmTargetTypeId?: string;
    businessType?: string;
    deviceIds?: string[];
    userId?: string;
  }): Promise<AlarmStatisticsVO> {
    const url = `${baseURL}/alarm-statistics`;
    const resp = await this.gateway.get<LegacyServiceError<AlarmStatisticsVO>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 报警类型排名统计 */
  public async getAlarmStatisticsTypeRank(payload: {
    applicationCode?: string;
    period: string;
    businessType?: string;
  }): Promise<AlarmStatisticsTypeRank[]> {
    const url = `${baseURL}/alarm-statistics/type-rank`;
    const resp = await this.gateway.get<LegacyServiceError<AlarmStatisticsTypeRank[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 报警趋势统计 */
  public async getAlarmStatisticsTrend(payload: {
    applicationCode?: string;
    businessType?: string;
    period?: string;
    type?: string;
  }): Promise<AlarmStatisticsTrend[]> {
    const url = `${baseURL}/alarm-statistics/trend`;
    const resp = await this.gateway.get<LegacyServiceError<AlarmStatisticsTrend[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 获取报警记录关联的设备分页列表 */
  public async getAlarmRecordDeviceList(payload: {
    alarmRecordId: string;
    pageNumber: number;
    pageSize: number;
    productId?: string | undefined;
    categoryCode?: string | undefined;
  }): Promise<Pagination<AlarmNearbyDevice>> {
    const url = `${baseURL}/alarm-records/ref/devices`;
    const resp = await this.gateway.get<Pagination<AlarmNearbyDevice>>({ url, payload });
    return resp;
  }

  /** 报警记录-批量删除 */
  public async deleteAlarmRecord(ids: string[]): Promise<void> {
    const url = `${baseURL}/alarm-record/batch-deleted`;
    await this.gateway.custom<LegacyServiceError<unknown>>({ method: "POST", url, payload: { ids } });
  }
  /** 报警状态数量统计 */
  public async getAlarmStatusStatistics(payload?: { areaId?: string; areaLike?: boolean }): Promise<AlarmStaticDTO[]> {
    const url = `${baseURL}/alarm-statistics/status-group`;
    const resp = await this.gateway.get<LegacyServiceError<AlarmStaticDTO[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }
}
