import {
  DevicePageInfoVO,
  TrafficDetectionAreaListStatVO,
  TrafficDetectionAreaMonitorVO,
  TrafficDetectionAreaPersonFlowRankVOList,
  TrafficDetectionAreaTrendStatVO,
  TrafficDetectionAreaVisualVO,
  TrafficDetectionDeviceStatVO,
  TrafficDetectionPersonFlowSummaryVO,
  TrafficDetectionPersonTotalStatVO,
  TrafficDetectionTrendStatVO,
} from "./type";
import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API, PageResultState } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}/traffic-detection`;

export class CubeTrafficStatisticsService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 人流量数 */
  public async getTrafficPersonStatistics(payload?: {
    type?: string;
    period?: string;
    trafficDetectionAreaIds?: string[];
  }): Promise<TrafficDetectionPersonTotalStatVO> {
    const url = `${baseURL}/traffic-detection-areas/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<TrafficDetectionPersonTotalStatVO>>({ url, payload });
    return resp.data || resp;
  }

  /** 各区域人流量 */
  public async getTrafficAreaListStat(payload?: {
    type?: string;
    period?: string;
    trafficDetectionAreaIds?: string[];
  }): Promise<TrafficDetectionAreaListStatVO[]> {
    const url = `${baseURL}/traffic-detection-areas/statistics/areas`;
    const resp = await this.gateway.get<LegacyServiceError<TrafficDetectionAreaListStatVO[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 人流量趋势 */
  public async getTrafficTrendStat(payload?: {
    type?: string;
    period?: string;
    trafficDetectionAreaIds?: string[];
  }): Promise<TrafficDetectionTrendStatVO[]> {
    const url = `${baseURL}/traffic-detection-areas/statistics/trend`;
    const resp = await this.gateway.get<LegacyServiceError<TrafficDetectionTrendStatVO[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 区域人流统计趋势列表 */
  public async getTrafficAreaStatisticsTrend(payload?: {
    type?: string;
    period?: string;
    trafficDetectionAreaIds?: string[];
  }): Promise<TrafficDetectionAreaTrendStatVO[]> {
    const url = `${baseURL}/traffic-detection-areas/statistics/areas/trend`;
    const resp = await this.gateway.get<LegacyServiceError<TrafficDetectionAreaTrendStatVO[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 人流统计汇总 */
  public async getTrafficAreaPersonFlowSummary(payload?: {
    type?: string;
    period?: string;
    granularity?: string;
    sortField?: string;
  }): Promise<TrafficDetectionPersonFlowSummaryVO> {
    const url = `${baseURL}/traffic-detection-areas/statistics/person-flow/summary`;
    const resp = await this.gateway.get<LegacyServiceError<TrafficDetectionPersonFlowSummaryVO>>({ url, payload });
    return resp.data || resp;
  }

  /** 区域人流排行 */
  public async getTrafficAreaPersonFlowAreaRank(payload?: {
    type?: string;
    period?: string;
    granularity?: string;
    sortField?: string;
  }): Promise<TrafficDetectionAreaPersonFlowRankVOList> {
    const url = `${baseURL}/traffic-detection-areas/statistics/person-flow/area-rank`;
    const resp = await this.gateway.get<LegacyServiceError<TrafficDetectionAreaPersonFlowRankVOList>>({ url, payload });
    return resp.data || resp;
  }

  /** 流量检测设备统计列表 */
  public async getTrafficDeviceStat(payload?: {
    type?: string;
    period?: string;
    trafficDetectionAreaIds?: (string | number)[];
  }): Promise<TrafficDetectionDeviceStatVO[]> {
    const url = `${baseURL}/traffic-detection-areas/statistics/devices`;
    const resp = await this.gateway.get<LegacyServiceError<TrafficDetectionDeviceStatVO[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 获取人流监控信息列表 */
  public async getTrafficMonitorDevices(): Promise<TrafficDetectionAreaMonitorVO[]> {
    const url = `${baseURL}/traffic-detection-areas/monitor-devices`;
    const resp = await this.gateway.get<LegacyServiceError<TrafficDetectionAreaMonitorVO[]>>({ url });
    return resp.data || resp;
  }

  /** 获取人流区域设备配置列表 */
  public async getTrafficDevicesById(
    id: string | number,
    payload: {
      anyAreaId?: number;
      anyMatchedAreaId?: string;
      anyMatchedDepartmentId?: number;
      categoryCode?: string;
      deviceState?: boolean;
      filterAreaIds?: string[];
      keyword?: string;
      matchedDeviceIds?: string[];
      pageNumber: number;
      pageSize: number;
      productId?: number;
    },
  ): Promise<PageResultState<DevicePageInfoVO>> {
    const url = `${baseURL}/traffic-detection-areas/${id}/devices/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResultState<DevicePageInfoVO>>>({ url, payload });
    return resp.data || resp;
  }

  /** 获取人流视角配置信息 */
  public async getTrafficViewConfig(id: string | number): Promise<TrafficDetectionAreaVisualVO> {
    const url = `${baseURL}/traffic-detection-areas/${id}/view-config`;
    const resp = await this.gateway.get<LegacyServiceError<TrafficDetectionAreaVisualVO>>({ url });
    return resp.data || resp;
  }
}
