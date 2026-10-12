import { shallowRef } from "vue";

import { getApplicationDeviceStatistics, getApplicationDeviceStatusStatistics } from "@/api/device";
import type { ApplicationDeviceStatistics, ApplicationDeviceStatusStatistics } from "@/api/device";

function createPendingRequest<T>(requestStatistics: () => Promise<T[]>) {
  let pendingRequest: Promise<T[]> | undefined;

  return () => {
    if (pendingRequest) return pendingRequest;

    const request = requestStatistics().finally(() => {
      pendingRequest = undefined;
    });
    pendingRequest = request;
    return request;
  };
}

function useStatisticsLoader<T>(requestStatistics: () => Promise<T[]>) {
  const statistics = shallowRef<T[]>([]);
  const loading = shallowRef(false);

  async function load(): Promise<T[]> {
    loading.value = true;
    try {
      statistics.value = await requestStatistics();
      return statistics.value;
    } finally {
      loading.value = false;
    }
  }

  return { statistics, loading, load };
}

const requestApplicationDeviceCountStatistics = createPendingRequest<ApplicationDeviceStatistics>(getApplicationDeviceStatistics);
const requestApplicationDeviceStatusStatistics = createPendingRequest<ApplicationDeviceStatusStatistics>(
  getApplicationDeviceStatusStatistics,
);

export function useApplicationDeviceCountStatistics() {
  return useStatisticsLoader<ApplicationDeviceStatistics>(requestApplicationDeviceCountStatistics);
}

export function useApplicationDeviceStatusStatistics() {
  return useStatisticsLoader<ApplicationDeviceStatusStatistics>(requestApplicationDeviceStatusStatistics);
}
