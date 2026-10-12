export type InventoryLossRangeKey = '30d' | '90d' | '1y' | 'all'

export interface InventoryLossSelectOption {
  label: string
  value: string
}

export interface InventoryLossSummaryCard {
  label: string
  value: string
  unit?: string
  tone: 'warning' | 'danger'
}

export interface InventoryLossTrendPoint {
  month: string
  monthlyLoss: number
  lossRate: number
  cumulativeLoss: number
  targetRate: number
  status: 'normal' | 'warning' | 'exceeded'
}

export interface InventoryLossDetailRow {
  warehouse: string
  grainType: string
  inboundTime: string
  inboundWeight: number
  currentWeight: number
  cumulativeLoss: number
  lossRate: number
  exceeded: boolean
  risk: 'high' | 'medium' | 'low'
}

export interface InventoryLossTypeShare {
  name: string
  value: number
  color: string
}

export interface InventoryLossMockData {
  updatedAt: string
  warehouseOptions: InventoryLossSelectOption[]
  batchOptions: InventoryLossSelectOption[]
  currentWarehouse: string
  currentBatch: string
  summaryCards: InventoryLossSummaryCard[]
  trendPoints: Record<InventoryLossRangeKey, InventoryLossTrendPoint[]>
  detailRows: InventoryLossDetailRow[]
  typeShares: InventoryLossTypeShare[]
}

const trendPoint = (
  month: string,
  monthlyLoss: number,
  lossRate: number,
  cumulativeLoss: number,
  status: InventoryLossTrendPoint['status'],
): InventoryLossTrendPoint => ({
  month,
  monthlyLoss,
  lossRate,
  cumulativeLoss,
  targetRate: 1.5,
  status,
})

export const INVENTORY_LOSS_MOCK: InventoryLossMockData = {
  updatedAt: '2026-04-28',
  currentWarehouse: 'A12',
  currentBatch: '2025-06',
  warehouseOptions: [
    { label: 'A12号仓', value: 'A12' },
    { label: 'A08号仓', value: 'A08' },
    { label: 'A03号仓', value: 'A03' },
    { label: 'A15号仓', value: 'A15' },
  ],
  batchOptions: [
    { label: '2025-06入库', value: '2025-06' },
    { label: '2025-09入库', value: '2025-09' },
    { label: '2024-10入库', value: '2024-10' },
    { label: '2025-03入库', value: '2025-03' },
  ],
  summaryCards: [
    { label: '累计损耗', value: '1,280', unit: 'kg', tone: 'warning' },
    { label: '损耗率', value: '1.8', unit: '%', tone: 'warning' },
    { label: '损耗类型', value: '水分损耗', tone: 'warning' },
    { label: '超标状态', value: '1', unit: '个仓房超标', tone: 'danger' },
  ],
  trendPoints: {
    '30d': [
      trendPoint('6月', 620, 1.24, 620, 'exceeded'),
      trendPoint('7月', 760, 1.52, 760, 'exceeded'),
      trendPoint('8月', 540, 1.08, 540, 'warning'),
      trendPoint('9月', 480, 0.96, 480, 'warning'),
      trendPoint('10月', 390, 0.78, 390, 'normal'),
    ],
    '90d': [
      trendPoint('4月', 430, 0.86, 430, 'warning'),
      trendPoint('5月', 520, 1.04, 520, 'warning'),
      trendPoint('6月', 620, 1.24, 620, 'exceeded'),
      trendPoint('7月', 760, 1.52, 760, 'exceeded'),
      trendPoint('8月', 540, 1.08, 540, 'warning'),
      trendPoint('9月', 480, 0.96, 480, 'warning'),
      trendPoint('10月', 390, 0.78, 390, 'normal'),
    ],
    '1y': [
      trendPoint('1月', 200, 0.4, 200, 'normal'),
      trendPoint('2月', 300, 0.6, 300, 'normal'),
      trendPoint('3月', 400, 0.8, 400, 'normal'),
      trendPoint('4月', 430, 0.86, 430, 'warning'),
      trendPoint('5月', 520, 1.04, 520, 'warning'),
      trendPoint('6月', 620, 1.24, 620, 'exceeded'),
      trendPoint('7月', 760, 1.52, 760, 'exceeded'),
      trendPoint('8月', 540, 1.08, 540, 'warning'),
      trendPoint('9月', 480, 0.96, 480, 'warning'),
      trendPoint('10月', 390, 0.78, 390, 'normal'),
    ],
    all: [
      trendPoint('2024-Q4', 360, 0.72, 360, 'normal'),
      trendPoint('2025-Q1', 900, 1.8, 900, 'exceeded'),
      trendPoint('2025-Q2', 1550, 3.1, 1550, 'exceeded'),
      trendPoint('2025-Q3', 1780, 3.56, 1780, 'exceeded'),
      trendPoint('2025-Q4', 870, 1.74, 870, 'warning'),
    ],
  },
  detailRows: [
    { warehouse: 'A12', grainType: '玉米', inboundTime: '2025-06', inboundWeight: 500, currentWeight: 491, cumulativeLoss: 9, lossRate: 1.8, exceeded: true, risk: 'high' },
    { warehouse: 'A08', grainType: '小麦', inboundTime: '2025-09', inboundWeight: 600, currentWeight: 593.4, cumulativeLoss: 6.6, lossRate: 1.1, exceeded: false, risk: 'low' },
    { warehouse: 'A03', grainType: '稻谷', inboundTime: '2024-10', inboundWeight: 450, currentWeight: 445.5, cumulativeLoss: 4.5, lossRate: 1.0, exceeded: false, risk: 'low' },
    { warehouse: 'A15', grainType: '大豆', inboundTime: '2025-03', inboundWeight: 300, currentWeight: 296.7, cumulativeLoss: 3.3, lossRate: 1.1, exceeded: false, risk: 'medium' },
  ],
  typeShares: [
    { name: '水分损耗', value: 52, color: '#1890ff' },
    { name: '自然损耗', value: 30, color: '#52c41a' },
    { name: '虫害损耗', value: 13, color: '#f6a400' },
    { name: '其他损耗', value: 5, color: '#8c8c8c' },
  ],
}
