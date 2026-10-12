import { defineComponent, onMounted, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";

import type { ColdStoreRefrigerationUnitHealthRank } from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreRefrigerationHealthOverview } from "@ghcloud/cube-services-client/cold-storage.client";
import { Button, Empty, Spin, Table } from "@ghcloud/cube-ui";

import { AiCard, StatusTag } from "../../../shared/components";
import { pushByHistory } from "../../../shared/page";

const healthTone = (level?: string, score = 0): "green" | "orange" | "red" => {
  if (level === "WARNING" || score < 75) {
    return "red";
  }
  if (level === "WATCH" || score < 85) {
    return "orange";
  }
  return "green";
};

export const HealthDashboardTab = defineComponent({
  name: "HealthDashboardTab",
  setup: () => {
    const router = useRouter();
    const loading = shallowRef(false);
    const rows = ref<ColdStoreRefrigerationUnitHealthRank[]>([]);

    const loadData = async (): Promise<void> => {
      loading.value = true;
      try {
        const data = await useAuthRequest(() => getColdStoreRefrigerationHealthOverview());
        rows.value = data.units ?? [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadData();
    });

    const columns = [
      { title: "排名", dataIndex: "rank", align: "center" },
      { title: "机组名称", dataIndex: "unitName", align: "center" },
      { title: "所属冷库", dataIndex: "storeName", align: "center" },
      { title: "压力", dataIndex: "pressureScore", align: "center" },
      { title: "温度", dataIndex: "temperatureScore", align: "center" },
      { title: "振动", dataIndex: "vibrationScore", align: "center" },
      { title: "电流", dataIndex: "currentScore", align: "center" },
      {
        title: "综合评分",
        align: "center",
        customRender: ({ record }: { record: ColdStoreRefrigerationUnitHealthRank }) => (
          <StatusTag tone={healthTone(record.healthLevel, record.totalScore)} text={`${record.totalScore ?? "--"}分`} />
        ),
      },
      { title: "AI剩余寿命", dataIndex: "remainingLife", align: "center" },
      {
        title: "操作",
        align: "center",
        customRender: ({ record }: { record: ColdStoreRefrigerationUnitHealthRank }) => (
          <Button
            type="link"
            onClick={() => {
              pushByHistory(router, { name: "refrigeration-analysis-detail", query: { id: record.unitCode } });
            }}
          >
            详情
          </Button>
        ),
      },
    ];

    return () => (
      <Spin spinning={loading.value}>
        <div class="panel-stack">
          <AiCard title="AI健康评分机制" text="基于1000+故障模式知识图谱，综合压力、温度、振动、电流多维数据，每4小时更新。" />
          <Table
            pagination={false}
            rowKey="unitCode"
            dataSource={rows.value}
            columns={columns}
            locale={{ emptyText: <Empty description="暂无机组健康数据" /> }}
          />
        </div>
      </Spin>
    );
  },
});
