import { showToast } from "vant";
import { reactive, shallowRef } from "vue";

import type { EventRecord } from "@ghcloud/cube-service-interface/fire-management";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getFirePointEventOptions, listFirePointEvents } from "@ghcloud/cube-services-client/fire-management.client";

import { DEFAULT_EVENT_RECORD_FILTERS, type EventRecordFilters, type FireEventRecord, type FireEventType } from "./event-records.model";
import { useFireHostOptions, type MobileSelectOption } from "@/composables/use-fire-host-options";

const PAGE_SIZE = 10;

const normalizeEventType = (value?: string): FireEventType => {
  if (value === "alarm" || value === "fault") return value;
  return "info";
};

const mapRecord = (record: EventRecord): FireEventRecord => {
  const circuit = record.circuit?.trim() || "";
  const address = record.address?.trim() || "";
  const code = record.pointCode?.trim() || "";
  const structuredDeviceInfo = [circuit, address, code].filter(Boolean).join("/");
  const deviceInfo = structuredDeviceInfo || record.deviceInfo?.trim() || "--";
  return {
    id: String(record.id ?? `${record.eventTime}-${deviceInfo}-${record.fireManageDeviceId ?? ""}`),
    eventCode: record.eventCode?.trim() || "",
    eventName: record.eventName?.trim() || "--",
    eventType: normalizeEventType(record.eventType),
    hostId: String(record.fireManageDeviceId ?? ""),
    hostName: record.hostName?.trim() || "--",
    circuit: circuit || "--",
    address: address || "--",
    code: code || record.deviceInfo?.trim() || "--",
    deviceInfo,
    pointName: record.pointName?.trim() || "--",
    location: record.location?.trim() || "--",
    eventTime: record.eventTime || "--",
  };
};

const toTimestamp = (date: string, end = false): number | undefined => {
  if (!date) return undefined;
  const timestamp = new Date(`${date}T${end ? "23:59:59.999" : "00:00:00"}`).getTime();
  return Number.isFinite(timestamp) ? timestamp : undefined;
};

const mergeRecords = (current: FireEventRecord[], incoming: FireEventRecord[]): FireEventRecord[] => {
  const records = new Map(current.map((record) => [record.id, record]));
  incoming.forEach((record) => records.set(record.id, record));
  return Array.from(records.values());
};

export function useEventRecords() {
  const filters = reactive<EventRecordFilters>({ ...DEFAULT_EVENT_RECORD_FILTERS });
  const records = shallowRef<FireEventRecord[]>([]);
  const sourceTotal = shallowRef(0);
  const currentPage = shallowRef(0);
  const loading = shallowRef(false);
  const refreshing = shallowRef(false);
  const finished = shallowRef(false);
  const requestVersion = shallowRef(0);
  const eventOptions = shallowRef<MobileSelectOption[]>([{ text: "全部类型", value: "" }]);
  const eventOptionsLoading = shallowRef(false);
  let activeRequest: symbol | null = null;
  const { hostOptions, hostOptionsLoading, loadHostOptions } = useFireHostOptions();

  const fetchPage = async (pageNumber: number, replace: boolean, version: number): Promise<void> => {
    const requestToken = Symbol("event-records-request");
    activeRequest = requestToken;
    loading.value = true;
    try {
      const page = await useAuthRequest(() =>
        listFirePointEvents({
          pageNumber,
          pageSize: PAGE_SIZE,
          fireManageDeviceId: filters.hostId || undefined,
          location: filters.location.trim() || undefined,
          eventCodes: filters.eventCode ? [filters.eventCode] : undefined,
          startTs: toTimestamp(filters.startDate),
          endTs: toTimestamp(filters.endDate, true),
        }),
      );
      if (version !== requestVersion.value) return;

      const pageRecords = (page.records || []).map(mapRecord);
      sourceTotal.value = Number(page.total || 0);
      const pages = Number(page.pages || 0);
      records.value = replace ? pageRecords : mergeRecords(records.value, pageRecords);
      currentPage.value = pageNumber;
      finished.value = pageRecords.length === 0 || (pages > 0 ? pageNumber >= pages : pageNumber * PAGE_SIZE >= sourceTotal.value);
    } catch (error) {
      if (version !== requestVersion.value) return;
      finished.value = true;
      showToast((error as Error).message || "事件记录加载失败");
    } finally {
      if (activeRequest === requestToken) {
        activeRequest = null;
        loading.value = false;
      }
    }
  };

  const reload = async (): Promise<void> => {
    requestVersion.value += 1;
    const version = requestVersion.value;
    currentPage.value = 0;
    sourceTotal.value = 0;
    finished.value = false;
    await fetchPage(1, true, version);
  };

  const applyFilters = (nextFilters: EventRecordFilters): void => {
    Object.assign(filters, nextFilters);
    void reload();
  };

  const loadEventOptions = async (): Promise<void> => {
    if (eventOptionsLoading.value) return;
    eventOptionsLoading.value = true;
    try {
      const options = await useAuthRequest(() => getFirePointEventOptions());
      eventOptions.value = [{ text: "全部类型", value: "" }, ...Object.entries(options || {}).map(([value, text]) => ({ text, value }))];
    } catch (error) {
      showToast((error as Error).message || "事件类型加载失败");
    } finally {
      eventOptionsLoading.value = false;
    }
  };

  const loadMore = async (): Promise<void> => {
    if (activeRequest || finished.value) {
      loading.value = false;
      return;
    }
    await fetchPage(currentPage.value + 1, false, requestVersion.value);
  };

  const refresh = async (): Promise<void> => {
    refreshing.value = true;
    try {
      await reload();
    } finally {
      refreshing.value = false;
    }
  };

  return {
    filters,
    records,
    sourceTotal,
    loading,
    refreshing,
    finished,
    eventOptions,
    eventOptionsLoading,
    hostOptions,
    hostOptionsLoading,
    loadHostOptions,
    loadEventOptions,
    applyFilters,
    loadMore,
    reload,
    refresh,
  };
}
