import { defineComponent, onMounted, reactive, shallowRef } from "vue";
import { useRouter } from "vue-router";

import { AreaCascaderSelect, CubeLayout, useCubeForm } from "@ghcloud/cube-app-design";
import type { ColdStoreMonitorCard, ColdStoreMonitorExceptionStatistics } from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreMonitorCards, getColdStoreMonitorExceptionStatistics } from "@ghcloud/cube-services-client/cold-storage.client";
import { Page, Spin } from "@ghcloud/cube-ui";

import { pushByHistory } from "../shared/page";
import { MonitoringList } from "./components/monitoring-list";

import "./index.less";

export const MonitoringPage = defineComponent({
  name: "MonitoringPage",
  setup: () => {
    const router = useRouter();
    const loading = shallowRef(false);
    const statistics = shallowRef<ColdStoreMonitorExceptionStatistics>({});
    const stores = shallowRef<ColdStoreMonitorCard[]>([]);
    const search = reactive<{
      areaId: string | string[];
      areaName: string;
      keyword: string;
      pageNumber: number;
      pageSize: number;
      total: number;
    }>({
      areaId: "",
      areaName: "",
      keyword: "",
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const loadStatistics = async (): Promise<void> => {
      statistics.value = await useAuthRequest(() => getColdStoreMonitorExceptionStatistics());
    };

    const loadCards = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          getColdStoreMonitorCards({
            pageNumber: search.pageNumber,
            pageSize: search.pageSize,
            area: search.areaName,
            keyword: search.keyword.trim(),
          }),
        );
        stores.value = page.records ?? [];
        search.total = page.total ?? 0;
      } finally {
        loading.value = false;
      }
    };

    const loadPage = async (): Promise<void> => {
      await Promise.all([loadStatistics(), loadCards()]);
    };

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      isCollapsed: false,
      syncStateRef: search,
      cacheFields: ["areaId", "keyword"],
      schema: [
        {
          component: AreaCascaderSelect,
          label: "区域",
          fieldName: "areaId",
          componentProps: {
            placeholder: "请选择区域",
            onChange: (selectedOptions?: Array<{ name?: string }>) => {
              search.areaName = selectedOptions?.at(-1)?.name ?? "";
            },
          },
        },
        {
          component: "Input",
          label: "",
          fieldName: "keyword",
          componentProps: {
            placeholder: "搜索冷库名称/编号",
          },
        },
      ],
      handleSubmit: (values) => {
        search.pageNumber = 1;
        search.areaId = (values.areaId as string | string[] | undefined) ?? "";
        search.keyword = values.keyword ? String(values.keyword) : "";
        void loadCards();
      },
      handleReset: () => {
        search.pageNumber = 1;
        search.areaId = "";
        search.areaName = "";
        search.keyword = "";
        void loadCards();
      },
    });

    const selectStatus = (status: string): void => {
      const target = stores.value.find((store) => String(store.status ?? "").toUpperCase() === status);
      if (target) {
        openStore(target);
      }
    };

    const openStore = (store: ColdStoreMonitorCard): void => {
      pushByHistory(router, { name: "monitoring-detail", query: { id: store.id } });
    };

    const changePage = (pageNumber: number, pageSize: number): void => {
      search.pageNumber = pageNumber;
      search.pageSize = pageSize;
      void loadCards();
    };

    onMounted(() => {
      void loadPage();
    });

    const content = (): JSX.Element => (
      <Spin spinning={loading.value}>
        <MonitoringList
          stores={stores.value}
          statistics={statistics.value}
          FilterForm={CubeForm}
          onSelectStatus={selectStatus}
          onOpenStore={(store: ColdStoreMonitorCard) => {
            openStore(store);
          }}
        />
      </Spin>
    );

    return () => (
      <CubeLayout
        title="监测感知"
        showFooter
        v-slots={{
          "layout-content": content,
          "footer-page": () => (
            <Page current={search.pageNumber} pageSize={search.pageSize} total={search.total} onPageChange={changePage} />
          ),
        }}
      />
    );
  },
});
