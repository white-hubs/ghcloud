export interface StatisticalOverviewMetric {
  key: string
  label: string
  /** 数字部分（可含千分位） */
  value: string
  /** 单位：单独渲染为小字号；为空则只展示 value */
  unit?: string
}

export interface WarehouseUsageItem {
  id: string
  name: string
  grainName: string
  usedWeight: string
  usageRate: number
}

export interface GrainCategoryItem {
  key: string
  name: string
  weight: number
  ratio: number
  color: string
}

/** 粮食类别环形图中心文案（无类别数据时用占位） */
export interface GrainCategoryCenterDisplay {
  value: string
  unit: string
}

export interface AlarmSummaryItem {
  key: string
  label: string
  value: number
  tone: 'safe' | 'warning' | 'danger'
}

export interface AlarmEventItem {
  id: string
  time: string
  warehouse: string
  device: string
  event: string
  level: '高' | '中' | '低'
}

/** 无列表数据时界面统一展示的占位文案 */
export const STATISTICAL_PANEL_DATA_PLACEHOLDER = '--'

/** 仓库使用分析、告警列表等列表为空时的提示 */
export const STATISTICAL_PANEL_EMPTY_LIST_MESSAGE = '暂无数据'

/** 原粮/原油明细（吨）：用于推算概览中「设计库容」「实时库存」万吨展示 */
const RAW_GRAIN_DESIGN_TONS = 210_150
const RAW_GRAIN_ACTUAL_TONS = 80_918.688

const OVERVIEW_DESIGN_CAPACITY_10K_TONS = (RAW_GRAIN_DESIGN_TONS) / 10_000
const OVERVIEW_REAL_TIME_STORAGE_10K_TONS = (RAW_GRAIN_ACTUAL_TONS) / 10_000

export const STATISTICAL_PANEL_MOCK = {
  overviewMetrics: [
    /** 对应明细「原粮 · 总仓房数」 */
    { key: 'warehouse-count', label: '粮仓数量', value: '48', unit: '座' },
    /** 原粮 + 原油设计仓容（吨）换算为万吨 */
    {
      key: 'design-capacity',
      label: '设计库容',
      value: OVERVIEW_DESIGN_CAPACITY_10K_TONS.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      }),
      unit: '万吨',
    },
    /** 原粮 + 原油实际储量（吨）换算为万吨 */
    {
      key: 'real-time-storage',
      label: '实时库存',
      value: OVERVIEW_REAL_TIME_STORAGE_10K_TONS.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      }),
      unit: '万吨',
    },
    /** 明细无对应项，沿用展示用假数据 */
    { key: 'online-rate', label: '仓库在线率', value: '100', unit: '%' },
    { key: 'abnormal-count', label: '异常仓数量', value: '1', unit: '' },
    { key: 'safe-rate', label: '设备在线率', value: '100', unit: '%' },
  ] as StatisticalOverviewMetric[],
  warehouseUsageList: [] as WarehouseUsageItem[],
  grainCategoryList: [] as GrainCategoryItem[],
  grainCategoryCenter: {
    value: '--',
    unit: '',
  } as GrainCategoryCenterDisplay,
  alarmTotal: 0,
  alarmSummaryList: [] as AlarmSummaryItem[],
  alarmEvents: [] as AlarmEventItem[],
}
