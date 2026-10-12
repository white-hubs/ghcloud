import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { RefreshNativeBusiness } from "@ghcloud/cube-app-js-sdk/src/js/cube-app.service";

/**
 * 通知宿主 APP 重新拉取日常巡检离线快照。
 *
 * 任务接收已经由服务端确认成功，桥接通知属于本地缓存刷新补偿；即使
 * 当前运行在浏览器或宿主桥接暂不可用，也不能让任务接收被误报为失败。
 */
export const refreshNativePatrolInspectOfflineData = async (): Promise<void> => {
  try {
    await cubeAppService.refreshNativeData(RefreshNativeBusiness.PATROL_INSPECT_REFRESH_OFFLINE_DATA);
  } catch {
    // 非 APP 环境或桥接暂不可用时忽略，APP 后续启动同步仍会完成补偿。
  }
};
