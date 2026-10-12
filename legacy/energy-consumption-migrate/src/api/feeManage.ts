import { request, service } from '@/service/index'
const baseURL = "/energymanagement";
enum URL {
  setFeeControl = '/energy-charge-config',
  areaControl = '/area-project/tree',
  energyChargeControl = '/energy-charge',
  expenses='/comprehensive-expenses'
}
export enum chargeTypeE {
  fpg = 'FPG', // 复合收费
  jtj = 'JTJ', // 阶梯收费
}
export enum instrumentTypeE {
  WATER = 'water_meter',
  ELECTRIC = 'electricity_meter',
  GAS = 'gas_meter',
}
// 收费配置保存
interface FeeConfigState {
  instrumentType?: string | null // water_meter（水）electricity_meter（电）gas_meter（气）
  chargeType?: string | null // FPG（复合收费） JTJ（阶梯收费）
  periodPrices?: Fee.PeriodDefinesState[]
  periodDefines?: Fee.PeriodDefinesState[]
  usagePrices?: Fee.UsagePricesState[]
}

// 收费配置保存
export const saveChargeConfig = async (params: FeeConfigState): Promise<Service.RequestResult> => {
  return request.post(baseURL+URL.setFeeControl, params)
}
// 收费配置查询
export const getChargeConfig =
  async (params: { instrumentType: string }): Promise<Service.RequestResult<FeeConfigState>> => {
    return request.get(baseURL+URL.setFeeControl, {
      params,
    })
  }
// 区域分项树
export const getAreaTree =
  async (params: { instrumentType: string; areaName?: string }): Promise<Service.RequestResult> => {
    return request.get(baseURL+URL.areaControl, {
      params,
    })
  }
// 区域费用统计环比
export const getChargeAreaQoq =
  async (params: {filterFlag:string, treeIds: [], instrumentType: string; areaIds: number | string; timeFlag?: string ,period:string}):
    Promise<Service.RequestResult> => {
    return request.post(baseURL+'/area-comprehensive-expenses',
      params,
    )
  }
// 费用趋势统计 峰平谷
export const getChargeTrend =
  async (params: { treeIds: [], instrumentType: string; areaIds?: number | string; timeFlag?: string; period: string,  filterFlag:string }):
    Promise<Service.RequestResult<Fee.ChargeTrendState>> => {
    return request.post(baseURL+'/area-comprehensive-trend',
      params,
    )
  }
export const getChargeTrend1 =
  async (params: { instrumentType: string; areaIds?: number | string; timeType?: string; period: string }):
    Promise<Service.RequestResult<Fee.ChargeTrendState>> => {
    return request.get(baseURL+URL.energyChargeControl + '/trend', { params: { ...params } }
    )
  }
// 区域费用统计
export const getChargeArea =
  async (params: { treeIds: [], instrumentType: string; areaIds: number | string; timeFlag?: string,filterFlag:string }):
    Promise<Service.RequestResult> => {
    return request.post(baseURL+'/area-comprehensive-detail',
      params)
  }
// 区域费用统计 导出
export const areaExcel = async (data: {
  treeIds: [], instrumentType: string; areaIds: number | string; timeFlag?: string,filterFlag:string,period:string
}): Promise<Service.RequestResult> => {
  return service.post(`/api${baseURL}/area-comprehensive-detail/excel`, data)
}

export const getChargeAreaTotal =
  async (params: { instrumentType: string; areaIds?: number | string; timeType?: string; period: string }):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+'/area-comprehensive-trend', {
      params,
    })
  }

// 按照能耗类型统计费用
export const getTypeAmount =
  async (params: { timeType: string; period: string }):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+URL.energyChargeControl + '/type/amount', {
      params,
    })
  }

// 基于峰平谷的总费用趋势
export const getTrendByfpg =
  async (params: {  timeFlag?: string; period: string }):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+'/comprehensive-expenses-trend', {
      params,
    })
  }

// 峰平谷或阶梯价费用环比
export const getFpgAmoutQoq =
  async (params: { instrumentType: string; timeType?: string }):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+URL.energyChargeControl + '/fpgAmout/qoq', {
      params,
    })
  }

// 按照类型统计费用（带同比环比）
export const getAmountWithRatio =
  async (params: { timeFlag?: string,period:string }):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+URL.expenses , {
      params,
    })
  }
// 计费规则分页列表
export const getEnergyChargeRules =
  async (params: any):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+'/energy-charge-rules/page' , {
      params,
    })
  }
//删除计费规则
export const deleteEnergyChargeRules =
  async (params: any):
    Promise<Service.RequestResult> => {
    return request.delete(baseURL+'/energy-charge-rules/remove',{params} )
  }
//新增计费规则
export const addEnergyChargeRules =
  async (params: any):
    Promise<Service.RequestResult> => {
    return request.post(baseURL+'/energy-charge-rules/add',params )
  }
//编辑计费规则
export const editEnergyChargeRules =
  async (params: any):
    Promise<Service.RequestResult> => {
    return request.post(baseURL+'/energy-charge-rules/edit',params )
  }
//总费用报表分页
export const getEnergyReportTotal =
  async (params: any):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+'/energy/report/total/page' , {
      params,
    })
  }
  //电费报表分页
export const getEnergyReportElectricity =
async (params: any):
  Promise<Service.RequestResult> => {
  return request.get(baseURL+'/energy/report/electricity/page' , {
    params,
  })
}
//水/气费报表分页
export const getEnergyReportOther =
  async (params: any):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+'/energy/report/typeOther/page' , {
      params,
    })
  }
//总费用报表导出
export const exportReportTotal =
  async (params: { period: string;  }):
    Promise<Service.RequestResult> => {
    return service.get(`/api${baseURL}/energy/report/total/import`, {
      params,
    })
  }
//电费报表导出
export const exportReportElectric =
  async (params: { period: string;  }):
    Promise<Service.RequestResult> => {
    return service.get(`/api${baseURL}/energy/report/electricity/import`, {
      params,
    })
  }
//水/气费报表分页
export const exportReportOther =
  async (params: { period: string; instrumentTypeList:string }):
    Promise<Service.RequestResult> => {
    return service.get(`/api${baseURL}/energy/report/typeOther/import`, {
      params,
    })
  }
//综合费用
export const getComprehensiveRatioCost =
  async (params: any):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+'/energy/report/comprehensiveRatioCost' , {
      params,
    })
  }
//费用趋势
export const getReportChargeTrend =
  async (params: any):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+'/energy/report/chargeTrend' , {
      params,
    })
  }
//费用占比
export const getReportPieChart =
  async (params: any):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+'/energy/report/pieChart' , {
      params,
    })
  }
//分类费用分布
export const getChargeBathTrend =
  async (params: any):
    Promise<Service.RequestResult> => {
    return request.get(baseURL+'/energy/report/chargeBathTrend' , {
      params,
    })
  }