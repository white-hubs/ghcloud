import { AppstoreOutlined, CloudOutlined, HomeOutlined, LineChartOutlined } from "@ant-design/icons-vue";
import * as echarts from "echarts";
import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref } from "vue";

import { buildCapacityBarOption, buildHumidityBarOption, buildTempGaugeOption, buildUsageGaugeOption } from "./pallet-position-card-charts";
import { TemperaturePointBoard } from "./temperature-point-board";
import { getWarehouseLocationCardInfo, getWarehouseTemperatureBoardIdentity } from "@/api/location-card";
import type { LocationCardInfo, WarehouseTemperatureReportPoint } from "@/api/location-card-types";

import "./pallet-position-card.less";

/** 展位示意图（与 granary-management 货位卡同源静态资源路径） */
const POSITION_CARD_IMG = "/resource/v1/granary-management/assets/position-card.png";

const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

const formatClock = (d: Date): string => {
  const pad = (n: number): string => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${y}年${m}月${day}日 ${WEEKDAYS[d.getDay()]} ${h}:${min}:${s}`;
};

const TEMP_GAUGE_AXIS_MAX = 50;

const EMPTY_TEXT = "--";

const getQueryParamFromUrl = (key: string): string => {
  const url = new URL(window.location.href);
  const searchValue = url.searchParams.get(key);
  if (searchValue != null && searchValue !== "") {
    return searchValue;
  }
  const hashQueryIndex = url.hash.indexOf("?");
  if (hashQueryIndex < 0) {
    return "";
  }
  return new URLSearchParams(url.hash.slice(hashQueryIndex + 1)).get(key) ?? "";
};

const parseWidFromAddressBar = (): number | null => {
  const raw = getQueryParamFromUrl("wid");
  if (raw === "") {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const formatTextMetric = (v: string | null | undefined): string => {
  if (v == null) {
    return EMPTY_TEXT;
  }
  const t = v.trim();
  return t === "" ? EMPTY_TEXT : t;
};

const formatNumberMetric = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) {
    return EMPTY_TEXT;
  }
  return Number.isInteger(v) ? String(v) : v.toFixed(3).replace(/\.?0+$/, "");
};

const formatFixedOneDecimalMetric = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) {
    return EMPTY_TEXT;
  }
  return v.toFixed(3);
};

const formatWeightMetric = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) {
    return EMPTY_TEXT;
  }
  return String(v);
};

const formatDateTimeMetric = (v: string | null | undefined): string => {
  if (v == null) {
    return EMPTY_TEXT;
  }
  const raw = v.trim();
  if (raw === "") {
    return EMPTY_TEXT;
  }
  const normalized = raw.includes("T") ? raw.replace("T", " ") : raw;
  if (/^\d{10,}$/.test(normalized)) {
    const ts = Number(normalized);
    if (!Number.isFinite(ts)) {
      return EMPTY_TEXT;
    }
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) {
      return EMPTY_TEXT;
    }
    const pad = (n: number): string => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  return normalized.slice(0, 19);
};

const toChartValue = (v: number | null | undefined): number => {
  return v == null || !Number.isFinite(v) ? 0 : v;
};

const isValidTemperature = (value: number | null | undefined): value is number => {
  return value != null && Number.isFinite(value) && value !== -128;
};

const clampPercent = (v: number | null | undefined, max: number): string => {
  if (v == null || !Number.isFinite(v) || max <= 0) {
    return "0%";
  }
  const pct = Math.max(0, Math.min(100, (v / max) * 100));
  return `${pct}%`;
};

type GasType = "co2" | "o2" | "ph3";

const GAS_STANDARD = {
  co2: { limitText: "高报 > 0.5%VOL", max: 0.5 },
  o2: { limitText: "低报 ≤ 19.5%VOL / 高报 ≥ 23.5%VOL", min: 19.5, max: 23.5 },
  ph3: { limitText: "高报 > 0.001%VOL", max: 0.001 },
} as const;

const normalizeO2Percent = (v: number | null | undefined): number | null => {
  if (v == null || !Number.isFinite(v)) {
    return null;
  }
  if (v > 0 && v <= 1) {
    return v * 100;
  }
  return v;
};

const ppmToVolPercent = (ppm: number): number => ppm / 10000;

const toGasVolPercent = (type: GasType, rawValue: number | null | undefined): number | null => {
  if (rawValue == null || !Number.isFinite(rawValue)) {
    return null;
  }
  if (type === "o2") {
    return normalizeO2Percent(rawValue);
  }
  // 后端部分场景虽字段名带 Ppm，但返回的实际已是 %VOL 小数值（例如 0.05180）
  // 对小数值直接按 %VOL 使用，避免重复换算导致页面显示为 0.00。
  if (rawValue <= 1) {
    return rawValue;
  }
  return ppmToVolPercent(rawValue);
};

const formatVolMetric = (type: GasType, v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) {
    return EMPTY_TEXT;
  }
  return formatFixedOneDecimalMetric(v);
};

const formatGasMetric = (type: GasType, rawValue: number | null | undefined): string => {
  const volValue = toGasVolPercent(type, rawValue);
  if (volValue == null) {
    return EMPTY_TEXT;
  }
  return `${formatVolMetric(type, volValue)} %VOL`;
};

const isGasOverLimit = (type: GasType, rawValue: number | null | undefined): boolean => {
  const value = toGasVolPercent(type, rawValue);
  if (value == null || !Number.isFinite(value)) {
    return false;
  }
  if (type === "o2") {
    return value <= GAS_STANDARD.o2.min || value >= GAS_STANDARD.o2.max;
  }
  return value > GAS_STANDARD[type].max;
};

const getGasDisplayMax = (type: GasType, rawValue: number | null | undefined): number => {
  const value = toGasVolPercent(type, rawValue);
  if (type === "o2") {
    const current = value != null && Number.isFinite(value) ? value : 0;
    return Math.max(30, current * 1.12);
  }
  const standardMax = GAS_STANDARD[type].max;
  const current = value != null && Number.isFinite(value) ? value : 0;
  return Math.max(standardMax * 1.4, current * 1.15, standardMax);
};

const getGasThresholdMark = (type: GasType, rawValue: number | null | undefined): string => {
  const max = getGasDisplayMax(type, rawValue);
  return clampPercent(GAS_STANDARD[type].max, max);
};

const getGasRangeStartMark = (type: GasType, rawValue: number | null | undefined): string => {
  if (type !== "o2") {
    return "0%";
  }
  const max = getGasDisplayMax(type, rawValue);
  return clampPercent(GAS_STANDARD.o2.min, max);
};

const getGasCurrentFillWidth = (type: GasType, rawValue: number | null | undefined): string => {
  const value = toGasVolPercent(type, rawValue);
  if (value == null || !Number.isFinite(value)) {
    return "0%";
  }
  const displayMax = getGasDisplayMax(type, rawValue);
  return clampPercent(value, displayMax);
};

const getGasNormalFillWidth = (type: GasType, rawValue: number | null | undefined): string => {
  const value = toGasVolPercent(type, rawValue);
  if (value == null || !Number.isFinite(value)) {
    return "0%";
  }
  const displayMax = getGasDisplayMax(type, rawValue);
  const safeMax = GAS_STANDARD[type].max;
  return clampPercent(Math.min(value, safeMax), displayMax);
};

const getGasDangerFillWidth = (type: GasType, rawValue: number | null | undefined): string => {
  const value = toGasVolPercent(type, rawValue);
  if (value == null || !Number.isFinite(value)) {
    return "0%";
  }
  const displayMax = getGasDisplayMax(type, rawValue);
  const safeMax = GAS_STANDARD[type].max;
  return clampPercent(Math.max(0, value - safeMax), displayMax);
};

const getGasDangerFillStart = (type: GasType, rawValue: number | null | undefined): string => {
  return getGasNormalFillWidth(type, rawValue);
};

export const PalletPositionCard = defineComponent({
  name: "PalletPositionCard",
  setup: () => {
    const clockText = ref(formatClock(new Date()));
    const cardInfo = ref<LocationCardInfo | null>(null);
    const tempPointRows = ref<WarehouseTemperatureReportPoint[][]>([]);
    const temperatureBoardWarehouseLabel = ref<string | null>(null);
    let timer: ReturnType<typeof setInterval> | undefined;

    const usageGaugeRef = ref<HTMLDivElement | null>(null);
    const capacityBarRef = ref<HTMLDivElement | null>(null);
    const tempMaxGaugeRef = ref<HTMLDivElement | null>(null);
    const tempMinGaugeRef = ref<HTMLDivElement | null>(null);
    const tempAvgGaugeRef = ref<HTMLDivElement | null>(null);
    const humidityBarRef = ref<HTMLDivElement | null>(null);

    const flatTempPoints = computed(() => tempPointRows.value.flat());
    const validTempPointValues = computed(() => {
      return flatTempPoints.value.map((point) => point.temperature).filter(isValidTemperature);
    });
    const tempPointMax = computed<number | null>(() => {
      return validTempPointValues.value.length === 0 ? null : Math.max(...validTempPointValues.value);
    });
    const tempPointMin = computed<number | null>(() => {
      return validTempPointValues.value.length === 0 ? null : Math.min(...validTempPointValues.value);
    });
    const tempPointAvg = computed<number | null>(() => {
      if (validTempPointValues.value.length === 0) {
        return null;
      }
      return validTempPointValues.value.reduce((total, value) => total + value, 0) / validTempPointValues.value.length;
    });
    const getTemperatureTone = (value: number | null): "low" | "normal" | "high" | null => {
      const rangeMin = cardInfo.value?.temperatureRangeMin;
      const rangeMax = cardInfo.value?.temperatureRangeMax;
      if (value == null || rangeMin == null || rangeMax == null) {
        return null;
      }
      if (value < rangeMin) {
        return "low";
      }
      return value > rangeMax ? "high" : "normal";
    };
    const temperatureRangeTooltip = computed<string | undefined>(() => {
      const rangeMin = cardInfo.value?.temperatureRangeMin;
      const rangeMax = cardInfo.value?.temperatureRangeMax;
      return rangeMin == null || rangeMax == null ? undefined : `温度分级区间：${rangeMin}℃ 至 ${rangeMax}℃`;
    });

    let chartList: echarts.ECharts[] = [];

    const disposeChartList = (): void => {
      chartList.forEach((c) => {
        c.dispose();
      });
      chartList = [];
    };

    const mountChartList = (): void => {
      disposeChartList();
      const push = (el: HTMLDivElement | null, option: echarts.EChartsOption): void => {
        if (el == null) {
          return;
        }
        const inst = echarts.init(el);
        inst.setOption(option, true);
        chartList.push(inst);
      };
      const info = cardInfo.value;
      push(usageGaugeRef.value, buildUsageGaugeOption(toChartValue(info?.usageRate)));
      push(capacityBarRef.value, buildCapacityBarOption(toChartValue(info?.materialVolume), toChartValue(info?.granaryVolume)));
      push(
        tempMaxGaugeRef.value,
        buildTempGaugeOption(
          toChartValue(tempPointMax.value),
          TEMP_GAUGE_AXIS_MAX,
          getTemperatureTone(tempPointMax.value) === "high" ? "#ff6464" : "#4a9dff",
        ),
      );
      push(tempMinGaugeRef.value, buildTempGaugeOption(toChartValue(tempPointMin.value), TEMP_GAUGE_AXIS_MAX, "#4a9dff"));
      push(tempAvgGaugeRef.value, buildTempGaugeOption(toChartValue(tempPointAvg.value), TEMP_GAUGE_AXIS_MAX, "#79e6a6"));
      push(humidityBarRef.value, buildHumidityBarOption(toChartValue(info?.humidity)));
    };

    const resizeChartList = (): void => {
      chartList.forEach((c) => {
        c.resize();
      });
    };

    const loadCardData = async (): Promise<void> => {
      const wid = parseWidFromAddressBar();
      if (wid == null) {
        cardInfo.value = null;
        tempPointRows.value = [];
        temperatureBoardWarehouseLabel.value = null;
        return;
      }
      const [cardInfoResult, boardConfigResult] = await Promise.allSettled([
        getWarehouseLocationCardInfo(wid),
        getWarehouseTemperatureBoardIdentity(wid),
      ]);
      cardInfo.value = cardInfoResult.status === "fulfilled" ? cardInfoResult.value : null;
      const boardConfig = boardConfigResult.status === "fulfilled" ? boardConfigResult.value : null;
      temperatureBoardWarehouseLabel.value = boardConfig?.warehouseLabel ?? null;
      tempPointRows.value = cardInfo.value?.reportList ?? [];
      void nextTick(() => {
        mountChartList();
        requestAnimationFrame(() => {
          resizeChartList();
        });
      });
    };

    onMounted(() => {
      void loadCardData();
      timer = setInterval(() => {
        clockText.value = formatClock(new Date());
      }, 1000);
      void nextTick(() => {
        mountChartList();
        requestAnimationFrame(() => {
          resizeChartList();
        });
      });
      window.addEventListener("resize", resizeChartList);
    });

    onUnmounted(() => {
      if (timer != null) {
        clearInterval(timer);
      }
      window.removeEventListener("resize", resizeChartList);
      disposeChartList();
    });

    const warehouseName = (): string => formatTextMetric(cardInfo.value?.granaryName);
    const renderDeviceStatus = (status: LocationCardInfo["radarDeviceStatus"] | undefined): JSX.Element => {
      if (status == null || (status.online == null && status.offline == null)) {
        return <span>{EMPTY_TEXT}</span>;
      }
      return (
        <span>
          <span class="ppc-status__online">{status.online ?? 0}在线</span>
          <span class="ppc-status__gap"> </span>
          <span class="ppc-status__offline">{status.offline ?? 0}离线</span>
        </span>
      );
    };

    const granaryVolume = (): number | null => cardInfo.value?.granaryVolume ?? null;
    const materialVolume = (): number | null => cardInfo.value?.materialVolume ?? null;
    const remainingVolume = (): number | null => {
      const fromApi = cardInfo.value?.remainingVolume;
      if (fromApi != null && Number.isFinite(fromApi)) {
        return fromApi;
      }
      const total = granaryVolume();
      const used = materialVolume();
      return total == null || used == null ? null : total - used;
    };
    const temperatureAlertNotice = computed(() => cardInfo.value?.temperatureAlertNotice ?? null);
    const shouldShowTemperatureAlertNotice = computed(() => {
      return temperatureAlertNotice.value?.alerting === true && temperatureAlertNotice.value.message.trim() !== "";
    });

    return (): JSX.Element => {
      return (
        <div class="pallet-position-card-root">
          <div class="ppc-scroll">
            <header class="ppc-header">
              <div class="ppc-title-row">
                <AppstoreOutlined class="ppc-title-icon" />
                <h1 class="ppc-title">
                  粮情电子货位卡·
                  <span class="ppc-title__link">{warehouseName()}</span>
                </h1>
              </div>
              <div class="ppc-clock">{clockText.value}</div>
            </header>

            <div class="ppc-layout">
              <div class="ppc-column ppc-column--side">
                <section class="ppc-card ppc-basic-card">
                  <div class="ppc-card-head ppc-basic-card__head">
                    <div class="ppc-card-head__left">
                      <HomeOutlined class="ppc-basic-card__head-icon" />
                      <h2 class="ppc-card-title">仓位基本信息</h2>
                    </div>
                  </div>
                  <div class="ppc-info-grid ppc-basic-card__grid">
                    <span class="ppc-k">仓号</span>
                    <span class="ppc-v">{warehouseName()}</span>
                    <span class="ppc-k">货位编号</span>
                    <span class="ppc-v">{formatTextMetric(cardInfo.value?.positionCode)}</span>
                    <span class="ppc-k">仓型</span>
                    <span class="ppc-v">{formatTextMetric(cardInfo.value?.category)}</span>
                    <span class="ppc-k">等级</span>
                    <span class="ppc-v">{formatTextMetric(cardInfo.value?.level)}</span>
                    <span class="ppc-k">核定仓容 (m³)</span>
                    <span class="ppc-v">{formatNumberMetric(cardInfo.value?.granaryVolume)}</span>
                    <span class="ppc-k">长 (m)</span>
                    <span class="ppc-v">{formatNumberMetric(cardInfo.value?.length)}</span>
                    <span class="ppc-k">宽 (m)</span>
                    <span class="ppc-v">{formatNumberMetric(cardInfo.value?.width)}</span>
                    <span class="ppc-k">安全高度 (m)</span>
                    <span class="ppc-v">{formatNumberMetric(cardInfo.value?.height)}</span>
                  </div>
                  <img class="ppc-basic-photo ppc-basic-photo--img" src={POSITION_CARD_IMG} alt="展位示意图" />
                  <div class="ppc-basic-footer">
                    <div class="ppc-basic-footer-row">
                      <span class="ppc-k">保管员</span>
                      <span class="ppc-v">{formatTextMetric(cardInfo.value?.keeper)}</span>
                    </div>
                    <div class="ppc-basic-footer-row">
                      <span class="ppc-k">填卡日期</span>
                      <span class="ppc-v">{formatTextMetric(cardInfo.value?.filingDate)}</span>
                    </div>
                    <div class="ppc-basic-footer-row">
                      <span class="ppc-k">授权单位</span>
                      <span class="ppc-v">{formatTextMetric(cardInfo.value?.authorizedUnit)}</span>
                    </div>
                    <div class="ppc-basic-footer-row ppc-basic-footer-row--storage">
                      <span class="ppc-k">储存库点</span>
                      <span class="ppc-v ppc-basic-footer-val--nowrap">{formatTextMetric(cardInfo.value?.storageSite)}</span>
                    </div>
                  </div>
                </section>
              </div>

              <div class="ppc-column ppc-column--center">
                <section class="ppc-card ppc-storage-card">
                  <div class="ppc-card-head">
                    <div class="ppc-card-head__left">
                      <LineChartOutlined style={{ fontSize: "18px" }} />
                      <h2 class="ppc-card-title">储量监测</h2>
                    </div>
                    <span class="ppc-status">{renderDeviceStatus(cardInfo.value?.radarDeviceStatus)}</span>
                  </div>
                  <div class="ppc-center-top">
                    <div class="ppc-hero-block ppc-hero-block--variety">
                      <span class="ppc-hero-label">储存品种</span>
                      <span class="ppc-hero-value">{formatTextMetric(cardInfo.value?.category)}</span>
                    </div>
                    <div class="ppc-hero-block ppc-hero-block--weight">
                      <span class="ppc-hero-label">存储重量</span>
                      <div class="ppc-hero-weight-line">
                        <span class="ppc-hero-weight__num">{formatWeightMetric(cardInfo.value?.materialWeight)}</span>
                        <span class="ppc-hero-weight__unit">吨</span>
                      </div>
                    </div>
                  </div>
                  <div class="ppc-cap-row">
                    <div ref={usageGaugeRef} class="ppc-echarts ppc-echarts--usage-gauge" aria-hidden />
                    <div class="ppc-cap-bar-wrap">
                      <div class="ppc-cap-usage-title">仓容使用率</div>
                      <div ref={capacityBarRef} class="ppc-echarts ppc-echarts--capacity-bar" aria-hidden />
                      <div class="ppc-cap-stats">
                        <div class="ppc-cap-stat">
                          <span class="ppc-cap-stat__lbl">总仓容</span>
                          <span class="ppc-cap-stat__num">{formatNumberMetric(granaryVolume())}</span>
                          <span class="ppc-cap-stat__unit">m³</span>
                        </div>
                        <div class="ppc-cap-stat">
                          <span class="ppc-cap-stat__lbl">已用</span>
                          <span class="ppc-cap-stat__num">{formatNumberMetric(materialVolume())}</span>
                          <span class="ppc-cap-stat__unit">m³</span>
                        </div>
                        <div class="ppc-cap-stat">
                          <span class="ppc-cap-stat__lbl">剩余</span>
                          <span class="ppc-cap-stat__num">{formatNumberMetric(remainingVolume())}</span>
                          <span class="ppc-cap-stat__unit">m³</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="ppc-metric-grid ppc-metric-grid--5">
                    <div class="ppc-metric-cell ppc-metric-cell--stack">
                      <span class="ppc-metric-cell__v ppc-metric-cell__v--stat">
                        {formatNumberMetric(cardInfo.value?.digitalGrainVolume)}
                      </span>
                      <span class="ppc-metric-cell__k">入库体积m³</span>
                    </div>
                    <div class="ppc-metric-cell ppc-metric-cell--stack">
                      <span class="ppc-metric-cell__v ppc-metric-cell__v--empty">{formatNumberMetric(cardInfo.value?.deductedVolume)}</span>
                      <span class="ppc-metric-cell__k">扣除体积m³</span>
                    </div>
                    <div class="ppc-metric-cell ppc-metric-cell--stack">
                      <span class="ppc-metric-cell__v ppc-metric-cell__v--empty">
                        {formatNumberMetric(cardInfo.value?.storageBagCount)}
                      </span>
                      <span class="ppc-metric-cell__k">包存量包数</span>
                    </div>
                    <div class="ppc-metric-cell ppc-metric-cell--stack">
                      <span class="ppc-metric-cell__v ppc-metric-cell__v--empty">
                        {formatNumberMetric(cardInfo.value?.averageBagWeight)}
                      </span>
                      <span class="ppc-metric-cell__k">平均包重</span>
                    </div>
                    <div class="ppc-metric-cell ppc-metric-cell--stack">
                      <span class="ppc-metric-cell__v ppc-metric-cell__v--stat">
                        {formatNumberMetric(cardInfo.value?.bulkDensityOrRoughness)}
                      </span>
                      <span class="ppc-metric-cell__k">容重/出糙率</span>
                    </div>
                  </div>
                  <div class="ppc-two-col">
                    <div>
                      <span class="ppc-k">入仓时间</span>
                      <span class="ppc-v"> {formatDateTimeMetric(cardInfo.value?.inboundTime)}</span>
                    </div>
                    <div>
                      <span class="ppc-k">产地</span>
                      <span class="ppc-v"> {formatTextMetric(cardInfo.value?.originPlace)}</span>
                    </div>
                    <div>
                      <span class="ppc-k">储存性质</span>
                      <span class="ppc-v"> {formatTextMetric(cardInfo.value?.storageNature)}</span>
                    </div>
                    <div>
                      <span class="ppc-k">收获年度</span>
                      <span class="ppc-v"> {formatTextMetric(cardInfo.value?.harvestYear)}</span>
                    </div>
                    <div class="ppc-two-col__full">
                      <span class="ppc-k">保管方式</span>
                      <span class="ppc-v"> {formatTextMetric(cardInfo.value?.storageMode)}</span>
                    </div>
                  </div>
                  <h3 class="ppc-subhead">湿度检测、气体检测</h3>
                  <div class="ppc-env-panels">
                    <section class="ppc-env-panel">
                      <div class="ppc-card-head">
                        <div class="ppc-card-head__left">
                          <CloudOutlined style={{ fontSize: "18px" }} />
                          <h4 class="ppc-env-title">湿度监测</h4>
                        </div>
                        <span class="ppc-status">{renderDeviceStatus(cardInfo.value?.humidityDeviceStatus)}</span>
                      </div>
                      <div class="ppc-card-content">
                        <div class="ppc-humidity-core">
                          {formatFixedOneDecimalMetric(cardInfo.value?.humidity)}
                          <span> %RH</span>
                        </div>
                        <div ref={humidityBarRef} class="ppc-echarts ppc-echarts--humidity-bar" aria-hidden />
                      </div>
                    </section>

                    <section class="ppc-env-panel">
                      <div class="ppc-card-head">
                        <div class="ppc-card-head__left">
                          <LineChartOutlined style={{ fontSize: "18px" }} />
                          <h4 class="ppc-env-title">气体监测</h4>
                        </div>
                        <span class="ppc-status">{renderDeviceStatus(cardInfo.value?.gasDeviceStatus)}</span>
                      </div>
                      <div class="ppc-gas-row">
                        <div class={["ppc-gas-head", isGasOverLimit("co2", cardInfo.value?.gasCo2) ? "ppc-gas-head--danger" : ""]}>
                          <span class="ppc-gas-name">二氧化碳 (CO₂)</span>
                          <span class="ppc-gas-val">{formatGasMetric("co2", cardInfo.value?.gasCo2)}</span>
                        </div>
                        <div class="ppc-gas-standard">国标阈值：{GAS_STANDARD.co2.limitText}</div>
                        <div class="ppc-gas-bar">
                          <div
                            class="ppc-threshold-badge ppc-threshold-badge--single"
                            style={{ left: getGasThresholdMark("co2", cardInfo.value?.gasCo2) }}
                          >
                            {"> 0.5%VOL 预警线"}
                          </div>
                          <div class="ppc-threshold-line" style={{ left: getGasThresholdMark("co2", cardInfo.value?.gasCo2) }} />
                          <div class="ppc-bar-track">
                            <div
                              class="ppc-bar-fill ppc-bar-fill--co2"
                              style={{ width: getGasNormalFillWidth("co2", cardInfo.value?.gasCo2) }}
                            />
                            {isGasOverLimit("co2", cardInfo.value?.gasCo2) ? (
                              <div
                                class="ppc-bar-fill ppc-bar-fill--danger-part"
                                style={{
                                  left: getGasDangerFillStart("co2", cardInfo.value?.gasCo2),
                                  width: getGasDangerFillWidth("co2", cardInfo.value?.gasCo2),
                                }}
                              />
                            ) : null}
                          </div>
                        </div>
                        {isGasOverLimit("co2", cardInfo.value?.gasCo2) ? <div class="ppc-gas-alert">CO2 超标，请及时通风处置</div> : null}
                      </div>
                      <div class="ppc-gas-row">
                        <div class={["ppc-gas-head", isGasOverLimit("o2", cardInfo.value?.gasO2) ? "ppc-gas-head--danger" : ""]}>
                          <span class="ppc-gas-name">氧气 (O₂)</span>
                          <span class="ppc-gas-val">{formatGasMetric("o2", cardInfo.value?.gasO2)}</span>
                        </div>
                        <div class="ppc-gas-standard">国标阈值：{GAS_STANDARD.o2.limitText}</div>
                        <div class="ppc-gas-bar">
                          <div
                            class="ppc-threshold-badge ppc-threshold-badge--range"
                            style={{ left: getGasRangeStartMark("o2", cardInfo.value?.gasO2) }}
                          >
                            低报 19.5%VOL
                          </div>
                          <div
                            class="ppc-threshold-badge ppc-threshold-badge--range"
                            style={{ left: getGasThresholdMark("o2", cardInfo.value?.gasO2) }}
                          >
                            高报 23.5%VOL
                          </div>
                          <div
                            class="ppc-threshold-line ppc-threshold-line--range"
                            style={{ left: getGasRangeStartMark("o2", cardInfo.value?.gasO2) }}
                          />
                          <div
                            class="ppc-threshold-line ppc-threshold-line--range"
                            style={{ left: getGasThresholdMark("o2", cardInfo.value?.gasO2) }}
                          />
                          <div class="ppc-bar-track">
                            <div
                              class={[
                                "ppc-bar-fill",
                                isGasOverLimit("o2", cardInfo.value?.gasO2) ? "ppc-bar-fill--danger-part" : "ppc-bar-fill--o2",
                              ]}
                              style={{ width: getGasCurrentFillWidth("o2", cardInfo.value?.gasO2), left: "0%" }}
                            />
                          </div>
                        </div>
                        {isGasOverLimit("o2", cardInfo.value?.gasO2) ? <div class="ppc-gas-alert">O2 超出安全范围，请及时处置</div> : null}
                      </div>
                      <div class="ppc-gas-row">
                        <div class={["ppc-gas-head", isGasOverLimit("ph3", cardInfo.value?.gasPh3) ? "ppc-gas-head--danger" : ""]}>
                          <span class="ppc-gas-name">磷化氢 (PH₃)</span>
                          <span class="ppc-gas-val">{formatGasMetric("ph3", cardInfo.value?.gasPh3)}</span>
                        </div>
                        <div class="ppc-gas-standard">国标阈值：{GAS_STANDARD.ph3.limitText}</div>
                        <div class="ppc-gas-bar">
                          <div
                            class="ppc-threshold-badge ppc-threshold-badge--single"
                            style={{ left: getGasThresholdMark("ph3", cardInfo.value?.gasPh3) }}
                          >
                            {"> 0.001%VOL 预警线"}
                          </div>
                          <div class="ppc-threshold-line" style={{ left: getGasThresholdMark("ph3", cardInfo.value?.gasPh3) }} />
                          <div class="ppc-bar-track">
                            <div
                              class="ppc-bar-fill ppc-bar-fill--ph3"
                              style={{ width: getGasNormalFillWidth("ph3", cardInfo.value?.gasPh3) }}
                            />
                            {isGasOverLimit("ph3", cardInfo.value?.gasPh3) ? (
                              <div
                                class="ppc-bar-fill ppc-bar-fill--danger-part"
                                style={{
                                  left: getGasDangerFillStart("ph3", cardInfo.value?.gasPh3),
                                  width: getGasDangerFillWidth("ph3", cardInfo.value?.gasPh3),
                                }}
                              />
                            ) : null}
                          </div>
                        </div>
                        {isGasOverLimit("ph3", cardInfo.value?.gasPh3) ? (
                          <div class="ppc-gas-alert">PH3 超标，请及时排查气体来源</div>
                        ) : null}
                      </div>
                    </section>
                  </div>
                  <h3 class="ppc-subhead ppc-subhead--detection">检测记录</h3>
                  <div class="ppc-table-scroll">
                    <table class="ppc-table">
                      <thead>
                        <tr>
                          <th>检测时间</th>
                          <th>检测人</th>
                          <th>水分%</th>
                          <th>杂质%</th>
                          <th>色泽气味</th>
                          <th>出糙率%</th>
                          <th>互混率%</th>
                          <th>整精米率%</th>
                          <th>谷外糙米%</th>
                          <th>黄粒米%</th>
                          <th>品尝分值</th>
                          <th>脂肪酸值mgKOH/100g</th>
                          <th>镉mg/kg</th>
                          <th>黄曲霉素B1μg/kg</th>
                          <th>铅mg/kg</th>
                          <th>汞mg/kg</th>
                          <th>无机砷mg/kg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cardInfo.value?.qualityInspections.map((item) => (
                          <tr key={item.id ?? item.inspectionTime}>
                            <td>{formatDateTimeMetric(item.inspectionTime)}</td>
                            <td>{formatTextMetric(item.inspector)}</td>
                            <td>{formatNumberMetric(item.moisture)}</td>
                            <td>{formatNumberMetric(item.impurity)}</td>
                            <td>{formatTextMetric(item.colorSmell)}</td>
                            <td>{formatNumberMetric(item.roughness)}</td>
                            <td>{formatNumberMetric(item.mixedRate)}</td>
                            <td>{formatNumberMetric(item.headRiceRate)}</td>
                            <td>{formatNumberMetric(item.outOfPaddyBrownRiceRate)}</td>
                            <td>{formatNumberMetric(item.yellowRiceRate)}</td>
                            <td>{formatNumberMetric(item.tasteScore)}</td>
                            <td>{formatNumberMetric(item.fattyAcid)}</td>
                            <td>{formatNumberMetric(item.cadmium)}</td>
                            <td>{formatNumberMetric(item.aflatoxinB1)}</td>
                            <td>{formatNumberMetric(item.lead)}</td>
                            <td>{formatNumberMetric(item.mercury)}</td>
                            <td>{formatNumberMetric(item.inorganicArsenic)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div class="ppc-column ppc-column--side ppc-right-stack">
                <section class="ppc-card ppc-temp-card">
                  <div class="ppc-card-head">
                    <div class="ppc-card-head__left">
                      <LineChartOutlined style={{ fontSize: "18px" }} />
                      <h2 class="ppc-card-title">温度点位详情</h2>
                    </div>
                    <span class="ppc-status">{renderDeviceStatus(cardInfo.value?.temperatureDeviceStatus)}</span>
                  </div>
                  <div class="ppc-temp-gauges">
                    <div class="ppc-temp-gauge-item" title={temperatureRangeTooltip.value}>
                      <div ref={tempMaxGaugeRef} class="ppc-echarts ppc-echarts--temp" aria-hidden />
                      <div class="ppc-mini-ring__lbl">最高温度</div>
                    </div>
                    <div class="ppc-temp-gauge-item">
                      <div ref={tempMinGaugeRef} class="ppc-echarts ppc-echarts--temp" aria-hidden />
                      <div class="ppc-mini-ring__lbl">最低温度</div>
                    </div>
                    <div class="ppc-temp-gauge-item">
                      <div ref={tempAvgGaugeRef} class="ppc-echarts ppc-echarts--temp" aria-hidden />
                      <div class="ppc-mini-ring__lbl">平均温度</div>
                    </div>
                  </div>
                  {shouldShowTemperatureAlertNotice.value ? <div class="msg">{temperatureAlertNotice.value?.message}</div> : null}
                  <div class="ppc-temp-point-divider" />
                  <TemperaturePointBoard
                    reportRows={tempPointRows.value}
                    warehouseLabel={temperatureBoardWarehouseLabel.value}
                    temperatureRangeMin={cardInfo.value?.temperatureRangeMin ?? null}
                    temperatureRangeMax={cardInfo.value?.temperatureRangeMax ?? null}
                  />
                </section>
              </div>
            </div>
          </div>
        </div>
      );
    };
  },
});
