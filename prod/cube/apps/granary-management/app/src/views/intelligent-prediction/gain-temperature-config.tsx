import { Select } from "ant-design-vue";
import { computed, defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  LiangcangBoundWarehouseSimpleItem,
  LiangcangTemperatureLayerCode,
  LiangcangWarehouseCableListItem,
  LiangcangWarehouseTemperatureTrendConfigSaveParam,
  LiangcangWarehouseTemperatureTrendLayer,
} from "@ghcloud/cube-granary-management-service";
import { Button, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeGranaryManagementService } from "@/api/service";

import "./gain-temperature-config.less";

type TemperatureValueType = "max" | "min";
type LayerKey = "upper" | "middle" | "lower";

interface LayerConfig {
  key: LayerKey;
  title: string;
  scene: string;
  tone: string;
  selectedCableIds: number[];
  highLimit: number | undefined;
  lowLimit: number | undefined;
  valueType: TemperatureValueType | undefined;
}

const TEMPERATURE_VALUE_OPTIONS = [
  { label: "最高温", value: "max" },
  { label: "最低温", value: "min" },
];

const LAYER_ORDER: LayerKey[] = ["upper", "middle", "lower"];

const DEFAULT_LAYER_CONFIGS: LayerConfig[] = [
  {
    key: "upper",
    title: "上层",
    scene: "粮面侧",
    tone: "blue",
    selectedCableIds: [],
    highLimit: undefined,
    lowLimit: undefined,
    valueType: undefined,
  },
  {
    key: "middle",
    title: "中层",
    scene: "粮堆中部",
    tone: "gray",
    selectedCableIds: [],
    highLimit: undefined,
    lowLimit: undefined,
    valueType: undefined,
  },
  {
    key: "lower",
    title: "下层",
    scene: "仓底侧",
    tone: "orange",
    selectedCableIds: [],
    highLimit: undefined,
    lowLimit: undefined,
    valueType: undefined,
  },
];

const layerCodeToKey: Record<LiangcangTemperatureLayerCode, LayerKey> = {
  UPPER: "upper",
  MIDDLE: "middle",
  LOWER: "lower",
};

const layerKeyToCode: Record<LayerKey, LiangcangTemperatureLayerCode> = {
  upper: "UPPER",
  middle: "MIDDLE",
  lower: "LOWER",
};

const aggTypeToValueType = (value: string | undefined): TemperatureValueType => {
  if (value === "MIN") {
    return "min";
  }
  return "max";
};

const valueTypeToAggType = (value: TemperatureValueType): "MAX" | "MIN" => {
  if (value === "min") {
    return "MIN";
  }
  return "MAX";
};

const cloneDefaultLayers = (): LayerConfig[] =>
  DEFAULT_LAYER_CONFIGS.map((item) => ({ ...item, selectedCableIds: [...item.selectedCableIds] }));

const normalizeLayerConfigs = (layers: LiangcangWarehouseTemperatureTrendLayer[] | undefined): LayerConfig[] => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return cloneDefaultLayers();
  }
  const byCode = new Map<LayerKey, LiangcangWarehouseTemperatureTrendLayer>();
  layers.forEach((layer) => {
    const key = layerCodeToKey[layer.layerCode];
    if (key != null) {
      byCode.set(key, layer);
    }
  });
  return cloneDefaultLayers().map((item) => {
    const layer = byCode.get(item.key);
    if (layer == null) {
      return item;
    }
    return {
      ...item,
      title: layer.layerName || item.title,
      scene: layer.positionName || item.scene,
      selectedCableIds: Array.isArray(layer.selectedCableIds) ? [...layer.selectedCableIds] : [],
      highLimit: Number.isFinite(layer.highAlarmThreshold) ? layer.highAlarmThreshold : undefined,
      lowLimit: Number.isFinite(layer.lowAlarmThreshold) ? layer.lowAlarmThreshold : undefined,
      valueType: layer.layerAggType == null ? undefined : aggTypeToValueType(layer.layerAggType),
    };
  });
};

export const GainTemperatureConfig = defineComponent({
  name: "GainTemperatureConfig",
  setup: () => {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const warehouseOptions = ref<LiangcangBoundWarehouseSimpleItem[]>([]);
    const cableOptions = ref<LiangcangWarehouseCableListItem[]>([]);
    const selectedGranary = ref<number | null>(null);
    const loading = ref(false);
    const saving = ref(false);
    const totalValueType = ref<TemperatureValueType | undefined>(undefined);
    const totalHighLimit = ref<number | undefined>(undefined);
    const totalLowLimit = ref<number | undefined>(undefined);
    const layerConfigs = reactive<LayerConfig[]>(cloneDefaultLayers());

    const granarySelectOptions = computed(() =>
      warehouseOptions.value.map((item) => ({
        label: item.name ?? `仓房${item.warehouseId}`,
        value: item.warehouseId,
      })),
    );

    const cableLineOptions = computed(() => {
      const options = new Map<number, string>();
      cableOptions.value.forEach((item) => {
        options.set(item.cableId, item.cableNo === "" ? `线缆${item.cableId}` : item.cableNo);
      });
      layerConfigs.forEach((layer) => {
        layer.selectedCableIds.forEach((id) => {
          if (!options.has(id)) {
            options.set(id, `线缆${id}`);
          }
        });
      });
      return [...options.entries()].map(([value, label]) => ({ value, label }));
    });

    const replaceLayerConfigs = (next: LayerConfig[]): void => {
      layerConfigs.splice(0, layerConfigs.length, ...next);
    };

    const toggleCableLine = (layer: LayerConfig, cableId: number): void => {
      if (layer.selectedCableIds.includes(cableId)) {
        layer.selectedCableIds = layer.selectedCableIds.filter((item) => item !== cableId);
        return;
      }
      const usedLayer = layerConfigs.find((item) => item.key !== layer.key && item.selectedCableIds.includes(cableId));
      if (usedLayer != null) {
        message.warning(`该线缆已在${usedLayer.title}选择`);
        return;
      }
      layer.selectedCableIds = [...layer.selectedCableIds, cableId];
    };

    const loadWarehouseConfig = async (warehouseId: number): Promise<void> => {
      loading.value = true;
      try {
        const [cables, config] = await Promise.all([
          cubeGranaryManagementService.getWarehouseCableList(warehouseId),
          cubeGranaryManagementService.getWarehouseTemperatureTrendConfigDetail(warehouseId),
        ]);
        cableOptions.value = cables;
        totalValueType.value = aggTypeToValueType(config?.warehouseAggType);
        totalHighLimit.value = Number.isFinite(config?.highAlarmThreshold) ? config?.highAlarmThreshold : undefined;
        totalLowLimit.value = Number.isFinite(config?.lowAlarmThreshold) ? config?.lowAlarmThreshold : undefined;
        replaceLayerConfigs(normalizeLayerConfigs(config?.layers));
      } finally {
        loading.value = false;
      }
    };

    const loadWarehouses = async (): Promise<void> => {
      const warehouses = await cubeGranaryManagementService.getBoundWarehouseSimpleList();
      warehouseOptions.value = warehouses;
      if (warehouses.length === 0) {
        selectedGranary.value = null;
        cableOptions.value = [];
        totalValueType.value = undefined;
        totalHighLimit.value = undefined;
        totalLowLimit.value = undefined;
        replaceLayerConfigs(cloneDefaultLayers());
        return;
      }
      const fallbackWarehouseId = warehouses[0]?.warehouseId ?? null;
      const targetWarehouseId = selectedGranary.value ?? fallbackWarehouseId;
      selectedGranary.value = targetWarehouseId;
      if (targetWarehouseId != null) {
        await loadWarehouseConfig(targetWarehouseId);
      }
    };

    const saveConfig = async (): Promise<void> => {
      if (selectedGranary.value == null) {
        message.warning("请先选择仓房");
        return;
      }
      if (totalValueType.value == null) {
        message.warning("请选择汇总全仓温度取值");
        return;
      }
      if (totalHighLimit.value == null || totalLowLimit.value == null) {
        message.warning("请完善全仓预警线配置");
        return;
      }
      const hasInvalidLayer = layerConfigs.some((layer) => layer.valueType == null || layer.highLimit == null || layer.lowLimit == null);
      if (hasInvalidLayer) {
        message.warning("请完善分层阈值和汇总温度取值");
        return;
      }
      const payload: LiangcangWarehouseTemperatureTrendConfigSaveParam = {
        warehouseId: selectedGranary.value,
        highAlarmThreshold: totalHighLimit.value,
        lowAlarmThreshold: totalLowLimit.value,
        warehouseAggType: valueTypeToAggType(totalValueType.value),
        layers: LAYER_ORDER.map((key) => {
          const layer = layerConfigs.find((item) => item.key === key);
          return {
            layerCode: layerKeyToCode[key],
            layerName: layer?.title ?? "",
            positionName: layer?.scene ?? "",
            selectedCableIds: [...(layer?.selectedCableIds ?? [])],
            highAlarmThreshold: layer?.highLimit ?? 0,
            lowAlarmThreshold: layer?.lowLimit ?? 0,
            layerAggType: valueTypeToAggType(layer?.valueType ?? "max") as LiangcangWarehouseTemperatureTrendLayer["layerAggType"],
          };
        }),
      };
      saving.value = true;
      try {
        const ok = await cubeGranaryManagementService.saveWarehouseTemperatureTrendConfig(payload);
        if (!ok) {
          message.error("粮温配置保存失败");
          return;
        }
        message.success("粮温配置已保存");
        await loadWarehouseConfig(selectedGranary.value);
      } finally {
        saving.value = false;
      }
    };

    const goBack = (): void => {
      void router.back();
    };

    onMounted(() => {
      void loadWarehouses();
    });

    return (): VNode => (
      <CubeLayout title={pageTitle ?? "粮温监控配置"} showFooter={false}>
        {{
          "layout-header": () => (
            <div class="gain-temperature-config-toolbar">
              <Select
                value={selectedGranary.value ?? undefined}
                options={granarySelectOptions.value}
                class="gain-temperature-config-granary-select"
                onChange={(value: number) => {
                  selectedGranary.value = value;
                  void loadWarehouseConfig(value);
                }}
              />
              <div class="gain-temperature-config-actions">
                <Button onClick={goBack}>返回</Button>
                <Button type="primary" loading={saving.value} disabled={selectedGranary.value == null} onClick={() => void saveConfig()}>
                  保存配置
                </Button>
              </div>
            </div>
          ),
          "layout-content": () => (
            <div class="gain-temperature-config-page">
              <section class="gain-temperature-config-section total-section">
                <section class={["layer-config-card", "is-total"]}>
                  <div class="layer-config-header">
                    <strong>全仓</strong>
                    <span>整体汇总</span>
                  </div>
                  <div class="layer-config-row threshold-row">
                    <label>
                      <span>超温预警线</span>
                      <input
                        type="number"
                        value={totalHighLimit.value ?? ""}
                        placeholder="请输入"
                        onInput={(e) => {
                          const nextValue = (e.target as HTMLInputElement).value.trim();
                          totalHighLimit.value = nextValue === "" ? undefined : Number(nextValue);
                        }}
                      />
                      <em>℃</em>
                    </label>
                    <label>
                      <span>低温预警线</span>
                      <input
                        type="number"
                        value={totalLowLimit.value ?? ""}
                        placeholder="请输入"
                        onInput={(e) => {
                          const nextValue = (e.target as HTMLInputElement).value.trim();
                          totalLowLimit.value = nextValue === "" ? undefined : Number(nextValue);
                        }}
                      />
                      <em>℃</em>
                    </label>
                  </div>
                  <div class="layer-config-summary-row">
                    <span class="temperature-field-label">汇总温度取值</span>
                    <Select
                      value={totalValueType.value}
                      options={TEMPERATURE_VALUE_OPTIONS}
                      placeholder="请选择"
                      class="layer-temperature-select"
                      onChange={(value: TemperatureValueType) => {
                        totalValueType.value = value;
                      }}
                    />
                  </div>
                </section>
              </section>

              <div class="layer-config-list">
                {layerConfigs.map((layer) => (
                  <section key={layer.key} class={["layer-config-card", `is-${layer.tone}`]}>
                    <div class="layer-config-header">
                      <strong>{layer.title}</strong>
                      <span>{layer.scene}</span>
                    </div>
                    <div class="layer-config-row is-lines">
                      <div class="layer-config-label">选择归属线缆（可多选）</div>
                      <div class="cable-line-list">
                        {cableLineOptions.value.length === 0 ? (
                          <span>暂无可选线缆</span>
                        ) : (
                          cableLineOptions.value.map((line) => {
                            const selected = layer.selectedCableIds.includes(line.value);
                            const selectedByOtherLayer = layerConfigs.some(
                              (item) => item.key !== layer.key && item.selectedCableIds.includes(line.value),
                            );
                            return (
                              <button
                                key={line.value}
                                type="button"
                                class={[
                                  "cable-line-button",
                                  selected ? "is-selected" : "",
                                  selectedByOtherLayer && !selected ? "is-disabled" : "",
                                ]}
                                disabled={selectedByOtherLayer && !selected}
                                title={selectedByOtherLayer && !selected ? "已被其他层选择" : ""}
                                onClick={() => {
                                  toggleCableLine(layer, line.value);
                                }}
                              >
                                <span>{line.label}</span>
                                {selected ? <i>×</i> : null}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                    <div class="layer-config-row threshold-row">
                      <label>
                        <span>超温预警线</span>
                        <input
                          type="number"
                          value={layer.highLimit ?? ""}
                          placeholder="请输入"
                          onInput={(e) => {
                            const nextValue = (e.target as HTMLInputElement).value.trim();
                            layer.highLimit = nextValue === "" ? undefined : Number(nextValue);
                          }}
                        />
                        <em>℃</em>
                      </label>
                      <label>
                        <span>低温预警线</span>
                        <input
                          type="number"
                          value={layer.lowLimit ?? ""}
                          placeholder="请输入"
                          onInput={(e) => {
                            const nextValue = (e.target as HTMLInputElement).value.trim();
                            layer.lowLimit = nextValue === "" ? undefined : Number(nextValue);
                          }}
                        />
                        <em>℃</em>
                      </label>
                    </div>
                    <div class="layer-config-summary-row">
                      <span class="temperature-field-label">汇总温度取值</span>
                      <Select
                        value={layer.valueType}
                        options={TEMPERATURE_VALUE_OPTIONS}
                        placeholder="请选择"
                        class="layer-temperature-select"
                        onChange={(value: TemperatureValueType) => {
                          layer.valueType = value;
                        }}
                      />
                    </div>
                  </section>
                ))}
              </div>
              {loading.value ? <div class="gain-temperature-config-loading">配置加载中...</div> : null}
            </div>
          ),
        }}
      </CubeLayout>
    );
  },
});
