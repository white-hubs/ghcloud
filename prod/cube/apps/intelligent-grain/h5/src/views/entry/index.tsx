import dayjs, { type Dayjs } from "dayjs";
import { Empty, PullRefresh, Tab, Tabs, Tag, showToast } from "vant";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import {
  GrainAlertStatus,
  GrainHealthLevel,
  type GrainAlertListItem,
  type GrainAlertPageResult,
  type GrainArchiveTrend,
  type GrainMobileSummary,
  type GrainWarehouseCard,
} from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  getIntelligentGrainArchiveTrend,
  getIntelligentGrainMobileSummary,
  pageIntelligentGrainAlerts,
} from "@ghcloud/cube-services-client/intelligent-grain.client";

const HEALTH_LABEL: Record<GrainHealthLevel, string> = {
  [GrainHealthLevel.GOOD]: "健康",
  [GrainHealthLevel.WARN]: "关注",
  [GrainHealthLevel.DANGER]: "危险",
};

const METRIC_LABEL: Record<string, string> = {
  WEIGHT: "储量",
  VOLUME: "体积",
  HUMIDITY: "湿度",
  O2: "O2",
  CO2: "CO2",
  H2S: "H2S",
  TEMP_MAX: "最高粮温",
  TEMPERATURE: "粮温",
};

const ALERT_LEVEL_LABEL: Record<number, string> = {
  1: "一级",
  2: "二级",
  3: "三级",
  4: "四级",
};

function toDayjs(value: unknown): Dayjs | undefined {
  if (value == null) {
    return undefined;
  }
  if (value instanceof Date) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : undefined;
  }
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value.map((item) => Number(item));
    if ([year, month, day, hour, minute, second, nano].some((item) => Number.isNaN(item))) {
      return undefined;
    }
    const parsed = dayjs(new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1_000_000)));
    return parsed.isValid() ? parsed : undefined;
  }
  if (typeof value === "number") {
    const milliseconds = value < 10_000_000_000 ? value * 1000 : value;
    const parsed = dayjs(milliseconds);
    return parsed.isValid() ? parsed : undefined;
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (text === "") {
      return undefined;
    }
    if (/^\d+$/.test(text)) {
      const timestamp = Number(text);
      const milliseconds = text.length <= 10 ? timestamp * 1000 : timestamp;
      const parsed = dayjs(milliseconds);
      return parsed.isValid() ? parsed : undefined;
    }
    const parsed = dayjs(text);
    return parsed.isValid() ? parsed : undefined;
  }
  return undefined;
}

function formatTime(value?: unknown): string {
  const parsed = toDayjs(value);
  if (parsed === undefined) {
    return "--";
  }
  return parsed.format("YYYY-MM-DD HH:mm");
}

function formatRelativeTime(value?: unknown): string {
  const parsed = toDayjs(value);
  if (parsed === undefined) {
    return "--";
  }
  const minutes = Math.max(0, dayjs().diff(parsed, "minute"));
  if (minutes < 1) {
    return "刚刚";
  }
  if (minutes < 60) {
    return `${minutes}分钟前`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}小时前`;
  }
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}天前` : parsed.format("M/D HH:mm");
}

function formatTrendDate(value?: unknown): string {
  const parsed = toDayjs(value);
  return parsed === undefined ? "--" : parsed.format("M/D");
}

function metricUnitText(unit?: string): string {
  const normalized = unit?.trim();
  if (!normalized) {
    return "";
  }
  if (["C", "℃", "°C"].includes(normalized)) {
    return "℃";
  }
  if (normalized.toLowerCase() === "t") {
    return "吨";
  }
  return normalized;
}

function metricText(metric?: GrainWarehouseCard["temperature"], unitOverride?: string): string {
  if (!metric || metric.value === undefined || metric.value === null) {
    return "--";
  }
  return `${metric.value}${unitOverride ?? metricUnitText(metric.unit)}`;
}

function metricHint(metric?: GrainWarehouseCard["temperature"], normalText = "状态正常"): string {
  if (!metric || metric.value === undefined || metric.value === null) {
    return "暂无采集数据";
  }
  if (metric.status === "OFFLINE") {
    return "设备离线";
  }
  if (metric.status === "ALARM") {
    return "已触发阈值";
  }
  return normalText;
}

function trendMetricText(value?: GrainArchiveTrend): string {
  const seriesName = value?.series?.[0]?.name?.trim();
  if (seriesName) {
    return seriesName;
  }
  const metric = value?.metric?.trim();
  return metric ? (METRIC_LABEL[metric.toUpperCase()] ?? metric) : "--";
}

function metricStatusClass(metric?: GrainWarehouseCard["temperature"]): string {
  if (metric?.status === "ALARM") {
    return "is-danger";
  }
  if (metric?.status === "OFFLINE") {
    return "is-muted";
  }
  return "is-normal";
}

function healthClass(warehouse?: GrainWarehouseCard): string {
  if (warehouse?.offline) {
    return "is-offline";
  }
  if (warehouse?.healthLevel === GrainHealthLevel.DANGER) {
    return "is-danger";
  }
  if (warehouse?.healthLevel === GrainHealthLevel.WARN) {
    return "is-warn";
  }
  return "is-good";
}

function healthSummary(warehouse?: GrainWarehouseCard): string {
  if (warehouse?.offline) {
    return "离线 · 数据中断";
  }
  const label = warehouse?.healthLevel ? HEALTH_LABEL[warehouse.healthLevel] : "未知";
  return `${label} · 四维度加权`;
}

function emptyAlertPage(records: GrainAlertListItem[] = []): GrainAlertPageResult {
  return {
    total: records.length,
    pages: records.length > 0 ? 1 : 0,
    records,
    tabCounts: {
      ALL: records.length,
      [GrainAlertStatus.PENDING]: records.filter((item) => item.status === GrainAlertStatus.PENDING).length,
    },
  };
}

function alertLevelLabel(level: number): string {
  return ALERT_LEVEL_LABEL[level] ?? `${level}级`;
}

function alertLevelClass(level: number): string {
  if (level <= 1) {
    return "is-level-1";
  }
  if (level === 2) {
    return "is-level-2";
  }
  if (level === 3) {
    return "is-level-3";
  }
  return "is-level-4";
}

function alertDescription(alert: GrainAlertListItem): string {
  const current = alert.currentValueText?.trim();
  const threshold = alert.thresholdText?.trim();
  return [alert.alertTypeName, current && threshold ? `${current}/${threshold}` : current || threshold].filter(Boolean).join("  ");
}

function gasRows(metric?: GrainWarehouseCard["gas"]): Array<{ code: string; label: string; value: string; className: string }> {
  const metricCode = metric?.metricCode?.toUpperCase();
  return [
    { code: "O2", label: "O₂" },
    { code: "CO2", label: "CO₂" },
    { code: "H2S", label: "H₂S" },
  ].map((item) => ({
    ...item,
    value: metricCode === item.code ? metricText(metric) : "--",
    className: metricCode === item.code ? metricStatusClass(metric) : "is-muted",
  }));
}

function trendLabels(points: GrainArchiveTrend["series"][number]["points"]): Array<{ key: string; label: string }> {
  if (points.length <= 4) {
    return points.map((point) => ({ key: String(point.time), label: formatTrendDate(point.time) }));
  }
  const indexes = Array.from(
    new Set([0, Math.floor((points.length - 1) / 3), Math.floor(((points.length - 1) * 2) / 3), points.length - 1]),
  );
  return indexes.map((index) => ({ key: `${index}-${points[index]?.time ?? ""}`, label: formatTrendDate(points[index]?.time) }));
}

function trendChart(value?: GrainArchiveTrend): {
  labels: Array<{ key: string; label: string }>;
  linePoints: string;
  points: Array<{ key: string; x: number; y: number; triggered?: boolean }>;
  threshold?: { y: number; label: string };
} {
  const points = value?.series?.[0]?.points?.slice(-7) ?? [];
  const numericPoints = points.map((point) => ({ ...point, value: Number(point.value ?? 0) }));
  const values = numericPoints.map((point) => point.value);
  const threshold = value?.thresholds?.find((item) => Number.isFinite(Number(item.value)));
  const thresholdValue = threshold == null ? undefined : Number(threshold.value);
  if (numericPoints.length === 0) {
    return { labels: [], linePoints: "", points: [] };
  }
  const allValues = thresholdValue === undefined ? values : [...values, thresholdValue];
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const spread = rawMax - rawMin || Math.max(rawMax * 0.2, 1);
  const min = rawMin - spread * 0.18;
  const max = rawMax + spread * 0.18;
  const toX = (index: number): number => (numericPoints.length <= 1 ? 170 : 24 + (index * 292) / (numericPoints.length - 1));
  const toY = (number: number): number => 104 - ((number - min) * 78) / (max - min || 1);
  const chartPoints = numericPoints.map((point, index) => ({
    key: `${index}-${point.time}`,
    x: toX(index),
    y: toY(point.value),
    triggered: point.triggered,
  }));
  return {
    labels: trendLabels(points),
    linePoints: chartPoints.map((point) => `${point.x},${point.y}`).join(" "),
    points: chartPoints,
    threshold:
      thresholdValue === undefined ? undefined : { y: toY(thresholdValue), label: `${thresholdValue}${metricUnitText(value?.unit)}` },
  };
}

function renderAlert(alert: GrainAlertListItem): JSX.Element {
  return (
    <section class={`ig-h5-alert-card ${alertLevelClass(alert.level)}`}>
      <div class="ig-h5-alert-card__head">
        <strong>{alert.warehouseName}</strong>
        <span>{formatRelativeTime(alert.triggeredAt)}</span>
      </div>
      <div class="ig-h5-alert-card__body">
        <Tag plain class={`ig-h5-alert-card__level ${alertLevelClass(alert.level)}`}>
          {alertLevelLabel(alert.level)}
        </Tag>
        <span>{alertDescription(alert)}</span>
      </div>
    </section>
  );
}

export const IntelligentGrainH5Entry = defineComponent({
  name: "IntelligentGrainH5Entry",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const refreshing = ref(false);
    const loaded = ref(false);
    const summary = ref<GrainMobileSummary>();
    const trend = ref<GrainArchiveTrend>();
    const alertPage = ref<GrainAlertPageResult>(emptyAlertPage());
    const alerts = ref<GrainAlertListItem[]>([]);
    const selectedWarehouseId = ref<string>();
    const activeMain = ref(route.path.includes("/alerts") ? "alerts" : "grain");
    const alertScope = ref<"PENDING" | "ALL">("PENDING");

    const selectedWarehouse = computed(() =>
      (summary.value?.warehouses ?? []).find((item) => item.warehouseId === selectedWarehouseId.value),
    );

    const trendPoints = computed(() => trend.value?.series?.[0]?.points?.slice(-7) ?? []);
    const pendingAlertCount = computed(
      () =>
        alertPage.value.tabCounts?.[GrainAlertStatus.PENDING] ??
        summary.value?.myAlerts?.filter((item) => item.status === GrainAlertStatus.PENDING).length ??
        0,
    );
    const allAlertCount = computed(() => alertPage.value.tabCounts?.ALL ?? alertPage.value.total ?? alerts.value.length);

    const switchMain = (name: string): void => {
      activeMain.value = name === "alerts" ? "alerts" : "grain";
      void router.replace({ name: activeMain.value });
    };

    const load = async (): Promise<void> => {
      refreshing.value = true;
      try {
        const summaryData = await useAuthRequest(() => getIntelligentGrainMobileSummary());
        summary.value = summaryData;
        if (
          summaryData.warehouses.length > 0 &&
          (!selectedWarehouseId.value || !summaryData.warehouses.some((item) => item.warehouseId === selectedWarehouseId.value))
        ) {
          selectedWarehouseId.value = summaryData.warehouses[0].warehouseId;
        }
        const warehouseId = selectedWarehouseId.value;
        const [trendData, alertPageData] = warehouseId
          ? await Promise.all([
              useAuthRequest(() => getIntelligentGrainArchiveTrend(warehouseId, { range: 7 })),
              useAuthRequest(() =>
                pageIntelligentGrainAlerts({
                  pageNumber: 1,
                  pageSize: 20,
                  warehouseId,
                  status: alertScope.value === "PENDING" ? GrainAlertStatus.PENDING : undefined,
                  tab: alertScope.value === "ALL" ? "ALL" : undefined,
                }),
              ),
            ])
          : [undefined, emptyAlertPage(summaryData.myAlerts ?? [])];
        trend.value = trendData;
        alertPage.value = alertPageData;
        alerts.value = alertPageData.records;
      } catch (error) {
        showToast((error as Error).message || "加载智能粮情失败");
      } finally {
        refreshing.value = false;
        loaded.value = true;
      }
    };

    watch(
      () => route.path,
      (path) => {
        activeMain.value = path.includes("/alerts") ? "alerts" : "grain";
      },
    );

    onMounted(() => {
      void load();
    });

    const renderHeader = (): JSX.Element => {
      const warehouses = summary.value?.warehouses ?? [];
      return (
        <header class="ig-h5-topbar">
          <div class="ig-h5-current-warehouse">
            <span>🏠</span>
            <strong>{selectedWarehouse.value?.warehouseName ?? "智能粮情"}</strong>
          </div>
          <select
            class="ig-h5-warehouse-select"
            value={selectedWarehouseId.value ?? ""}
            onChange={(event) => {
              selectedWarehouseId.value = (event.target as HTMLSelectElement).value || undefined;
              void load();
            }}
          >
            {warehouses.length > 0 ? (
              warehouses.map((item) => (
                <option key={item.warehouseId} value={item.warehouseId}>
                  {item.warehouseName}
                </option>
              ))
            ) : (
              <option value="">暂无仓房</option>
            )}
          </select>
        </header>
      );
    };

    const renderMetricCard = (
      className: string,
      icon: string,
      title: string,
      value: string,
      hint: string,
      statusClass = "is-normal",
    ): JSX.Element => (
      <section class={`ig-h5-metric-card ${className}`}>
        <div class="ig-h5-metric-card__title">
          <span>{icon}</span>
          {title}
        </div>
        <strong>{value}</strong>
        <p class={statusClass}>{hint}</p>
      </section>
    );

    const renderGasCard = (warehouse: GrainWarehouseCard): JSX.Element => (
      <section class="ig-h5-metric-card is-gas">
        <div class="ig-h5-metric-card__title">
          <span>🧪</span>
          气体
        </div>
        <div class="ig-h5-gas-list">
          {gasRows(warehouse.gas).map((item) => (
            <div key={item.code}>
              <span>{item.label}</span>
              <strong class={item.className}>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    );

    const renderTrend = (): JSX.Element => {
      const chart = trendChart(trend.value);
      return (
        <section class="ig-h5-trend-card">
          <div class="ig-h5-section__head">
            <strong>近7天最高温趋势</strong>
            <span>{trendMetricText(trend.value)}</span>
          </div>
          {trendPoints.value.length > 0 ? (
            <div class="ig-h5-chart">
              <svg viewBox="0 0 340 132" role="img" aria-label="近7天趋势">
                <rect x="0" y="0" width="340" height="132" rx="8" />
                {chart.threshold ? (
                  <>
                    <line class="ig-h5-chart__threshold" x1="24" x2="316" y1={chart.threshold.y} y2={chart.threshold.y} />
                    <text class="ig-h5-chart__threshold-text" x="316" y={Math.max(14, chart.threshold.y - 4)} text-anchor="end">
                      {chart.threshold.label}
                    </text>
                  </>
                ) : null}
                <polyline class="ig-h5-chart__line" points={chart.linePoints} />
                {chart.points.map((point) => (
                  <circle
                    key={point.key}
                    class={point.triggered ? "ig-h5-chart__point is-alert" : "ig-h5-chart__point"}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                  />
                ))}
              </svg>
              <div class="ig-h5-chart__labels">
                {chart.labels.map((item) => (
                  <span key={item.key}>{item.label}</span>
                ))}
              </div>
            </div>
          ) : (
            <Empty description="暂无趋势数据" />
          )}
        </section>
      );
    };

    const renderGrain = (): JSX.Element => (
      <>
        {selectedWarehouse.value ? (
          <>
            <section class="ig-h5-metric-grid">
              {renderMetricCard(
                "is-temperature",
                "🌡️",
                "最高温",
                metricText(selectedWarehouse.value.temperature),
                metricHint(selectedWarehouse.value.temperature),
                metricStatusClass(selectedWarehouse.value.temperature),
              )}
              {renderMetricCard(
                "is-storage",
                "📦",
                "储量",
                metricText(selectedWarehouse.value.storage),
                metricHint(selectedWarehouse.value.storage, "库存稳定"),
                metricStatusClass(selectedWarehouse.value.storage),
              )}
              {renderMetricCard(
                "is-humidity",
                "💧",
                "湿度",
                metricText(selectedWarehouse.value.humidity, selectedWarehouse.value.humidity?.unit === "%" ? "%RH" : undefined),
                metricHint(selectedWarehouse.value.humidity, "保持稳定"),
                metricStatusClass(selectedWarehouse.value.humidity),
              )}
              {renderGasCard(selectedWarehouse.value)}
            </section>

            <section class={`ig-h5-health-card ${healthClass(selectedWarehouse.value)}`}>
              <div class="ig-h5-health-card__title">📊 健康度评分</div>
              <div class="ig-h5-health-card__score">{selectedWarehouse.value.healthScore ?? "--"}</div>
              <strong>{healthSummary(selectedWarehouse.value)}</strong>
              <span>温度40% | 储量27% | 湿度20% | 气体13%</span>
              <div class="ig-h5-warehouse-meta">
                {selectedWarehouse.value.areaName || "--"} · {selectedWarehouse.value.grainType || "--"} · 最近采集：
                {formatTime(selectedWarehouse.value.latestCollectTime)}
              </div>
            </section>

            {renderTrend()}
          </>
        ) : loaded.value ? (
          <Empty description="暂无仓房数据" />
        ) : null}
      </>
    );

    const renderAlerts = (): JSX.Element => (
      <>
        <section class="ig-h5-alert-tabs">
          <button
            class={alertScope.value === "PENDING" ? "is-active" : ""}
            type="button"
            onClick={() => {
              alertScope.value = "PENDING";
              void load();
            }}
          >
            待处置({pendingAlertCount.value})
          </button>
          <button
            class={alertScope.value === "ALL" ? "is-active" : ""}
            type="button"
            onClick={() => {
              alertScope.value = "ALL";
              void load();
            }}
          >
            全部({allAlertCount.value})
          </button>
        </section>
        <section class="ig-h5-alert-list">
          {alerts.value.length ? (
            alerts.value.map((item) => <div key={item.id}>{renderAlert(item)}</div>)
          ) : loaded.value ? (
            <Empty description="暂无告警" />
          ) : null}
        </section>
      </>
    );

    return (): JSX.Element => (
      <div class="ig-h5-page">
        <CubeNavBar showBack title="智能粮情" />
        {renderHeader()}
        <Tabs class="ig-h5-main-tabs" active={activeMain.value} onChange={(name) => switchMain(String(name))}>
          <Tab title="📊 粮情" name="grain" />
          <Tab title="🔔 告警" name="alerts" />
        </Tabs>
        <PullRefresh v-model={refreshing.value} onRefresh={load}>
          <main class="ig-h5-content">{activeMain.value === "grain" ? renderGrain() : renderAlerts()}</main>
        </PullRefresh>
      </div>
    );
  },
});
