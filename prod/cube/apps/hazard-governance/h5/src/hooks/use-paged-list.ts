import { shallowRef, type ShallowRef } from "vue";

import type { Pagination } from "@ghcloud/cube-service-interface/base";

const DEFAULT_PAGE_SIZE = 10;

export interface PagedListState<T> {
  rows: ShallowRef<T[]>;
  total: ShallowRef<number>;
  loading: ShallowRef<boolean>;
  refreshing: ShallowRef<boolean>;
  finished: ShallowRef<boolean>;
  error: ShallowRef<boolean>;
  onLoad: () => void;
  onRefresh: () => void;
  reset: () => void;
}

export const usePagedList = <T>(
  fetchPage: (pageNumber: number, pageSize: number) => Promise<Pagination<T>>,
  pageSize = DEFAULT_PAGE_SIZE,
): PagedListState<T> => {
  const rows = shallowRef<T[]>([]);
  const total = shallowRef(0);
  const loading = shallowRef(false);
  const refreshing = shallowRef(false);
  const finished = shallowRef(false);
  const error = shallowRef(false);
  let nextPageNumber = 1;
  let requestVersion = 0;
  let requestingVersion: number | undefined;

  const requestPage = async (replace: boolean, version: number): Promise<void> => {
    const pageNumber = replace ? 1 : nextPageNumber;
    requestingVersion = version;
    loading.value = true;
    error.value = false;

    try {
      const result = await fetchPage(pageNumber, pageSize);
      if (version !== requestVersion) return;

      rows.value = replace ? result.records : [...rows.value, ...result.records];
      total.value = result.total;
      nextPageNumber = pageNumber + 1;
      finished.value = rows.value.length >= result.total || pageNumber >= result.pages || result.records.length < pageSize;
    } catch {
      if (version === requestVersion) error.value = true;
    } finally {
      if (version === requestVersion) {
        loading.value = false;
        refreshing.value = false;
        requestingVersion = undefined;
      }
    }
  };

  const onLoad = (): void => {
    if (requestingVersion === requestVersion || finished.value) return;
    void requestPage(false, requestVersion);
  };

  const onRefresh = (): void => {
    requestVersion += 1;
    refreshing.value = true;
    finished.value = false;
    void requestPage(true, requestVersion);
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

  return { rows, total, loading, refreshing, finished, error, onLoad, onRefresh, reset };
};
