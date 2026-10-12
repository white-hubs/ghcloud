import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { GrainHealthLevel, type GrainDashboardOverview, type GrainWarehouseCard } from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getIntelligentGrainDashboard } from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, Empty, Input, Select, Space, Spin, Tag, message } from "@ghcloud/cube-ui";

import { formatTime, renderWarehouseCard } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

export const IntelligentGrainDashboard = defineComponent({
  name: "IntelligentGrainDashboard",
  setup: () => {
    const router = useRouter();
    const loading = ref(false);
    const dashboard = ref<GrainDashboardOverview>();
    const selectedWarehouseId = ref<string>();
    const areaFilter = ref("");
    const grainFilter = ref("");
    const healthFilter = ref<GrainHealthLevel | "">("");
    const keyword = ref("");
    const sortBy = ref<"health-asc" | "health-desc" | "alert-desc">("health-asc");
    const warehouses = computed(() => dashboard.value?.warehouses ?? []);
    const filteredWarehouses = computed(() => {
      const lowerKeyword = keyword.value.trim().toLowerCase();
      const records = warehouses.value
        .filter((item) => !areaFilter.value || item.areaName === areaFilter.value)
        .filter((item) => !grainFilter.value || item.grainType === grainFilter.value)
        .filter((item) => !healthFilter.value || item.healthLevel === healthFilter.value)
        .filter((item) => !lowerKeyword || item.warehouseName.toLowerCase().includes(lowerKeyword))
        .slice();
      records.sort((a, b) => {
        if (sortBy.value === "alert-desc") {
          return Number(Boolean(b.activeAlert)) - Number(Boolean(a.activeAlert));
        }
        const scoreA = a.healthScore ?? (a.offline ? -1 : 0);
        const scoreB = b.healthScore ?? (b.offline ? -1 : 0);
        return sortBy.value === "health-desc" ? scoreB - scoreA : scoreA - scoreB;
      });
      return records;
    });
    const selectedWarehouse = computed(() => warehouses.value.find((item) => item.warehouseId === selectedWarehouseId.value));
    const areaOptions = computed(() => [
      { label: "全部库区", value: "" },
      ...Array.from(new Set(warehouses.value.map((item) => item.areaName).filter(Boolean))).map((value) => ({
        label: value,
        value,
      })),
    ]);
    const grainOptions = computed(() => [
      { label: "全部品种", value: "" },
      ...Array.from(new Set(warehouses.value.map((item) => item.grainType).filter(Boolean))).map((value) => ({
        label: value,
        value,
      })),
    ]);
    const healthOptions = [
      { label: "全部健康度", value: "" },
      { label: "危险(<60)", value: GrainHealthLevel.DANGER },
      { label: "关注(60-79)", value: GrainHealthLevel.WARN },
      { label: "健康(≥80)", value: GrainHealthLevel.GOOD },
    ];
    const sortOptions = [
      { label: "健康度从低到高", value: "health-asc" },
      { label: "健康度从高到低", value: "health-desc" },
      { label: "告警优先", value: "alert-desc" },
    ];

    const activeAlertCount = computed(() => warehouses.value.filter((item) => Boolean(item.activeAlert)).length);
    const dangerCount = computed(() => warehouses.value.filter((item) => item.healthLevel === GrainHealthLevel.DANGER).length);
    const offlineCount = computed(() => warehouses.value.filter((item) => item.offline).length);
    const pageTitle = "粮情总揽";

    const load = async (): Promise<void> => {
      loading.value = true;
      try {
        const data = await useAuthRequest(() => getIntelligentGrainDashboard({ sortBy: "alert-desc" }));
        dashboard.value = data;
        if (!selectedWarehouseId.value && data.warehouses.length > 0) {
          selectedWarehouseId.value = data.warehouses[0].warehouseId;
        }
      } catch (error) {
        message.error((error as Error).message || "加载粮情总览失败");
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void load();
    });

    const handleWarehouseSelect = (item: GrainWarehouseCard): void => {
      selectedWarehouseId.value = item.warehouseId;
      void router.push({ name: "intelligent-grain-archive-detail", query: { warehouseId: item.warehouseId } });
    };

    const slots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button onClick={load}>刷新</Button>
          <span class="ig-header-tip">智能粮情状态以本地表为准，告警由本服务闭环处理。</span>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <Spin spinning={loading.value}>
          <div class="ig-page ig-dashboard-page">
            <div class="ig-dashboard-note">
              <strong>指标说明：</strong>
              <span>温度为仓内最高温；趋势基于日平均最高温连续变化；储量为重量；IoT离线指仓房全部传感器连续多个采集周期无数据上报。</span>
            </div>

            <div class="ig-dashboard-filter">
              <span>筛选：</span>
              <Select
                value={areaFilter.value}
                options={areaOptions.value}
                style={{ width: "120px" }}
                onChange={(value: string) => (areaFilter.value = value)}
              />
              <Select
                value={grainFilter.value}
                options={grainOptions.value}
                style={{ width: "120px" }}
                onChange={(value: string) => (grainFilter.value = value)}
              />
              <Select
                value={healthFilter.value}
                options={healthOptions}
                style={{ width: "140px" }}
                onChange={(value: GrainHealthLevel | "") => (healthFilter.value = value)}
              />
              <Input v-model:value={keyword.value} placeholder="搜索仓房名称..." style={{ width: "180px" }} />
              <span class="ig-dashboard-filter__split" />
              <span>排序：</span>
              <Select
                value={sortBy.value}
                options={sortOptions}
                style={{ width: "170px" }}
                onChange={(value: "health-asc" | "health-desc" | "alert-desc") => (sortBy.value = value)}
              />
              <em>共 {filteredWarehouses.value.length} 个仓房</em>
            </div>

            <div class="ig-dashboard-main">
              <div class="ig-dashboard-card-grid">
                {filteredWarehouses.value.length > 0 ? (
                  filteredWarehouses.value.map((item) =>
                    renderWarehouseCard(item, item.warehouseId === selectedWarehouseId.value, () => handleWarehouseSelect(item)),
                  )
                ) : (
                  <Empty description="暂无仓房数据" />
                )}
              </div>

              <aside class="ig-dashboard-side">
                <section class="ig-dashboard-side-card">
                  <div class="ig-dashboard-side-card__head">
                    <strong>告警快览</strong>
                    <Button type="link" size="small" onClick={() => router.push({ name: "intelligent-grain-alerts" })}>
                      查看全部
                    </Button>
                  </div>
                  <div class="ig-dashboard-alert-list">
                    {(dashboard.value?.alertQuickList ?? []).length > 0 ? (
                      dashboard.value?.alertQuickList.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          class="ig-dashboard-alert-item"
                          type="button"
                          onClick={() => router.push({ name: "intelligent-grain-alert-detail", params: { id: item.id } })}
                        >
                          <i class={`is-level-${Math.min(item.level ?? 4, 4)}`} />
                          <span>
                            <strong>
                              {item.level}级 · {item.warehouseName}
                            </strong>
                            <em>
                              {item.alertTypeName} · {formatTime(item.triggeredAt)}
                            </em>
                          </span>
                        </button>
                      ))
                    ) : (
                      <Empty description="暂无告警" />
                    )}
                  </div>
                </section>

                <section class="ig-dashboard-side-card">
                  <div class="ig-dashboard-side-card__head">
                    <strong>运行概况</strong>
                    <span>{formatTime(dashboard.value?.refreshTime)}</span>
                  </div>
                  <div class="ig-dashboard-stat-list">
                    <div>
                      <span>仓房总数</span>
                      <strong>{dashboard.value?.total ?? 0}</strong>
                    </div>
                    <div>
                      <span>活跃告警</span>
                      <strong>{activeAlertCount.value}</strong>
                    </div>
                    <div>
                      <span>危险仓房</span>
                      <strong>{dangerCount.value}</strong>
                    </div>
                    <div>
                      <span>离线仓房</span>
                      <strong>{offlineCount.value}</strong>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </Spin>
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots} showFooter={false} />;
  },
});
