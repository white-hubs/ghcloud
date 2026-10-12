import request from "../service/request";
import { AreaType, ReturnAreaScenePanelConfig, SceneDataType } from "./models/mdata";
const baseURL = '/api/maintain/'

interface RouteList {
num: number;
name:string;
[x: string]: number;
  patrolRouteName: string;
  patrolLocationNumber: string;
}
export interface AddDepTask {
  depName: string;
  depId: string;
  totalTaskNum: string;
  completeTaskNum: string;
  overTimeTaskNum: string;
  expireTaskNum: string;
  taskTotalTime: string;
}

export interface DepTaskExecutionAnalysis {
  maxTaskNumDep: string;
  maxTaskNum: string;
  maxTaskNumRatio: string;
  maxTaskRatioDep: string;
  maxTaskRatio: string;
  maxTaskRatioRatio: string;
  minTaskNumDep: string;
  minTaskNum: string;
  minTaskNumRatio: string;
  minTaskRatioDep: string;
  minTaskRatio: string;
  minTaskRatioRatio: string;
  addDepTask: AddDepTask[];
}
/**
 * @说明 巡更路线
 * @returns
 */
export function routeList<T extends Record<string, any>>(params?: T) {
  return request<RouteList[]>({
      url: baseURL + "patrol/route/list",
      method: "GET",
      params,
  });
}
/**
 * @说明 巡更计划
 * @returns
 */
export function getPalnStatus<T extends Record<string, any>>(params?: T) {
  return request<RouteList[]>({
      url: baseURL + "electron/getPalnStatus",
      method: "GET",
      params,
  });
}
/**
 * @说明 巡更点异常top5统计
 * @returns
 */
export function locationList<T extends Record<string, any>>(params?: T) {
  return request<RouteList[]>({
      url: baseURL + "electron/statistics/location/list",
      method: "GET",
      params,
  });
}
/**
 * @说明 巡更设备分页查询
 * @returns
 */
export function devicePage<T extends Record<string, any>>(params?: T) {
  return request<RouteList[]>({
      url: baseURL + "patrol/device/page",
      method: "GET",
      params,
  });
}
/**
 * @说明 巡更设备状态统计

 * @returns
 */
export function statusStat<T extends Record<string, any>>(params?: T) {
  return request<RouteList[]>({
      url: baseURL + "electron/device/status/stat",
      method: "GET",
      params,
  });
}
/**
 * @说明 巡更报警分页查询

 * @returns
 */
export function alarmPage<T extends Record<string, any>>(params?: T) {
  return request<RouteList[]>({
      url: baseURL + "patrol/alarm/page",
      method: "GET",
      params,
  });
}
/**
 * @说明 巡更点漏巡次数统计

 * @returns
 */
export function leakStat<T extends Record<string, any>>(params?: T) {
  return request<RouteList[]>({
      url: baseURL + "/electron/location/leak/stat",
      method: "GET",
      params,
  });
}
/**
 * @说明 任务执行分析

 * @returns
 */
export function depTaskExecutionAnalysis<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/inspection-analysis/taskExecutionAnalysis",
      method: "GET",
      params,
  });
}
/**
 * 巡更点漏巡
 */

export function TaskMissing<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/electron/task/location/missing",
    });
  }  
 /* @说明 隐患处理率

 * @returns
 */
export function handleRatio<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/hidden/handle/ratio",
      method: "GET",
      params,
  });
}
/**
 * 巡更点异常
 */
export function TaskAbnormal<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/electron/task/location/abnormal",
    });
  }
 /* @说明 巡检任务完成率
 * @returns
 */
export function finishedRatio<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/inspect/task/finished/ratio",
      method: "GET",
      params,
  });
}
/**
 * 巡更路线统计
 */
export function TaskRoute<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/electron/location/route",
      method: "GET",
      params,
    });
  }
/**
 * 巡更任务完成率统计
 */
export function completionRate<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/patrol/task/completion-rate",
      method: "GET",
      params,
  });
}
/**
 * 异常top5
 */
export function TaskAbnormalTop<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/electron/abnormal/top",
      method: "GET",
      params,
    });
  }
/**
 * 小散工程数量统计
 */
export function projectNumStatistics<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: "/api/loose-works/project/num/statistics",
      method: "GET",
      params,
  });
}
/**
 * 巡更任务汇总统计
 */
export function TaskStatistics<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/patrol/task/summary-statistics",
    });
  }
 /* @说明 小散工程趋势统计

 * @returns
 */
export function projectTrendStatistics<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: "/api/loose-works/project/trend/statistics",
      method: "GET",
      params,
  });
}
/**
 * 巡检任务数统计
 */
export function insTaskCountStat<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/inspect/task/total/statistics",
      params
    });
  }
 /* @说明 小散工程监管列表

 * @returns
 */
export function projectScheduleList<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: "/api/loose-works/project/schedule/list",
      method: "GET",
      params,
  });
}
/**
 * 巡检任务统计
 * @param params 
 * @returns 
 */
export function insTaskStat<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/inspect/task/dep/statistics",
      params
    });
  }
 /* @说明 隐患数量统计
 * @returns
 */
export function hiddenNumStatistics<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/hidden/num/statistics",
      method: "GET",
      params,
  });
}
/**
 * @说明 隐患分类统计
 * @returns
 */
export function hiddenTypeStatistics<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/hidden/type/statistics",
      method: "GET",
      params,
  });
}
/**
 * @说明 隐患单列表
 * @returns
 */
export function hiddenApplyPersonal<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/hidden/apply/personal",
      method: "GET",
      params,
  });
}
/**
 * @说明 巡检任务列表
 * @returns
 */
export function inspectTaskPageV2<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/inspect-task/pageV2",
      method: "GET",
      params,
  });
}
/**
 * @说明 巡更点分布情况
 * @returns
 */
export function electronArea<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/electron/location/area",
      method: "GET",
      params,
  });
}
/**
 * @说明 任务异常记录数统计
 * @returns
 */
export function taskAbnormalNum<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/patrol/task/abnormal/num",
      method: "GET",
      params,
  });
}
/**
 * @说明 任务异常记录
 * @returns
 */
export function taskAbnormalList<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/patrol/task/abnormal/list",
      method: "GET",
      params,
  });
}
/**
 * @说明 巡更任务巡更点异常占比
 * @returns
 */
export function electronTaskAbnormal<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/electron/task/location/abnormal",
      method: "GET",
      params,
  });
}
/**
 * @说明 根据ID查询巡更任务
 * @returns
 */
export function electronTask<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + `/electron/task/${params.id}`,
      method: "GET",
      params,
  });
}
/**
 * @说明 根据ID查询巡更任务
 * @returns
 */
export function getPatrolTaskByTime<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + `/electron/task/location`,
      method: "GET",
      params,
  });
}