import { Select } from "ant-design-vue";
import { computed, defineComponent, onMounted, ref, type VNode } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  LiangcangBoundWarehouseSimpleItem,
  LiangcangTemperatureAlertGlobalConfigVO,
  LiangcangTemperatureAlertWarehouseConfigVO,
} from "@ghcloud/cube-granary-management-service";
import { Button, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { createDefaultGlobalConfig, normalizeGlobalConfig } from "./temperature-trend-alert-shared";
import { cubeGranaryManagementService } from "@/api/service";

import "./temperature-trend-alert.less";

type ConfigTabKey = "global" | "warehouse";

export const TemperatureTrendAlertConfig = defineComponent({
  name: "TemperatureTrendAlertConfig",
  setup: () => {
    const { pageTitle } = usePageName();
    const activeConfigTab = ref<ConfigTabKey>("global");
    const warehouses = ref<LiangcangBoundWarehouseSimpleItem[]>([]);
    const globalConfig = ref<LiangcangTemperatureAlertGlobalConfigVO>(createDefaultGlobalConfig());
    const savingGlobal = ref(false);
    const selectedConfigWarehouseId = ref<number | null>(null);
    const warehouseConfig = ref<LiangcangTemperatureAlertWarehouseConfigVO | null>(null);
    const savingWarehouse = ref(false);

    const warehouseOptions = computed(() =>
      warehouses.value.map((item) => ({
        label: item.name === "" ? `仓房${item.warehouseId}` : item.name,
        value: item.warehouseId,
      })),
    );

    const effectiveWarehouseConfig = computed(() => warehouseConfig.value?.effectiveConfig ?? globalConfig.value);

    const updateGlobalField = (key: keyof LiangcangTemperatureAlertGlobalConfigVO, raw: string): void => {
      const numeric = Number(raw);
      globalConfig.value = {
        ...globalConfig.value,
        [key]: Number.isFinite(numeric) ? numeric : 0,
      };
    };

    const patchWarehouseConfig = (patch: Partial<LiangcangTemperatureAlertWarehouseConfigVO>): void => {
      if (warehouseConfig.value == null) {
        return;
      }
      warehouseConfig.value = {
        ...warehouseConfig.value,
        ...patch,
      };
    };

    const patchWarehouseEffectiveConfig = (patch: Partial<LiangcangTemperatureAlertGlobalConfigVO>): void => {
      if (warehouseConfig.value == null) {
        return;
      }
      warehouseConfig.value = {
        ...warehouseConfig.value,
        effectiveConfig: {
          ...effectiveWarehouseConfig.value,
          ...patch,
        },
      };
    };

    const loadGlobalConfig = async (): Promise<void> => {
      globalConfig.value = normalizeGlobalConfig(await cubeGranaryManagementService.getTemperatureAlertGlobalConfig());
    };

    const loadWarehouseConfig = async (warehouseId: number): Promise<void> => {
      warehouseConfig.value = await cubeGranaryManagementService.getTemperatureAlertWarehouseConfig(warehouseId);
    };

    const loadWarehouses = async (): Promise<void> => {
      const rows = await cubeGranaryManagementService.getBoundWarehouseSimpleList();
      warehouses.value = rows;
      const firstWarehouseId = rows[0]?.warehouseId ?? null;
      selectedConfigWarehouseId.value = selectedConfigWarehouseId.value ?? firstWarehouseId;
      if (selectedConfigWarehouseId.value != null) {
        await loadWarehouseConfig(selectedConfigWarehouseId.value);
      }
    };

    const saveGlobalConfig = async (): Promise<void> => {
      savingGlobal.value = true;
      try {
        const ok = await cubeGranaryManagementService.saveTemperatureAlertGlobalConfig({
          consecutiveDays: globalConfig.value.consecutiveDays,
          minDailyIncrease: globalConfig.value.minDailyIncrease,
          warningThreshold: globalConfig.value.warningThreshold,
          approachMargin: globalConfig.value.approachMargin,
        });
        if (!ok) {
          message.error("全局配置保存失败");
          return;
        }
        message.success("全局配置已保存");
        await loadGlobalConfig();
      } finally {
        savingGlobal.value = false;
      }
    };

    const saveWarehouseConfig = async (): Promise<void> => {
      if (warehouseConfig.value == null || selectedConfigWarehouseId.value == null) {
        message.warning("请先选择仓房");
        return;
      }
      savingWarehouse.value = true;
      try {
        const cfg = warehouseConfig.value;
        const effective = effectiveWarehouseConfig.value;
        const ok = await cubeGranaryManagementService.saveTemperatureAlertWarehouseConfig({
          warehouseId: selectedConfigWarehouseId.value,
          useGlobalDefault: cfg.useGlobalDefault,
          consecutiveDays: cfg.useGlobalDefault ? null : effective.consecutiveDays,
          minDailyIncrease: cfg.useGlobalDefault ? null : effective.minDailyIncrease,
          warningThreshold: cfg.useGlobalDefault ? null : effective.warningThreshold,
          approachMargin: cfg.useGlobalDefault ? null : effective.approachMargin,
          popupEnabled: cfg.popupEnabled,
        });
        if (!ok) {
          message.error("单仓配置保存失败");
          return;
        }
        message.success("单仓配置已保存");
        await loadWarehouseConfig(selectedConfigWarehouseId.value);
      } finally {
        savingWarehouse.value = false;
      }
    };

    const resetWarehouseConfig = async (): Promise<void> => {
      if (selectedConfigWarehouseId.value == null) {
        return;
      }
      const ok = await cubeGranaryManagementService.resetTemperatureAlertWarehouseConfig(selectedConfigWarehouseId.value);
      if (!ok) {
        message.error("恢复全局默认失败");
        return;
      }
      message.success("已恢复全局默认");
      await loadWarehouseConfig(selectedConfigWarehouseId.value);
    };

    onMounted(() => {
      void Promise.all([loadGlobalConfig(), loadWarehouses()]);
    });

    return (): VNode => (
      <CubeLayout title={pageTitle ?? "粮仓温度趋势预警"} showFooter={false}>
        {{
          "layout-content": () => (
            <div class="temperature-alert-page">
              <section class="temperature-alert-panel temperature-alert-single-panel">
                <div class="temperature-alert-sub-tabs">
                  {(
                    [
                      { key: "global", label: "全局配置" },
                      { key: "warehouse", label: "单仓配置" },
                    ] as Array<{ key: ConfigTabKey; label: string }>
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      class={activeConfigTab.value === item.key ? "is-active" : ""}
                      onClick={() => {
                        activeConfigTab.value = item.key;
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {activeConfigTab.value === "global" ? (
                  <div>
                    <div class="temperature-alert-panel-title">全局默认配置</div>
                    <div class="temperature-alert-form">
                      <label>
                        <span>连续上升天数</span>
                        <input
                          type="number"
                          value={globalConfig.value.consecutiveDays}
                          onInput={(e) => updateGlobalField("consecutiveDays", (e.target as HTMLInputElement).value)}
                        />
                        <em>天</em>
                      </label>
                      <label>
                        <span>日均最小增幅</span>
                        <input
                          type="number"
                          step="0.1"
                          value={globalConfig.value.minDailyIncrease}
                          onInput={(e) => updateGlobalField("minDailyIncrease", (e.target as HTMLInputElement).value)}
                        />
                        <em>℃/天</em>
                      </label>
                      <label>
                        <span>预警阈值</span>
                        <input
                          type="number"
                          step="0.5"
                          value={globalConfig.value.warningThreshold}
                          onInput={(e) => updateGlobalField("warningThreshold", (e.target as HTMLInputElement).value)}
                        />
                        <em>℃</em>
                      </label>
                      <label>
                        <span>逼近余量</span>
                        <input
                          type="number"
                          step="0.5"
                          value={globalConfig.value.approachMargin}
                          onInput={(e) => updateGlobalField("approachMargin", (e.target as HTMLInputElement).value)}
                        />
                        <em>℃</em>
                      </label>
                    </div>
                    <Button type="primary" loading={savingGlobal.value} onClick={() => void saveGlobalConfig()}>
                      保存全局配置
                    </Button>
                  </div>
                ) : null}

                {activeConfigTab.value === "warehouse" ? (
                  <div>
                    <div class="temperature-alert-panel-title">单仓配置</div>
                    <Select
                      class="temperature-alert-select"
                      value={selectedConfigWarehouseId.value ?? undefined}
                      options={warehouseOptions.value}
                      placeholder="请选择仓房"
                      onChange={(value: number) => {
                        selectedConfigWarehouseId.value = value;
                        void loadWarehouseConfig(value);
                      }}
                    />
                    {warehouseConfig.value == null ? (
                      <div class="temperature-alert-empty">暂无单仓配置数据</div>
                    ) : (
                      <div class="temperature-alert-warehouse-config">
                        <div class="temperature-alert-meta">
                          <strong>{warehouseConfig.value.warehouseName || "--"}</strong>
                          <span>品种：{warehouseConfig.value.grainType || "--"}</span>
                        </div>
                        <label class="temperature-alert-switch">
                          <span>使用全局默认</span>
                          <input
                            type="checkbox"
                            checked={warehouseConfig.value.useGlobalDefault}
                            onChange={(e) => patchWarehouseConfig({ useGlobalDefault: (e.target as HTMLInputElement).checked })}
                          />
                        </label>
                        <div class={["temperature-alert-form", warehouseConfig.value.useGlobalDefault ? "is-disabled" : ""]}>
                          <label>
                            <span>连续上升天数</span>
                            <input
                              disabled={warehouseConfig.value.useGlobalDefault}
                              type="number"
                              value={effectiveWarehouseConfig.value.consecutiveDays}
                              onInput={(e) =>
                                patchWarehouseEffectiveConfig({ consecutiveDays: Number((e.target as HTMLInputElement).value) })
                              }
                            />
                            <em>天</em>
                          </label>
                          <label>
                            <span>日均最小增幅</span>
                            <input
                              disabled={warehouseConfig.value.useGlobalDefault}
                              type="number"
                              step="0.1"
                              value={effectiveWarehouseConfig.value.minDailyIncrease}
                              onInput={(e) =>
                                patchWarehouseEffectiveConfig({ minDailyIncrease: Number((e.target as HTMLInputElement).value) })
                              }
                            />
                            <em>℃/天</em>
                          </label>
                          <label>
                            <span>预警阈值</span>
                            <input
                              disabled={warehouseConfig.value.useGlobalDefault}
                              type="number"
                              step="0.5"
                              value={effectiveWarehouseConfig.value.warningThreshold}
                              onInput={(e) =>
                                patchWarehouseEffectiveConfig({ warningThreshold: Number((e.target as HTMLInputElement).value) })
                              }
                            />
                            <em>℃</em>
                          </label>
                          <label>
                            <span>逼近余量</span>
                            <input
                              disabled={warehouseConfig.value.useGlobalDefault}
                              type="number"
                              step="0.5"
                              value={effectiveWarehouseConfig.value.approachMargin}
                              onInput={(e) =>
                                patchWarehouseEffectiveConfig({ approachMargin: Number((e.target as HTMLInputElement).value) })
                              }
                            />
                            <em>℃</em>
                          </label>
                        </div>
                        <label class="temperature-alert-switch">
                          <span>后台弹窗提醒</span>
                          <input
                            type="checkbox"
                            checked={warehouseConfig.value.popupEnabled}
                            onChange={(e) => patchWarehouseConfig({ popupEnabled: (e.target as HTMLInputElement).checked })}
                          />
                        </label>
                        <div class="temperature-alert-actions">
                          <Button type="primary" loading={savingWarehouse.value} onClick={() => void saveWarehouseConfig()}>
                            保存
                          </Button>
                          <Button onClick={() => void resetWarehouseConfig()}>恢复全局默认</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </section>
            </div>
          ),
        }}
      </CubeLayout>
    );
  },
});
