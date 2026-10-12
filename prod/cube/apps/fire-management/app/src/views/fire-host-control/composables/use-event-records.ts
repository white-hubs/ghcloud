import { onUnmounted, ref, shallowRef, type Ref } from "vue";

import type { FireHostRecentEventRecord } from "@ghcloud/cube-service-interface/fire-management";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { listFireHostRecentEvents } from "@ghcloud/cube-services-client/fire-management.client";
import { message } from "@ghcloud/cube-ui";

import type { FireEventViewModel, FireHostId } from "../models";
import { normalizeFireEventType } from "@/utils/fire-event";

const formatEventTime = (value?: string): string => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace("T", " ").slice(0, 16);
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replaceAll("/", "-");
};

const mapEventRecord = (record: FireHostRecentEventRecord): FireEventViewModel => ({
  id: String(record.id ?? `${record.eventTime}-${record.deviceInfo}`),
  eventName: record.eventName || "--",
  eventType: normalizeFireEventType(record.eventType),
  deviceInfo: record.deviceInfo || "--",
  pointName: record.deviceInfo || "--",
  time: formatEventTime(record.eventTime),
  location: record.location || "--",
});

export function useEventRecords(currentHostId: Readonly<Ref<FireHostId>>) {
  const isVisible = shallowRef(false);
  const records = ref<FireEventViewModel[]>([]);
  const isLoading = shallowRef(false);
  let requestVersion = 0;
  let isDisposed = false;

  const load = async (): Promise<void> => {
    const hostId = currentHostId.value;
    if (!hostId) return;
    requestVersion += 1;
    const version = requestVersion;
    isLoading.value = true;
    try {
      const recentEvents = await useAuthRequest(() => listFireHostRecentEvents(hostId));
      if (isDisposed || version !== requestVersion || String(currentHostId.value) !== String(hostId)) return;
      records.value = recentEvents.map(mapEventRecord);
    } catch (error) {
      if (!isDisposed && version === requestVersion) {
        records.value = [];
        message.error((error as Error).message || "加载事件记录失败");
      }
    } finally {
      if (!isDisposed && version === requestVersion) isLoading.value = false;
    }
  };

  const open = (): void => {
    isVisible.value = true;
    void load();
  };

  const close = (): void => {
    isVisible.value = false;
  };

  onUnmounted(() => {
    isDisposed = true;
    requestVersion += 1;
  });

  return { isVisible, records, isLoading, open, close };
}
