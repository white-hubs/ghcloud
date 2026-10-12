import { showToast } from "vant";
import { reactive, shallowRef } from "vue";

import type { FirePointEventStatisticsRecord } from "@ghcloud/cube-service-interface/fire-management";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { listFirePointEventStatistics } from "@ghcloud/cube-services-client/fire-management.client";

import { DEFAULT_POINT_STATISTICS_FILTERS, type PointStatisticsFilters, type PointStatisticsRecord } from "./point-statistics.model";
import { useFireHostOptions } from "@/composables/use-fire-host-options";

const PAGE_SIZE = 10;

const mapRecord = (record: FirePointEventStatisticsRecord): PointStatisticsRecord => ({
  id: String(record.id),
  pointName: record.pointName?.trim() || "--",
  location: record.location?.trim() || "--",
  alarmCount: Number(record.alarmCount || 0),
  faultCount: Number(record.faultCount || 0),
  totalCount: Number(record.totalCount || 0),
  lastTriggered: record.lastTriggerTime || "--",
});

const mergeRecords = (current: PointStatisticsRecord[], incoming: PointStatisticsRecord[]): PointStatisticsRecord[] => {
  const records = new Map(current.map((record) => [record.id, record]));
  incoming.forEach((record) => records.set(record.id, record));
  return Array.from(records.values());
};

export function usePointStatistics() {
  const filters = reactive<PointStatisticsFilters>({ ...DEFAULT_POINT_STATISTICS_FILTERS });
  const records = shallowRef<PointStatisticsRecord[]>([]);
  const total = shallowRef(0);
  const currentPage = shallowRef(0);
  const loading = shallowRef(false);
  const refreshing = shallowRef(false);
  const finished = shallowRef(false);
  const requestVersion = shallowRef(0);
  let activeRequest: symbol | null = null;
  const { hostOptions, hostOptionsLoading, loadHostOptions } = useFireHostOptions();

  const fetchPage = async (pageNumber: number, replace: boolean, version: number): Promise<void> => {
    const requestToken = Symbol("point-statistics-request");
    activeRequest = requestToken;
    loading.value = true;
    try {
      const page = await useAuthRequest(() =>
        listFirePointEventStatistics({
          pageNumber,
          pageSize: PAGE_SIZE,
          fireManageDeviceId: filters.hostId || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          location: filters.location.trim() || undefined,
        }),
      );
      if (version !== requestVersion.value) return;

      const nextRecords = (page.records || []).map(mapRecord);
      records.value = replace ? nextRecords : mergeRecords(records.value, nextRecords);
      currentPage.value = pageNumber;
      total.value = Number(page.total || 0);
      const pages = Number(page.pages || 0);
      finished.value = nextRecords.length === 0 || (pages > 0 ? pageNumber >= pages : records.value.length >= total.value);
    } catch (error) {
      if (version !== requestVersion.value) return;
      finished.value = true;
      showToast((error as Error).message || "点位统计加载失败");
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
    total.value = 0;
    finished.value = false;
    await fetchPage(1, true, version);
  };

  const applyFilters = (nextFilters: PointStatisticsFilters): void => {
    Object.assign(filters, nextFilters);
    void reload();
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
    total,
    loading,
    refreshing,
    finished,
    hostOptions,
    hostOptionsLoading,
    loadHostOptions,
    applyFilters,
    loadMore,
    reload,
    refresh,
  };
}
