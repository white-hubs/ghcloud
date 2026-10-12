import { request } from '@/service'

/**
 * 调整日志等级请求参数
 */
export interface UpdateLogLevelParams {
  /** 网关 ID */
  gwId: string;
  /** 目标日志等级 (DEBUG, INFO, WARN, ERROR) */
  level: string;
  /** 持续时长(分钟)，默认 120。0 表示不自动回退 */
  duration?: number;
}

/**
 * 日志记录器信息
 */
export interface LoggerInfo {
  /** Logger 名称 (通常是包名) */
  name: string;
  /** 当前生效的日志等级 */
  level: string;
  /** 关联的网关 ID */
  gwId?: string;
  /** 是否处于自动回退倒计时中 */
  isReverting: boolean;
  /** 距离自动回退的剩余秒数 */
  remainingSeconds: number;
  /** 是否已挂载 GW_SIFT */
  isAttached: boolean;
}

/**
 * 修改日志等级
 */
export const updateLogLevel = async (data: UpdateLogLevelParams): Promise<Service.RequestResult> => {
  return request.post('/systemLog/updateLevel', data)
}

/**
 * 获取日志列表
 */
export const getSystemLogList = async (): Promise<Service.RequestResult<LoggerInfo[]>> => {
  return request.get('/systemLog/list')
}
