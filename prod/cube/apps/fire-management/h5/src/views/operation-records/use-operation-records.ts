import { showToast } from "vant";
import { reactive, shallowRef } from "vue";

import type { FireOperationCategory, FireOperationLogRecord, FireOperationResult } from "@ghcloud/cube-service-interface/fire-management";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { listOperationLogs } from "@ghcloud/cube-services-client/fire-management.client";

import {
  DEFAULT_OPERATION_RECORD_FILTERS,
  type FireOperationRecord,
  type OperationRecordFilters,
  type OperationResult,
  type OperationType,
} from "./operation-records.model";
import { useFireHostOptions } from "@/composables/use-fire-host-options";

const PAGE_SIZE = 10;

const operationTypeMap: Record<FireOperationCategory, OperationType> = {
  HOST_BUTTON: "controlButton",
  BUS_POINT: "busPanel",
  MULTI_LINE_POINT: "multiLinePanel",
};

const apiOperationTypeMap: Record<OperationType, FireOperationCategory> = {
  controlButton: "HOST_BUTTON",
  busPanel: "BUS_POINT",
  multiLinePanel: "MULTI_LINE_POINT",
};

const operationResultMap: Record<FireOperationResult, OperationResult> = {
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILED: "failed",
};

const apiOperationResultMap: Record<OperationResult, FireOperationResult> = {
  processing: "PROCESSING",
  success: "SUCCESS",
  failed: "FAILED",
};

const mapRecord = (record: FireOperationLogRecord): FireOperationRecord => ({
  id: String(record.id),
  operationTime: record.operationTime || "--",
  hostId: String(record.fireManageDeviceId),
  hostName: record.hostNameSnapshot?.trim() || record.hostName?.trim() || String(record.fireManageDeviceId),
  operator: record.operatorName?.trim() || "--",
  operationType: operationTypeMap[record.operationCategory],
  content: record.operationContent?.trim() || record.operationName?.trim() || "--",
  result: operationResultMap[record.result],
  failureReason: record.result === "FAILED" ? record.failureReason?.trim() || record.responseMessage?.trim() || undefined : undefined,
});

const mergeRecords = (current: FireOperationRecord[], incoming: FireOperationRecord[]): FireOperationRecord[] => {
  const records = new Map(current.map((record) => [record.id, record]));
  incoming.forEach((record) => records.set(record.id, record));
  return Array.from(records.values());
};

const startOfDay = (date: string): string | undefined => (date ? `${date} 00:00:00` : undefined);
const endOfDay = (date: string): string | undefined => (date ? `${date} 23:59:59` : undefined);

export function useOperationRecords() {
  const filters = reactive<OperationRecordFilters>({ ...DEFAULT_OPERATION_RECORD_FILTERS });
  const records = shallowRef<FireOperationRecord[]>([]);
  const total = shallowRef(0);
  const currentPage = shallowRef(0);
  const loading = shallowRef(false);
  const refreshing = shallowRef(false);
  const finished = shallowRef(false);
  const requestVersion = shallowRef(0);
  let activeRequest: symbol | null = null;
  const { hostOptions, hostOptionsLoading, loadHostOptions } = useFireHostOptions();

  const fetchPage = async (pageNumber: number, replace: boolean, version: number): Promise<void> => {
    const requestToken = Symbol("operation-records-request");
    activeRequest = requestToken;
    loading.value = true;
    try {
      const page = await useAuthRequest(() =>
        listOperationLogs({
          pageNumber,
          pageSize: PAGE_SIZE,
          fireManageDeviceId: filters.hostId || undefined,
          operationCategory: filters.operationType ? apiOperationTypeMap[filters.operationType] : undefined,
          result: filters.result ? apiOperationResultMap[filters.result] : undefined,
          operatorKeyword: filters.operator.trim() || undefined,
          startTime: startOfDay(filters.startDate),
          endTime: endOfDay(filters.endDate),
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
      showToast((error as Error).message || "操作记录加载失败");
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

  const applyFilters = (nextFilters: OperationRecordFilters): void => {
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
