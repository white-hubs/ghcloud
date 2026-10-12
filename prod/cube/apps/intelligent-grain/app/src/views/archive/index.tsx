import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { GrainArchiveDetail, GrainWarehouseOption } from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getIntelligentGrainArchive, listIntelligentGrainWarehouseOptions } from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, Card, Empty, Select, Space, Spin, Tag, message } from "@ghcloud/cube-ui";

import { formatTime, HEALTH_COLOR, HEALTH_LABEL } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

export const IntelligentGrainArchive = defineComponent({
  name: "IntelligentGrainArchive",
  setup: () => {
    const router = useRouter();
    const loading = ref(false);
    const options = ref<GrainWarehouseOption[]>([]);
    const archive = ref<GrainArchiveDetail>();
    const selectedWarehouseId = ref<string>();

    const warehouseOptions = computed(() =>
      options.value.map((item) => ({
        label: `${item.warehouseName}${item.areaName ? ` · ${item.areaName}` : ""}`,
        value: item.warehouseId,
      })),
    );

    const loadArchive = async (warehouseId: string): Promise<void> => {
      archive.value = await useAuthRequest(() => getIntelligentGrainArchive(warehouseId));
    };

    const load = async (): Promise<void> => {
      loading.value = true;
      try {
        const warehouseOptionsData = await useAuthRequest(() => listIntelligentGrainWarehouseOptions());
        options.value = warehouseOptionsData;
        const nextWarehouseId = selectedWarehouseId.value ?? warehouseOptionsData[0]?.warehouseId;
        selectedWarehouseId.value = nextWarehouseId;
        if (nextWarehouseId) {
          await loadArchive(nextWarehouseId);
        } else {
          archive.value = undefined;
        }
      } catch (error) {
        message.error((error as Error).message || "加载粮情档案失败");
      } finally {
        loading.value = false;
      }
    };

    const handleWarehouseChange = (value: string): void => {
      selectedWarehouseId.value = value;
      loading.value = true;
      void loadArchive(value)
        .catch((error: unknown) => {
          message.error((error as Error).message || "加载粮情档案失败");
        })
        .finally(() => {
          loading.value = false;
        });
    };

    onMounted(() => {
      void load();
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button onClick={load}>刷新</Button>
          <span class="ig-header-tip">按仓房查看健康评分、关键指标和 AI 研判。</span>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <Spin spinning={loading.value}>
          <div class="ig-page ig-two-column">
            <Card title="粮情档案">
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Select
                  value={selectedWarehouseId.value}
                  options={warehouseOptions.value}
                  style={{ width: "280px" }}
                  onChange={(value: string) => handleWarehouseChange(value)}
                />
                {selectedWarehouseId.value ? (
                  <Space>
                    <Button
                      type="primary"
                      onClick={() =>
                        router.push({ name: "intelligent-grain-archive-detail", query: { warehouseId: selectedWarehouseId.value } })
                      }
                    >
                      档案详情
                    </Button>
                    <Button
                      onClick={() =>
                        router.push({ name: "intelligent-grain-archive-trend", query: { warehouseId: selectedWarehouseId.value } })
                      }
                    >
                      趋势曲线
                    </Button>
                    <Button
                      onClick={() =>
                        router.push({ name: "intelligent-grain-archive-records", query: { warehouseId: selectedWarehouseId.value } })
                      }
                    >
                      数据明细
                    </Button>
                  </Space>
                ) : null}
                {archive.value ? (
                  <div class="ig-archive-panel">
                    <div class="ig-archive-panel__title">
                      <strong>{archive.value.warehouseName}</strong>
                      <Tag color={HEALTH_COLOR[archive.value.health.level]}>{HEALTH_LABEL[archive.value.health.level]}</Tag>
                    </div>
                    <div class="ig-archive-panel__meta">
                      <span>库区：{archive.value.areaName || "--"}</span>
                      <span>粮种：{archive.value.grainType || "--"}</span>
                      <span>最近扫描：{formatTime(archive.value.latestScanTime)}</span>
                    </div>
                    <div class="ig-dimension-grid">
                      {archive.value.health.dimensionScores.map((item) => (
                        <div key={item.dimension}>
                          <span>{item.label}</span>
                          <strong>{item.ready ? `${item.score ?? 0}分` : "待接入"}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Empty description="请选择仓房" />
                )}
              </Space>
            </Card>

            <Card title="AI 研判">
              {archive.value ? (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div class="ig-ai-box">
                    <span>通风建议</span>
                    <strong>{archive.value.ventilationSuggestion?.summary ?? "暂无建议"}</strong>
                  </div>
                  <div class="ig-ai-box">
                    <span>品质预测</span>
                    <strong>{archive.value.qualityPrediction?.summary ?? "暂无预测"}</strong>
                  </div>
                  {archive.value.riskPredictions.map((item) => (
                    <div class="ig-ai-box" key={item.summary}>
                      <span>{item.source}</span>
                      <strong>{item.summary}</strong>
                    </div>
                  ))}
                </Space>
              ) : (
                <Empty description="暂无研判数据" />
              )}
            </Card>
          </div>
        </Spin>
      ),
    };

    return (): JSX.Element => <CubeLayout title="粮情档案" v-slots={slots} showFooter={false} />;
  },
});
