declare namespace EnergyOverview {
  interface energyConsumptionTrendTypeJK {
    instrumentType: string
    nowReadeTime: string
    timeFlag: number
    value: number
  }
  interface consumptionRankingType {
    routeId: string
    routeName: string
    time: string
    value: number
    areaName:string
  }
  interface SankeyType {
    areaName: string
    children: string
    id: string
    instrumentType: string
    parentId: string
    remark: string
    sequence: string
    tenant: number
    value: number
  }

}
