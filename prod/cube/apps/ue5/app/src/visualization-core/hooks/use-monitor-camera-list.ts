import { shallowRef, type ShallowRef } from "vue";

import { getDataDictionaryByItem } from "@/infrastructure/api/dictionary";

/** 监控卡片通用摄像头条目（兼容安防 / 人流 / 停车字段差异） */
export type MonitorCameraItem = {
  id?: string;
  deviceId?: string;
  token?: string;
  thirdPartyId?: string;
  name?: string;
};

export type MonitorPlaybackErrorPayload = {
  msg?: string;
  type?: string;
};

const MAX_RETRY_COUNT = 2;
const MAX_PLAY_ATTEMPTS = MAX_RETRY_COUNT + 1;

export const getMonitorCameraId = (item?: MonitorCameraItem | null): string => {
  if (!item) return "";
  const raw = item.deviceId ?? item.id;
  return raw != null && raw !== "" ? String(raw) : "";
};

/** 无 deviceId/id 时 CubePlayer 无法播放，卡片侧直接剔除 */
export const isMonitorCameraCandidate = (item?: MonitorCameraItem | null): boolean => Boolean(getMonitorCameraId(item));

/** 播放器基础 key 只依赖设备身份，列表换位时保留已有播放器实例 */
export const getMonitorCameraKey = (item: MonitorCameraItem, prefix = ""): string => {
  const id = getMonitorCameraId(item);
  return `${prefix}${id || item.thirdPartyId || item.token}`;
};

const haveSameCameraOrder = <T extends MonitorCameraItem>(left: T[], right: T[]): boolean =>
  left.length === right.length && left.every((item, index) => getMonitorCameraId(item) === getMonitorCameraId(right[index]));

const haveSameCameraSlots = <T extends MonitorCameraItem>(left: Array<T | null>, right: Array<T | null>): boolean =>
  left.length === right.length && left.every((item, index) => getMonitorCameraId(item) === getMonitorCameraId(right[index]));

const deduplicateCameras = <T extends MonitorCameraItem>(list: T[]): T[] => {
  const seen = new Set<string>();
  return list.filter((item) => {
    const id = getMonitorCameraId(item);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

/**
 * 固定槽位监控池：某路异常只替换对应槽位，其他正常播放器的实例和位置保持不变。
 */
export function useMonitorCameraList<T extends MonitorCameraItem = MonitorCameraItem>() {
  const layout = shallowRef("2X2");
  const pageSize = shallowRef(4);
  const videoPool = shallowRef<T[]>([]) as ShallowRef<T[]>;
  /** 数组下标即固定槽位；null 表示该槽位已无可尝试的监控 */
  const cameraList = shallowRef<Array<T | null>>([]) as ShallowRef<Array<T | null>>;
  /** 已分配播放次数：首次为 1，之后最多再重试 2 次 */
  const attemptCounts = shallowRef<Map<string, number>>(new Map());
  /** 失败候选按时间排队，只有没有未尝试候选时才进入重试 */
  let retryQueue: string[] = [];

  const applyLayoutSize = () => {
    pageSize.value = layout.value === "1X1" ? 1 : 4;
  };

  const loadLayoutFromDictionary = async () => {
    try {
      const res = await getDataDictionaryByItem("SERVICE_CONFIGURATION");
      if (res.length && res[0].variable) {
        const variable = JSON.parse(res[0].variable);
        if (variable.monitor_layout) {
          layout.value = variable.monitor_layout;
        }
      }
    } catch {
      // 字典失败时保持默认 2X2
    }
    applyLayoutSize();
  };

  /**
   * 按设备 ID 对齐接口数据。相同列表只更新元数据；候选变化时也优先保留
   * 原槽位中的摄像头，避免正常播放器重建或换位。
   */
  const setCameras = (list: T[] | null | undefined) => {
    const incoming = deduplicateCameras((list ?? []).filter(isMonitorCameraCandidate) as T[]);
    const currentById = new Map(videoPool.value.map((item) => [getMonitorCameraId(item), item]));
    const reconciled = incoming.map((item) => {
      const current = currentById.get(getMonitorCameraId(item));
      if (!current) return item;
      Object.assign(current, item);
      return current;
    });

    if (haveSameCameraOrder(videoPool.value, reconciled)) {
      return;
    }

    const incomingIds = new Set(reconciled.map(getMonitorCameraId));
    const nextAttemptCounts = new Map([...attemptCounts.value].filter(([id]) => incomingIds.has(id)));
    retryQueue = retryQueue.filter((id) => incomingIds.has(id));
    videoPool.value = reconciled;

    const incomingById = new Map(reconciled.map((item) => [getMonitorCameraId(item), item]));
    const slotCount = Math.min(pageSize.value, reconciled.length);
    const nextSlots = cameraList.value.slice(0, slotCount).map((item) => {
      const id = getMonitorCameraId(item);
      return id ? (incomingById.get(id) ?? null) : null;
    });
    while (nextSlots.length < slotCount) {
      nextSlots.push(null);
    }

    const activeIds = new Set(nextSlots.map(getMonitorCameraId).filter(Boolean));
    for (let slotIndex = 0; slotIndex < nextSlots.length; slotIndex++) {
      if (nextSlots[slotIndex]) continue;
      const candidate = takeNextCandidate(activeIds, nextAttemptCounts);
      if (!candidate) continue;
      nextSlots[slotIndex] = candidate;
      activeIds.add(getMonitorCameraId(candidate));
    }

    attemptCounts.value = nextAttemptCounts;
    if (!haveSameCameraSlots(cameraList.value, nextSlots)) {
      cameraList.value = nextSlots;
    }
  };

  /**
   * 当前槽位异常时优先播放未尝试的后续监控；没有新候选时，从失败队列
   * 公平重试。每个监控最多分配 3 次（首次 + 2 次重试）。
   */
  const markPlaybackFailed = (id: string | number | undefined | null, _payload?: MonitorPlaybackErrorPayload) => {
    const key = id != null && id !== "" ? String(id) : "";
    if (!key) return;
    const slotIndex = cameraList.value.findIndex((item) => getMonitorCameraId(item) === key);
    if (slotIndex < 0) return;

    if (!retryQueue.includes(key)) {
      retryQueue.push(key);
    }

    const nextAttemptCounts = new Map(attemptCounts.value);
    const activeIds = new Set(
      cameraList.value
        .filter((_, index) => index !== slotIndex)
        .map(getMonitorCameraId)
        .filter(Boolean),
    );
    const candidate = takeNextCandidate(activeIds, nextAttemptCounts);
    const nextSlots = [...cameraList.value];
    nextSlots[slotIndex] = candidate;
    attemptCounts.value = nextAttemptCounts;
    cameraList.value = nextSlots;
  };

  const getPlayerKey = (item: T, prefix = "") => {
    const id = getMonitorCameraId(item);
    return `${getMonitorCameraKey(item, prefix)}-attempt-${attemptCounts.value.get(id) ?? 0}`;
  };

  const takeNextCandidate = (activeIds: Set<string>, counts: Map<string, number>): T | null => {
    const fresh = videoPool.value.find((item) => {
      const id = getMonitorCameraId(item);
      return id && !activeIds.has(id) && (counts.get(id) ?? 0) === 0;
    });
    if (fresh) {
      const id = getMonitorCameraId(fresh);
      counts.set(id, 1);
      return fresh;
    }

    while (retryQueue.length > 0) {
      const retryId = retryQueue.shift() as string;
      const attempts = counts.get(retryId) ?? 0;
      if (activeIds.has(retryId) || attempts >= MAX_PLAY_ATTEMPTS) continue;
      const retryCandidate = videoPool.value.find((item) => getMonitorCameraId(item) === retryId);
      if (!retryCandidate) continue;
      counts.set(retryId, attempts + 1);
      return retryCandidate;
    }
    return null;
  };

  return {
    layout,
    pageSize,
    videoPool,
    cameraList,
    attemptCounts,
    loadLayoutFromDictionary,
    setCameras,
    markPlaybackFailed,
    getPlayerKey,
    getMonitorCameraId,
  };
}
