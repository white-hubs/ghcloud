export type RiskLevel = "红" | "橙" | "黄" | "蓝" | "绿" | "灰";

export interface DepotSummary {
  name: string;
  coord: [number, number];
  stock: number;
  level: RiskLevel;
  riskStock: number;
  open: number;
  inTasks: number;
  outTasks: number;
  online: number;
  blink: boolean;
  jobs: string[];
}

export interface RiskEvent {
  level: RiskLevel;
  type: string;
  category: string;
  depot: string;
  position: string;
  tons: string;
  grain: string | null;
  owner: string;
  status: string;
  duration: string;
  overtime: boolean;
}

export interface ConcernBatch {
  depot: string;
  warehouse: string;
  slot: string;
  grain: string;
  tons: string;
  risk: string;
  category: string;
  level: RiskLevel;
  owner: string;
  status: string;
}

export interface WarehouseSummary {
  id: string;
  type: string;
  grain: string;
  level: RiskLevel;
  batch: string;
  batchCount: number;
  maxTemperature: number;
  humidity: number;
  gasStatus: string;
  radarTons: number;
  bookTons: number;
  inspection: string;
  alarm: string | null;
  owner: string;
}

export interface CockpitFilters {
  depot: string;
  grain: string;
  level: string;
}

export interface InventoryItem {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  riskBatches?: number;
}

export interface LifecycleStage {
  name: string;
  count: number;
  tons: string;
  active?: boolean;
}

export interface DetailRisk {
  level: RiskLevel;
  levelText: string;
  type: string;
  warehouse: string;
  tons: string;
  value: string;
  threshold: string;
  duration: string;
  overtime: boolean;
  owner: string;
  status: string;
}

export interface OperationTask {
  category: string;
  title: string;
  detail: string;
  status: string;
  level: RiskLevel;
  blinking?: boolean;
}
