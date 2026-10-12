declare global {
  interface Window {
    receiveScanResult?: (data: any) => void;
  }
}

// TODO
export interface DeviceRecord {
  id: string;
  code: string;
  name: string;
  status?: string;
  statusName?: string;
  level?: string;
  levelName?: string;
  waterCapacity?: number;
  waterUsage?: number;
  address?: string;
  handlerName?: string;
}
export interface CommandRecord {
  id: string;
  name: string;  // 命令名称，如"日常消杀"
  time?: string; // 执行时间，如"当上午8点整时"
  action: string; // 执行动作，如"执行打开蚊器设备"
  type: 'daily' | 'scheduled'; // 命令类型：日常或定时
}
export interface ScanResult {
  success: boolean;
  result?: string;
  error?: unknown;
}