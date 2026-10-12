import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import { CubeSecurityManagementService, type SecurityDeviceRecord } from '@ghcloud/cube-security-management-service'
import { CubeDeviceCenterService } from './device-center.service'

export interface NormDataVO {
  /**
   * 字典编码
   */
  normCode?: string | undefined;
  /**
   * 指标名称
   */
  normName?: string | undefined;
  /**
   * 单位
   */
  unit?: string | undefined;
  value?: string | number | undefined;
}
export type SecurityDeviceMonitorVo = SecurityDeviceRecord & { details: NormDataVO[]; }
/** 设备监测服务 */
export class CubeDeviceMonitorService {
  private readonly gateway: CubeGateway
  private readonly securityManagementService: CubeSecurityManagementService
  private readonly iotService: CubeDeviceCenterService
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
    this.securityManagementService = new CubeSecurityManagementService(auth)
    this.iotService = new CubeDeviceCenterService(auth)
  }

  /** 实时监测 分页 */
  public async getTimePage (payload: {
    applicationCode: string;
    pageSize: number;
    pageNumber: number;
    areaId?: string;
    keyword?: string;
    ids?: string[];
  }): Promise<{ records: SecurityDeviceMonitorVo[]; total: number; pages: number; }> {
    const res = await this.securityManagementService.getSecurityDevicePage(payload)
    const records = res.records.map(e => {
      return {
        ...e,
        areaId: e.areaId.split('-').slice(-1)[0],
      }
    }) as SecurityDeviceMonitorVo[]
    if (records.length === 0) {
      return {
        records: [],
        total: 0,
        pages: 0
      }
    }
    // 设备数据数据处理
    const promises = records.map(async (e, i) => {
      const { productPropVoList, snapshots } = await this.iotService.getNorthDeviceDetail({
        deviceId: e.deviceId,
        withSnapShot: true,
        withPropertySpec: true,
      })
      records[i].details = productPropVoList.map(ele => {
        const details = {
          normCode: ele.propCode ?? '',
          normName: ele.propName ?? '',
          unit: ele.unitName,
          value: '',
        }
        // 设备属性匹配
        snapshots.forEach(item => {
          if (item.key === ele.propCode) {
            details.value = item.value ?? ''
          }
        })
        return details
      })
    })
    await Promise.all(promises)
    return {
      records,
      total: res.total,
      pages: res.pages
    }
  }
}
