import { shallowRef, type ShallowRef } from "vue";

import type { HazardLedgerRecordVO, HazardSourceType } from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { pageHazardLedger } from "@ghcloud/cube-services-client/hazard-governance.client";

const PAGE_SIZE = 10;

export interface HazardLedgerListState {
  rows: ShallowRef<HazardLedgerRecordVO[]>;
  total: ShallowRef<number>;
  loading: ShallowRef<boolean>;
  refreshing: ShallowRef<boolean>;
  finished: ShallowRef<boolean>;
  error: ShallowRef<boolean>;
  onLoad: () => void;
  onRefresh: () => void;
  reset: () => void;
}

export const useHazardLedger = (getSourceType: () => HazardSourceType | undefined): HazardLedgerListState => {
  const rows = shallowRef<HazardLedgerRecordVO[]>([]);
  const total = shallowRef(0);
  const loading = shallowRef(false);
  const refreshing = shallowRef(false);
  const finished = shallowRef(false);
  const error = shallowRef(false);
  let nextPageNumber = 1;
  let requestVersion = 0;
  let requestingVersion: number | undefined;

  const fetchPage = async (replace: boolean, version: number): Promise<void> => {
    const pageNumber = replace ? 1 : nextPageNumber;
    requestingVersion = version;
    loading.value = true;
    error.value = false;

    try {
      const sourceType = getSourceType();
      const result = await useAuthRequest(() =>
        pageHazardLedger({
          pageNumber,
          pageSize: PAGE_SIZE,
          ...(sourceType ? { sourceType } : {}),
        }),
      );

      if (version !== requestVersion) {
        return;
      }

      rows.value = replace ? result.records : [...rows.value, ...result.records];
      total.value = result.total;
      nextPageNumber = pageNumber + 1;
      finished.value = rows.value.length >= result.total || pageNumber >= result.pages || result.records.length < PAGE_SIZE;
    } catch {
      if (version === requestVersion) {
        error.value = true;
      }
    } finally {
      if (version === requestVersion) {
        loading.value = false;
        refreshing.value = false;
        requestingVersion = undefined;
      }
    }
  };

  const onLoad = (): void => {
    if (requestingVersion === requestVersion || finished.value) {
      return;
    }
    void fetchPage(false, requestVersion);
  };

  const onRefresh = (): void => {
    requestVersion += 1;
    refreshing.value = true;
    finished.value = false;
    void fetchPage(true, requestVersion);
  };

  const reset = (): void => {
    requestVersion += 1;
    rows.value = [];
    total.value = 0;
    nextPageNumber = 1;
    loading.value = false;
    refreshing.value = false;
    finished.value = false;
    error.value = false;
    requestingVersion = undefined;
  };

  return {
    rows,
    total,
    loading,
    refreshing,
    finished,
    error,
    onLoad,
    onRefresh,
    reset,
  };
};
