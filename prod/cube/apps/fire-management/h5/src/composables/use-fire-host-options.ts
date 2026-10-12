import { showToast } from "vant";
import { shallowRef } from "vue";

import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { listFireHostOverviews } from "@ghcloud/cube-services-client/fire-management.client";

export interface MobileSelectOption {
  text: string;
  value: string;
}

const PAGE_SIZE = 100;

export function useFireHostOptions() {
  const hostOptions = shallowRef<MobileSelectOption[]>([{ text: "全部主机", value: "" }]);
  const hostOptionsLoading = shallowRef(false);

  const loadHostOptions = async (): Promise<void> => {
    if (hostOptionsLoading.value) return;
    hostOptionsLoading.value = true;
    try {
      const hosts = new Map<string, string>();
      let pageNumber = 1;
      let pages = 1;
      do {
        const page = await useAuthRequest(() => listFireHostOverviews({ pageNumber, pageSize: PAGE_SIZE }));
        (page.records || []).forEach((host) => hosts.set(String(host.id), host.deviceName || "未命名主机"));
        pages = Math.max(1, Number(page.pages || 1));
        pageNumber += 1;
      } while (pageNumber <= pages);
      hostOptions.value = [{ text: "全部主机", value: "" }, ...Array.from(hosts, ([value, text]) => ({ text, value }))];
    } catch (error) {
      showToast((error as Error).message || "主机筛选列表加载失败");
    } finally {
      hostOptionsLoading.value = false;
    }
  };

  return { hostOptions, hostOptionsLoading, loadHostOptions };
}
