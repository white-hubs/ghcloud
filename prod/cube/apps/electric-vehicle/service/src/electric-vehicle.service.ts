import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { PageResult } from './types'

const baseURL = `${BASE_API}/property`
export interface ElectronMobile {
  id: number;
  serialNumber: number;
  name: string;
  typeCode: number;
  typeName:string;
  areaId: number;
  areaName: string;
  stallId: number;
  stallName: string;
  sitePointId:number;
  sitePointName: string;
  attribute:string;
  number: number;
  maintenanceDepId: number;
  maintenanceDepName: string;
  status:string;
  files:  {
      id: number;
      name: string;
      suffix: string;
      path:string;
      size:number;
      refCount: number;
      type: string;
      businessKey: number;
    }[]
  ,
  remarks:string;
  receiveDepId: number;
  receiveDepName:string;
  receiveUserName:string;
  level: number;
  receiveUserPhone: string;
  usageDate: string;
  updateTime: string;
  partsDetails:  {
      id: number;
      code: string;
      name: string;
      expireDate:string;
      remarks: string;
    }[]
}
export class CubeElectricVehicleService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 获取风险源电动车分页列表
  public async genElectronMobilePage (payload: {
    pageNumber: number;
    pageSize: number;
    total: number;
    keyword: string | undefined;
    electronMobileType: string | undefined;
    maintenanceDepId: string | undefined;
    areaId: string | undefined;
  }): Promise<PageResult<ElectronMobile>> {
    const url = `${baseURL}/risk/source/ledger/electron-mobile/page`
    return await this.gateway.get<PageResult<ElectronMobile>>({ url, payload })
    
  }

  // 下载风险源电动车导入模板
  public async downloadElectronMobileTemplate (): Promise<Blob> {
    const url = `${baseURL}/risk/source/ledger/electron-mobile/getTemplateExcel`
    return await this.gateway.customBlob({ method: 'GET', url })
  }
  // 电动车风险源导入
  public async importElectronMobile (payload: Record<string, FormData>): Promise<void> {
    const url = `${baseURL}/risk/source/ledger/electron-mobile/import/template`
    await this.gateway.create({ url, payload })
  }
  //电动车统计分页
  public async genElectronMobileStatPage (payload: {
    pageNumber: number;
    pageSize: number;
    total: number;
    keyword: string | undefined;
    electronMobileType: string | undefined;
    areaId: string | undefined;
  }): Promise<PageResult<ElectronMobile>> {
    const url = `${baseURL}/risk/source/ledger/electron-mobile/stat/page`
    return await this.gateway.get<PageResult<ElectronMobile>>({ url, payload })
    
  }

  public async safetyStatRecordPage (payload: {
    pageNumber: number;
    pageSize: number;
    targetId?: string;
  }): Promise<PageResult<unknown>> {
    const url = `/api/maintain/inspect-record/error-page`
    const resp = await this.gateway.get<PageResult<unknown>>({
      url,
      payload
    })
    return resp
  }

}
