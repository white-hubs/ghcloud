import { computed, defineComponent, onMounted, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { ColdStoreMonitorCardDetail } from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreMonitorCardDetail } from "@ghcloud/cube-services-client/cold-storage.client";
import { Button, Empty, Spin } from "@ghcloud/cube-ui";

import { goBack } from "../shared/page";
import { MonitoringDetail } from "./components/monitoring-detail";

export const MonitoringDetailPage = defineComponent({
  name: "MonitoringDetailPage",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const loading = shallowRef(false);
    const detail = shallowRef<ColdStoreMonitorCardDetail | null>(null);
    const storeId = computed(() => {
      const value = route.query.id;
      return Array.isArray(value) ? (value[0] ?? "") : String(value ?? "");
    });

    const loadDetail = async (): Promise<void> => {
      if (!storeId.value) {
        detail.value = null;
        return;
      }
      loading.value = true;
      try {
        const data = await useAuthRequest(() => getColdStoreMonitorCardDetail(storeId.value));
        detail.value = data;
      } finally {
        loading.value = false;
      }
    };

    const back = (): void => {
      goBack(router, { name: "monitoring" });
    };

    onMounted(() => {
      void loadDetail();
    });

    watch(storeId, () => {
      void loadDetail();
    });

    const content = (): JSX.Element => (
      <Spin spinning={loading.value}>
        {detail.value ? <MonitoringDetail detail={detail.value} /> : <Empty description="未找到监测详情" />}
      </Spin>
    );

    return () => (
      <CubeLayout
        title="监测感知详情"
        showFooter
        v-slots={{
          "layout-content": content,
          "footer-page": () => <Button onClick={back}>返回</Button>,
        }}
      />
    );
  },
});
