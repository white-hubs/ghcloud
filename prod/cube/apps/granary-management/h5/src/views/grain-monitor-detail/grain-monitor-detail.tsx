import { Icon } from "vant";
import { computed, defineComponent, onMounted, shallowRef, type VNode } from "vue";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { LiangcangBoundWarehouseSimpleItem, LiangcangWarehouseLocationCardInfoVO } from "@ghcloud/cube-granary-management-service";

import { cubeGranaryManagementService } from "@/api/server";

import styles from "./grain-monitor-detail.module.less";

const EMPTY_TEXT = "--";

const renderGauge = (value: string, label: string, color: string) => (
  <div class={styles.temperatureGauge}>
    <div class={styles.temperatureDial} style={{ "--dial-color": color } as Record<string, string>}>
      <span>{value}°C</span>
    </div>
    <div class={styles.temperatureLabel}>{label}</div>
  </div>
);

interface EnvironmentItem {
  key: string;
  label: string;
  value: string;
  unit: string;
  status: string;
  icon: string;
}

const formatText = (value: string | number | null | undefined): string => {
  if (value == null) {
    return EMPTY_TEXT;
  }
  const text = String(value).trim();
  return text === "" ? EMPTY_TEXT : text;
};

const formatNumber = (value: number | null | undefined, fractionDigits = 2): string => {
  if (value == null || !Number.isFinite(value)) {
    return EMPTY_TEXT;
  }
  return value.toFixed(fractionDigits).replace(/\.?0+$/, "");
};

const formatFixed = (value: number | null | undefined, fractionDigits = 2): string => {
  if (value == null || !Number.isFinite(value)) {
    return EMPTY_TEXT;
  }
  return value.toFixed(fractionDigits);
};

const formatDateTime = (value: string | null | undefined): string => {
  if (value == null || value.trim() === "") {
    return EMPTY_TEXT;
  }
  return value.includes("T") ? value.replace("T", " ").slice(0, 19) : value.slice(0, 19);
};

const normalizeO2Percent = (value: number | null | undefined): number | null => {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }
  return value > 0 && value <= 1 ? value * 100 : value;
};

const toGasVolPercent = (type: "co2" | "o2" | "ph3", value: number | null | undefined): number | null => {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }
  if (type === "o2") {
    return normalizeO2Percent(value);
  }
  return value <= 1 ? value : value / 10000;
};

const formatGas = (type: "co2" | "o2" | "ph3", value: number | null | undefined): string => {
  const vol = toGasVolPercent(type, value);
  return vol == null ? EMPTY_TEXT : formatFixed(vol);
};

const remainingVolume = (detail: LiangcangWarehouseLocationCardInfoVO | null): number | null => {
  if (detail == null) {
    return null;
  }
  if (detail.remainingVolume != null && Number.isFinite(detail.remainingVolume)) {
    return detail.remainingVolume;
  }
  if (detail.granaryVolume == null || detail.materialVolume == null) {
    return null;
  }
  return detail.granaryVolume - detail.materialVolume;
};

const renderEnvironmentItem = (item: EnvironmentItem) => (
  <div class={styles.environmentItem} key={item.key}>
    <div class={styles.environmentLabel}>
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </div>
    <div class={styles.environmentValue}>
      {item.value}
      <span>{item.unit}</span>
    </div>
    <div class={styles.statusBadge}>{item.status}</div>
  </div>
);

export const GrainMonitorDetail = defineComponent({
  name: "GrainMonitorDetail",
  setup: () => {
    const warehouseList = shallowRef<LiangcangBoundWarehouseSimpleItem[]>([]);
    const selectedWarehouseId = shallowRef<number | null>(null);
    const selectedDetail = shallowRef<LiangcangWarehouseLocationCardInfoVO | null>(null);
    const loading = shallowRef(false);
    const errorText = shallowRef("");
    const warehouseDropdownVisible = shallowRef(false);

    const selectedWarehouse = computed(() => warehouseList.value.find((item) => item.warehouseId === selectedWarehouseId.value) ?? null);

    const warehouseOptions = computed(() => [...warehouseList.value].sort((left, right) => left.warehouseId - right.warehouseId));

    const usageRate = computed(() => {
      const value = selectedDetail.value?.usageRate;
      if (value == null || !Number.isFinite(value)) {
        return 0;
      }
      return Math.max(0, Math.min(100, value));
    });

    const environmentItems = computed<EnvironmentItem[]>(() => [
      { key: "humidity", label: "湿度", value: formatFixed(selectedDetail.value?.humidity), unit: "%RH", status: "正常", icon: "flower-o" },
      { key: "ph3", label: "PH3", value: formatGas("ph3", selectedDetail.value?.gasPh3), unit: "%VOL", status: "正常", icon: "cluster-o" },
      { key: "co2", label: "CO2", value: formatGas("co2", selectedDetail.value?.gasCo2), unit: "%VOL", status: "正常", icon: "flower-o" },
      { key: "o2", label: "O2", value: formatGas("o2", selectedDetail.value?.gasO2), unit: "%VOL", status: "正常", icon: "exchange" },
    ]);

    const loadDetail = async (warehouseId: number): Promise<void> => {
      loading.value = true;
      errorText.value = "";
      try {
        selectedDetail.value = await cubeGranaryManagementService.getWarehouseLocationCardInfo(warehouseId);
        if (selectedDetail.value == null) {
          errorText.value = "未查询到该粮仓信息";
        }
      } catch {
        selectedDetail.value = null;
        errorText.value = "粮仓信息查询失败";
      } finally {
        loading.value = false;
      }
    };

    const loadWarehouses = async (): Promise<void> => {
      loading.value = true;
      errorText.value = "";
      try {
        const list = await cubeGranaryManagementService.getBoundWarehouseSimpleList();
        warehouseList.value = [...list].sort((left, right) => left.warehouseId - right.warehouseId);
        const first = warehouseList.value[0];
        if (first == null) {
          selectedWarehouseId.value = null;
          selectedDetail.value = null;
          errorText.value = "暂无已绑定粮仓";
          return;
        }
        selectedWarehouseId.value = first.warehouseId;
        await loadDetail(first.warehouseId);
      } catch {
        warehouseList.value = [];
        selectedWarehouseId.value = null;
        selectedDetail.value = null;
        errorText.value = "粮仓列表查询失败";
      } finally {
        loading.value = false;
      }
    };

    const toggleWarehouseDropdown = (): void => {
      if (loading.value || warehouseOptions.value.length === 0) {
        return;
      }
      warehouseDropdownVisible.value = !warehouseDropdownVisible.value;
    };

    const selectWarehouse = (warehouse: LiangcangBoundWarehouseSimpleItem): void => {
      warehouseDropdownVisible.value = false;
      if (warehouse.warehouseId === selectedWarehouseId.value) {
        return;
      }
      selectedWarehouseId.value = warehouse.warehouseId;
      void loadDetail(warehouse.warehouseId);
    };

    document.title = "粮情监测详情";

    onMounted(() => {
      void loadWarehouses();
    });

    const renderWarehouseSelect = (): VNode =>
      (
        <div class={styles.warehouseSelectWrap}>
          <button
            class={styles.warehouseSelectTrigger}
            type="button"
            disabled={loading.value || warehouseOptions.value.length === 0}
            onClick={toggleWarehouseDropdown}
          >
            <span>{formatText(selectedWarehouse.value?.name)}</span>
            <Icon name={warehouseDropdownVisible.value ? "arrow-up" : "arrow-down"} class={styles.selectArrow} />
          </button>
          {warehouseDropdownVisible.value ? (
            <div class={styles.warehouseDropdown}>
              {warehouseOptions.value.map((item) => (
                <button
                  key={item.warehouseId}
                  class={[styles.warehouseOption, item.warehouseId === selectedWarehouseId.value ? styles.warehouseOptionActive : ""]}
                  type="button"
                  onClick={() => {
                    selectWarehouse(item);
                  }}
                >
                  <span>{item.name}</span>
                  {item.warehouseId === selectedWarehouseId.value ? <Icon name="success" /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) as unknown as VNode;

    return () => (
      <>
        <CubeNavBar showBack class={styles.navbar} title="粮情监测详情" rightSlot={renderWarehouseSelect()} />
        <main class={styles.page}>
          {loading.value ? <div class={styles.stateCard}>加载中...</div> : null}
          {!loading.value && errorText.value !== "" ? <div class={styles.stateCard}>{errorText.value}</div> : null}
          <section class={styles.infoCard}>
            <div class={styles.infoGrid}>
              <div class={styles.infoItem}>
                <span>仓号</span>
                <strong>{formatText(selectedDetail.value?.granaryName ?? selectedWarehouse.value?.name)}</strong>
              </div>
              <div class={styles.infoItem}>
                <span>货位编号</span>
                <strong>{formatText(selectedDetail.value?.positionCode)}</strong>
              </div>
              <div class={styles.infoItem}>
                <span>仓型</span>
                <strong>{formatText(selectedDetail.value?.category ?? selectedWarehouse.value?.type)}</strong>
              </div>
              <div class={styles.infoItem}>
                <span>等级</span>
                <strong>{formatText(selectedDetail.value?.level)}</strong>
              </div>
            </div>
          </section>

          <section class={[styles.card, styles.storageCard]}>
            <div class={styles.usageRing} style={{ "--usage-rate": `${usageRate.value}%` } as Record<string, string>}>
              <span>{formatNumber(usageRate.value)}%</span>
            </div>
            <div>
              <div class={styles.storageTitle}>
                {formatText(selectedDetail.value?.category ?? selectedWarehouse.value?.type)}
                <span>仓容使用率</span>
              </div>
              <div class={styles.storageWeight}>
                {formatNumber(selectedDetail.value?.materialWeight)}
                <span>吨</span>
              </div>
              <div class={styles.storageLabel}>存储重量</div>
            </div>
          </section>

          <section class={[styles.card, styles.capacityCard]}>
            <div>
              <span>总仓容</span>
              <strong>{formatNumber(selectedDetail.value?.granaryVolume)}</strong>
              <em>m³</em>
            </div>
            <div>
              <span>已用</span>
              <strong>{formatNumber(selectedDetail.value?.materialVolume)}</strong>
              <em>m³</em>
            </div>
            <div>
              <span>剩余</span>
              <strong>{formatNumber(remainingVolume(selectedDetail.value))}</strong>
              <em>m³</em>
            </div>
          </section>

          <section class={[styles.card, styles.timeCard]}>
            <div>
              <Icon name="clock-o" />
              入仓时间
            </div>
            <strong>{formatDateTime(selectedDetail.value?.inboundTime)}</strong>
          </section>

          <section class={styles.monitorCard}>
            <header class={styles.sectionHeader}>
              <h2>温度监测</h2>
              <span>监测中</span>
            </header>
            <div class={styles.temperaturePanel}>
              {renderGauge(formatFixed(selectedDetail.value?.tempMax), "最高温度", "#ff5a63")}
              {renderGauge(formatFixed(selectedDetail.value?.tempMin), "最低温度", "#338df2")}
              {renderGauge(formatFixed(selectedDetail.value?.tempAvg), "平均温度", "#5bd792")}
            </div>
          </section>

          <section class={styles.monitorCard}>
            <header class={styles.sectionHeader}>
              <h2>环境监测</h2>
              <span>监测中</span>
            </header>
            <div class={styles.environmentGrid}>{environmentItems.value.map(renderEnvironmentItem)}</div>
          </section>
        </main>
      </>
    );
  },
});
