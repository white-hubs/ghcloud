import type { LineLossDevice, LineLossTrend, SavedPayload } from "./types";
import { CubeGateway, type CubeAuth } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}/securitymanagement`;

/**
 * Graph Editor 业务服务
 *
 * - 保存节点/连线列表
 * - 加载已保存的节点/连线列表
 */
export class CubeGraphEditorService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /**
   * 保存图编辑数据
   */
  public async saveGraph(payload: SavedPayload): Promise<boolean> {
    const url = `${baseURL}/electricity-supply/save`;
    const resp = await this.gateway.create<boolean>({ url, payload });
    return resp;
  }

  /**
   * 加载图编辑数据
   */
  public async loadGraph(): Promise<SavedPayload> {
    const url = `${baseURL}/electricity-supply/detail`;
    const resp = await this.gateway.get<SavedPayload>({ url });
    return resp;
  }

  /**
   * 生成节点或线ID
   */
  public async getNewId(num: number): Promise<number[]> {
    const url = `${baseURL}/electricity-supply/get-new-id?num=${num}`;
    const resp = await this.gateway.get<number[]>({ url });
    return resp;
  }

  /**
   * 加载线损编辑数据
   */
  public async loadLineGraph(): Promise<SavedPayload> {
    const url = `${baseURL}/lineLoss/supply/detail`;
    const resp = await this.gateway.get<SavedPayload>({ url });
    return resp;
  }

  /**
   * 同步供电关系到线损关系
   */
  public async updateLine(): Promise<boolean> {
    const url = `${baseURL}/lineLoss/supply/sync`;
    const resp = await this.gateway.create<boolean>({ url });
    return resp;
  }
  /**
   * 根据线路 ID 查询线损趋势
   */
  public async getLineLossTrend(payload: { lineId: string; timeRange: string }): Promise<LineLossTrend[]> {
    const url = `${baseURL}/lineLoss/supply/trend`;
    const resp = await this.gateway.get<LineLossTrend[]>({ url, payload });
    return resp;
  }
  /**
   * 根据线路 ID 查询设备信息
   */
  public async getLineLossDevice(payload: { lineId: string }): Promise<LineLossDevice> {
    const url = `${baseURL}/lineLoss/connection/devices`;
    const resp = await this.gateway.get<LineLossDevice>({ url, payload });
    return resp;
  }
  /**
   * 保存线路设备信息
   */
  public async updateLineLossDevice(payload: { id: string; fromDeviceId?: string; toDeviceId?: string }): Promise<boolean> {
    const url = `${baseURL}/lineLoss/supply/edit`;
    const resp = await this.gateway.create<boolean>({ url, payload });
    return resp;
  }
}
