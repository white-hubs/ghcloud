import { defineComponent, onMounted, ref, shallowRef } from "vue";

import type { ColdStoreRefrigerationEnergyItem } from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreRefrigerationEnergy } from "@ghcloud/cube-services-client/cold-storage.client";
import { Empty, Spin, Table } from "@ghcloud/cube-ui";

import { AiCard, StatusTag } from "../../../shared/components";

const energyTone = (level?: string): "green" | "orange" | "red" => {
  if (level === "SEVERE") {
    return "red";
  }
  if (level === "LOW") {
    return "orange";
  }
  return "green";
};

const percentText = (value?: number): string => (value === null || value === undefined ? "--" : `${value}%`);

export const EnergyAnalysisTab = defineComponent({
  name: "EnergyAnalysisTab",
  setup: () => {
    const loading = shallowRef(false);
    const rows = ref<ColdStoreRefrigerationEnergyItem[]>([]);
    const trendDescription = ref("");

    const loadData = async (): Promise<void> => {
      loading.value = true;
      try {
        const data = await useAuthRequest(() => getColdStoreRefrigerationEnergy());
        rows.value = data.records ?? [];
        trendDescription.value = data.trendDescription ?? "";
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadData();
    });

    const columns = [
      { title: "冷库", dataIndex: "storeName", align: "center" },
      { title: "COP当前", dataIndex: "currentCop", align: "center" },
      { title: "COP基准", dataIndex: "baselineCop", align: "center" },
      {
        title: "偏差",
        align: "center",
        customRender: ({ record }: { record: ColdStoreRefrigerationEnergyItem }) => (
          <StatusTag tone={energyTone(record.efficiencyLevel)} text={percentText(record.deviationPercent)} />
        ),
      },
      { title: "AI诊断", dataIndex: "aiDiagnosis", align: "center" },
      { title: "AI推荐策略", dataIndex: "aiRecommendation", align: "center" },
      {
        title: "预计节能",
        align: "center",
        customRender: ({ record }: { record: ColdStoreRefrigerationEnergyItem }) => percentText(record.expectedSavingPercent),
      },
    ];

    return () => (
      <Spin spinning={loading.value}>
        <div class="panel-stack">
          <Table
            pagination={false}
            rowKey="storeCode"
            dataSource={rows.value}
            columns={columns}
            locale={{ emptyText: <Empty description="暂无能效分析数据" /> }}
          />
          {trendDescription.value ? <AiCard title="能效趋势图说明" text={trendDescription.value} badge="趋势分析" /> : null}
        </div>
      </Spin>
    );
  },
});
