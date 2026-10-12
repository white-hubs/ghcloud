export type PestRangeKey = '7d' | '30d' | '90d'

export interface PestWarehouseOption {
  label: string
  value: string
}

export interface PestSummaryCard {
  label: string
  value: string
  subText: string
  tone: 'danger' | 'warning'
  /** 主数值前的趋势箭头：上升绿色、下降红色 */
  trend?: 'up' | 'down'
}

export interface PestTrendPoint {
  date: string
  dailyCount: number
  movingAverage: number
  warningLine: number
  dangerLine: number
  exceeded: boolean
}

export interface PestWarehouseStatus {
  warehouse: string
  grainType: string
  trapCount: number
  weeklyCount: number | null
  dominantSpecies: string
  densityLevel: '重度' | '中度' | '轻度' | '未部署'
  risk: 'high' | 'medium' | 'low' | 'none'
}

export interface PestSpeciesShare {
  name: string
  value: number
  color: string
}

export interface PestTrendMockData {
  updatedAt: string
  warehouseOptions: PestWarehouseOption[]
  currentWarehouse: string
  summaryCards: PestSummaryCard[]
  trendPoints: Record<PestRangeKey, PestTrendPoint[]>
  warehouseStatuses: PestWarehouseStatus[]
  speciesShares: PestSpeciesShare[]
}

const buildTrendPoint = (date: string, dailyCount: number, movingAverage: number, exceeded = false): PestTrendPoint => ({
  date,
  dailyCount,
  movingAverage,
  warningLine: 20,
  dangerLine: 50,
  exceeded,
})

export const PEST_TREND_MOCK: PestTrendMockData = {
  updatedAt: '2026-04-28 14:30',
  currentWarehouse: 'A12',
  warehouseOptions: [
    { label: 'A12号仓', value: 'A12' },
    { label: 'A08号仓', value: 'A08' },
    { label: 'A03号仓', value: 'A03' },
    { label: 'A15号仓', value: 'A15' },
  ],
  summaryCards: [
    { label: '本周总捕获数', value: '126头', subText: '较上周 +23%', tone: 'danger' },
    { label: '优势虫害种类', value: '玉米虫', subText: '占比 58%，需关注', tone: 'warning' },
    { label: '高风险仓库', value: 'A12号仓', subText: '日均捕获 29头，密度重度', tone: 'danger' },
    { label: '密度趋势', value: '上升中', subText: '对比上周上升 18%', tone: 'warning', trend: 'up' },
  ],
  trendPoints: {
    '7d': [
      buildTrendPoint('4/22', 13, 15),
      buildTrendPoint('4/23', 17, 19),
      buildTrendPoint('4/24', 19, 21),
      buildTrendPoint('4/25', 15, 17),
      buildTrendPoint('4/26', 11, 13),
      buildTrendPoint('4/27', 21, 23, true),
      buildTrendPoint('4/28', 13, 15),
    ],
    '30d': [
      buildTrendPoint('3/30', 8, 10),
      buildTrendPoint('4/03', 11, 13),
      buildTrendPoint('4/07', 14, 16),
      buildTrendPoint('4/11', 17, 18),
      buildTrendPoint('4/15', 18, 19),
      buildTrendPoint('4/19', 16, 17),
      buildTrendPoint('4/23', 17, 19),
      buildTrendPoint('4/28', 13, 15),
    ],
    '90d': [
      buildTrendPoint('1月', 5, 6),
      buildTrendPoint('2月', 7, 8),
      buildTrendPoint('3月', 12, 13),
      buildTrendPoint('4月', 18, 20),
    ],
  },
  warehouseStatuses: [
    { warehouse: 'A12', grainType: '玉米', trapCount: 4, weeklyCount: 58, dominantSpecies: '玉米虫', densityLevel: '重度', risk: 'high' },
    { warehouse: 'A08', grainType: '小麦', trapCount: 4, weeklyCount: 32, dominantSpecies: '赤拟谷盗', densityLevel: '中度', risk: 'medium' },
    { warehouse: 'A03', grainType: '稻谷', trapCount: 4, weeklyCount: 8, dominantSpecies: '—', densityLevel: '轻度', risk: 'low' },
    { warehouse: 'A15', grainType: '大豆', trapCount: 0, weeklyCount: null, dominantSpecies: '—', densityLevel: '未部署', risk: 'none' },
  ],
  speciesShares: [
    { name: '玉米虫', value: 58, color: '#8f470d' },
    { name: '赤拟谷盗', value: 25, color: '#ff4d4f' },
    { name: '麦蛾', value: 12, color: '#f6b11a' },
    { name: '其他', value: 5, color: '#8c8c8c' },
  ],
}
