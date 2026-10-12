import { AppstoreOutlined, CloudOutlined, HomeOutlined, LineChartOutlined } from "@ant-design/icons-vue";
import * as echarts from "echarts";
import { defineComponent, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  buildCapacityBarOption,
  buildHumidityBarOption,
  buildHumidityGaugeOption,
  buildTempGaugeOption,
  buildUsageGaugeOption,
} from "./pallet-position-card-charts";
import { authStore } from "@/api/auth-store";

import "./pallet-position-card.less";

/** 展位示意图（Vite 资源 URL，构建后带 hash） */
const POSITION_CARD_IMG = new URL("./assets/position-card.png", import.meta.url).href;

/** 分享链接中的 `cube-secret` 在应用入口 `main.ts` 经 `getAuthInfo()` 处理，内部会 `getTokenBySecret` 换票后再请求接口。 */

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

const WAREHOUSE_DETAIL_EXTERNAL = "http://192.168.1.10:8311/warehouse/detail/11/59/480000";
const TEMP_HUMIDITY_MONITOR_EXTERNAL = "http://192.168.1.199:8650/";

const openExternal = (url: string): void => {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.click();
};

const MOCK = {
  warehouseName: "A1023仓",
  palletNo: "IP0124",
  warehouseType: "平房仓",
  grade: "3",
  approvedCapacityM3: 3650,
  dimensions: "35.07×23.08×5.23",
  custodian: "胡长明",
  cardDate: "2025年10月",
  authorizedUnit: "湖南省人民政府",
  storagePoint: "湖南长沙霞凝粮食仓库有限公司霞凝库",
  storageVariety: "早籼稻",
  storageWeightT: 2450,
  usagePct: 67.1,
  totalCapacityM3: 3650,
  usedM3: 2650,
  remainingM3: 1000,
  digitalGrainVolumeM3: 4208.44,
  deductedVolumeM3: 4208.44,
  inboundTime: "2025.01",
  origin: "湖南",
  storageNature: "省储",
  harvestYear: "2025年",
  custodyMethod: "委托管理",
  quality: {
    bulkDensity: "76.8",
    roughness: "0.7",
    moisture: "--",
    headRice: "--",
  },
  radarOnlineOffline: { online: 0, offline: 1 },
  tempOnlineOffline: { online: 100, offline: 1 },
  gasOnlineOffline: { online: 0, offline: 1 },
  humidityOnlineOffline: { online: 0, offline: 1 },
  tempMax: 35,
  tempMin: 24,
  tempAvg: 20,
  gasCo2: 450,
  gasO2: 20.9,
  gasPh3: 0.5,
  humidityPct: 87,
  detectionRecords: [
    {
      time: "2025-10-18 09:30",
      moisture: 13.2,
      roughness: 1.1,
      fattyAcid: 18.5,
      appearance: "正常",
      inspector: "张伟",
    },
    {
      time: "2025-10-05 14:20",
      moisture: 12.8,
      roughness: 1.0,
      fattyAcid: 17.2,
      appearance: "正常",
      inspector: "李娜",
    },
  ],
} as const;

const TEMP_GAUGE_AXIS_MAX = 50;

const formatOnlineOffline = (online: number, offline: number): string => {
  return `${online}在线 ${offline}离线`;
};

export const PalletPositionCard = defineComponent({
  name: "PalletPositionCard",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const clockText = ref(formatClock(new Date()));
    let timer: ReturnType<typeof setInterval> | undefined;

    const usageGaugeRef = ref<HTMLDivElement | null>(null);
    const capacityBarRef = ref<HTMLDivElement | null>(null);
    const tempMaxGaugeRef = ref<HTMLDivElement | null>(null);
    const tempMinGaugeRef = ref<HTMLDivElement | null>(null);
    const tempAvgGaugeRef = ref<HTMLDivElement | null>(null);
    const humidityGaugeRef = ref<HTMLDivElement | null>(null);
    const humidityBarRef = ref<HTMLDivElement | null>(null);

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
      push(usageGaugeRef.value, buildUsageGaugeOption(MOCK.usagePct));
      push(capacityBarRef.value, buildCapacityBarOption(MOCK.usedM3, MOCK.totalCapacityM3));
      push(tempMaxGaugeRef.value, buildTempGaugeOption(MOCK.tempMax, TEMP_GAUGE_AXIS_MAX, "#ff6464"));
      push(tempMinGaugeRef.value, buildTempGaugeOption(MOCK.tempMin, TEMP_GAUGE_AXIS_MAX, "#4a9dff"));
      push(tempAvgGaugeRef.value, buildTempGaugeOption(MOCK.tempAvg, TEMP_GAUGE_AXIS_MAX, "#79e6a6"));
      push(humidityGaugeRef.value, buildHumidityGaugeOption(MOCK.humidityPct));
      push(humidityBarRef.value, buildHumidityBarOption(MOCK.humidityPct));
    };

    const resizeChartList = (): void => {
      chartList.forEach((c) => {
        c.resize();
      });
    };

    onMounted(() => {
      const secretRaw = route.query["cube-secret"];
      const secretStr = Array.isArray(secretRaw) ? secretRaw[0] : secretRaw;
      const hasSecret = typeof secretStr === "string" && secretStr !== "";
      if (hasSecret && authStore.token.trim() !== "") {
        const nextQuery = { ...route.query };
        delete nextQuery["cube-secret"];
        void router.replace({ path: route.path, query: nextQuery });
      }
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

    const onThCardKey = (e: KeyboardEvent): void => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openExternal(TEMP_HUMIDITY_MONITOR_EXTERNAL);
      }
    };

    return (): JSX.Element => (
      <div class="pallet-position-card-root">
        <div class="ppc-scroll">
          <header class="ppc-header">
            <div class="ppc-title-row">
              <AppstoreOutlined class="ppc-title-icon" />
              <h1 class="ppc-title">
                粮情电子货位卡·
                <button
                  type="button"
                  class="ppc-title__link"
                  onClick={() => {
                    openExternal(WAREHOUSE_DETAIL_EXTERNAL);
                  }}
                >
                  {MOCK.warehouseName}
                </button>
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
                  <span class="ppc-v">{MOCK.warehouseName}</span>
                  <span class="ppc-k">货位编号</span>
                  <span class="ppc-v">{MOCK.palletNo}</span>
                  <span class="ppc-k">仓型</span>
                  <span class="ppc-v">{MOCK.warehouseType}</span>
                  <span class="ppc-k">等级</span>
                  <span class="ppc-v">{MOCK.grade}</span>
                  <span class="ppc-k">核定仓容 (m³)</span>
                  <span class="ppc-v">{MOCK.approvedCapacityM3}</span>
                  <span class="ppc-k">长×宽×高 (m)</span>
                  <span class="ppc-v">{MOCK.dimensions}</span>
                </div>
                <img
                  class="ppc-basic-photo ppc-basic-photo--img"
                  src="/resource/v1/granary-management/assets/position-card.png"
                  alt="展位示意图"
                />
                <div class="ppc-basic-footer">
                  <div class="ppc-basic-footer-row">
                    <span class="ppc-k">保管员</span>
                    <span class="ppc-v">{MOCK.custodian}</span>
                  </div>
                  <div class="ppc-basic-footer-row">
                    <span class="ppc-k">填卡日期</span>
                    <span class="ppc-v">{MOCK.cardDate}</span>
                  </div>
                  <div class="ppc-basic-footer-row">
                    <span class="ppc-k">授权单位</span>
                    <span class="ppc-v">{MOCK.authorizedUnit}</span>
                  </div>
                  <div class="ppc-basic-footer-row">
                    <span class="ppc-k">储存库点</span>
                    <span class="ppc-v ppc-basic-footer-val--wrap">{MOCK.storagePoint}</span>
                  </div>
                </div>
              </section>
            </div>

            <div class="ppc-column ppc-column--center">
              <section class="ppc-card ppc-storage-card">
                <div class="ppc-card-head">
                  <div class="ppc-card-head__left">
                    <LineChartOutlined style={{ fontSize: "16px" }} />
                    <h2 class="ppc-card-title">储量监测</h2>
                  </div>
                  <span class="ppc-status ppc-status--warn">
                    {formatOnlineOffline(MOCK.radarOnlineOffline.online, MOCK.radarOnlineOffline.offline)}
                  </span>
                </div>
                <div class="ppc-center-top">
                  <div class="ppc-hero-block ppc-hero-block--variety">
                    <span class="ppc-hero-label">储存品种</span>
                    <span class="ppc-hero-value">{MOCK.storageVariety}</span>
                  </div>
                  <div class="ppc-hero-block ppc-hero-block--weight">
                    <span class="ppc-hero-label">存储重量</span>
                    <div class="ppc-hero-weight-line">
                      <span class="ppc-hero-weight__num">{MOCK.storageWeightT.toLocaleString("zh-CN")}</span>
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
                        <span class="ppc-cap-stat__num">{MOCK.totalCapacityM3}</span>
                        <span class="ppc-cap-stat__unit">m³</span>
                      </div>
                      <div class="ppc-cap-stat">
                        <span class="ppc-cap-stat__lbl">已用</span>
                        <span class="ppc-cap-stat__num">{MOCK.usedM3}</span>
                        <span class="ppc-cap-stat__unit">m³</span>
                      </div>
                      <div class="ppc-cap-stat">
                        <span class="ppc-cap-stat__lbl">剩余</span>
                        <span class="ppc-cap-stat__num">{MOCK.remainingM3}</span>
                        <span class="ppc-cap-stat__unit">m³</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ppc-metric-grid ppc-metric-grid--4">
                  <div class="ppc-metric-cell ppc-metric-cell--stack">
                    <span class="ppc-metric-cell__v ppc-metric-cell__v--stat">{MOCK.digitalGrainVolumeM3}</span>
                    <span class="ppc-metric-cell__k">数字粮体积m³</span>
                  </div>
                  <div class="ppc-metric-cell ppc-metric-cell--stack">
                    <span class="ppc-metric-cell__v ppc-metric-cell__v--stat">{MOCK.deductedVolumeM3}</span>
                    <span class="ppc-metric-cell__k">扣除体积m³</span>
                  </div>
                  <div class="ppc-metric-cell ppc-metric-cell--stack">
                    <span class="ppc-metric-cell__v ppc-metric-cell__v--empty">--</span>
                    <span class="ppc-metric-cell__k">包存量包数</span>
                  </div>
                  <div class="ppc-metric-cell ppc-metric-cell--stack">
                    <span class="ppc-metric-cell__v ppc-metric-cell__v--empty">--</span>
                    <span class="ppc-metric-cell__k">平均包重</span>
                  </div>
                </div>
                <div class="ppc-two-col">
                  <div>
                    <span class="ppc-k">入仓时间</span>
                    <span class="ppc-v"> {MOCK.inboundTime}</span>
                  </div>
                  <div>
                    <span class="ppc-k">产地</span>
                    <span class="ppc-v"> {MOCK.origin}</span>
                  </div>
                  <div>
                    <span class="ppc-k">储存性质</span>
                    <span class="ppc-v"> {MOCK.storageNature}</span>
                  </div>
                  <div>
                    <span class="ppc-k">收获年度</span>
                    <span class="ppc-v"> {MOCK.harvestYear}</span>
                  </div>
                  <div class="ppc-two-col__full">
                    <span class="ppc-k">保管方式</span>
                    <span class="ppc-v"> {MOCK.custodyMethod}</span>
                  </div>
                </div>
                <h3 class="ppc-subhead">质量指标</h3>
                <div class="ppc-metric-grid ppc-metric-grid--4">
                  <div class="ppc-metric-cell ppc-metric-cell--stack">
                    <span class="ppc-metric-cell__v ppc-metric-cell__v--stat">{MOCK.quality.bulkDensity}</span>
                    <span class="ppc-metric-cell__k">容重/粗糙率</span>
                  </div>
                  <div class="ppc-metric-cell ppc-metric-cell--stack">
                    <span class="ppc-metric-cell__v ppc-metric-cell__v--stat">{MOCK.quality.roughness}</span>
                    <span class="ppc-metric-cell__k">容重/粗糙率</span>
                  </div>
                  <div class="ppc-metric-cell ppc-metric-cell--stack">
                    <span class="ppc-metric-cell__v ppc-metric-cell__v--empty">{MOCK.quality.moisture}</span>
                    <span class="ppc-metric-cell__k">折合水分</span>
                  </div>
                  <div class="ppc-metric-cell ppc-metric-cell--stack">
                    <span class="ppc-metric-cell__v ppc-metric-cell__v--empty">{MOCK.quality.headRice}</span>
                    <span class="ppc-metric-cell__k">整精米粒/不完善粒</span>
                  </div>
                </div>
                <h3 class="ppc-subhead ppc-subhead--detection">检测记录</h3>
                <div class="ppc-table-scroll">
                  <table class="ppc-table">
                    <thead>
                      <tr>
                        <th>检测时间</th>
                        <th>水分%</th>
                        <th>粗糙率%</th>
                        <th>脂肪酸值mgKOH/100g</th>
                        <th>色泽气味</th>
                        <th>检测人</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK.detectionRecords.map((row) => (
                        <tr key={row.time}>
                          <td>{row.time}</td>
                          <td>{row.moisture}</td>
                          <td>{row.roughness}</td>
                          <td>{row.fattyAcid}</td>
                          <td>{row.appearance}</td>
                          <td>{row.inspector}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div class="ppc-column ppc-column--side ppc-right-stack">
              <section
                class="ppc-card ppc-card--clickable"
                role="link"
                tabindex={0}
                aria-label="打开温度监测外部页面"
                onClick={() => {
                  openExternal(TEMP_HUMIDITY_MONITOR_EXTERNAL);
                }}
                onKeydown={onThCardKey}
              >
                <div class="ppc-card-head">
                  <div class="ppc-card-head__left">
                    <LineChartOutlined style={{ fontSize: "16px" }} />
                    <h2 class="ppc-card-title">温度监测</h2>
                  </div>
                  <span class="ppc-status ppc-status--ok">
                    {formatOnlineOffline(MOCK.tempOnlineOffline.online, MOCK.tempOnlineOffline.offline)}
                  </span>
                </div>
                <div class="ppc-temp-gauges">
                  <div class="ppc-temp-gauge-item">
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
                <p class="ppc-foot-note">
                  <span class="ppc-foot-note__badge">当前粮湿正常</span>
                </p>
              </section>

              <section class="ppc-card">
                <div class="ppc-card-head">
                  <div class="ppc-card-head__left">
                    <LineChartOutlined style={{ fontSize: "16px" }} />
                    <h2 class="ppc-card-title">气体监测</h2>
                  </div>
                  <span class="ppc-status ppc-status--warn">
                    {formatOnlineOffline(MOCK.gasOnlineOffline.online, MOCK.gasOnlineOffline.offline)}
                  </span>
                </div>
                <div class="ppc-gas-row">
                  <div class="ppc-gas-head">
                    <span class="ppc-gas-name">二氧化碳 (CO2)</span>
                    <span class="ppc-gas-val">{MOCK.gasCo2}</span>
                  </div>
                  <div class="ppc-gas-bar">
                    <div class="ppc-bar-track">
                      <div class="ppc-bar-fill ppc-bar-fill--co2" style={{ width: "72%" }} />
                    </div>
                  </div>
                </div>
                <div class="ppc-gas-row">
                  <div class="ppc-gas-head">
                    <span class="ppc-gas-name">氧气 (O2)</span>
                    <span class="ppc-gas-val">{MOCK.gasO2}</span>
                  </div>
                  <div class="ppc-gas-bar">
                    <div class="ppc-bar-track">
                      <div class="ppc-bar-fill ppc-bar-fill--o2" style={{ width: "84%" }} />
                    </div>
                  </div>
                </div>
                <div class="ppc-gas-row">
                  <div class="ppc-gas-head">
                    <span class="ppc-gas-name">磷化氢 (PH₃)</span>
                    <span class="ppc-gas-val">{MOCK.gasPh3}</span>
                  </div>
                  <div class="ppc-gas-bar">
                    <div class="ppc-bar-track">
                      <div class="ppc-bar-fill ppc-bar-fill--ph3" style={{ width: "18%" }} />
                    </div>
                  </div>
                </div>
                <div class="ppc-alert">湿度超标告警</div>
              </section>

              <section
                class="ppc-card ppc-card--clickable"
                role="link"
                tabindex={0}
                aria-label="打开湿度监测外部页面"
                onClick={() => {
                  openExternal(TEMP_HUMIDITY_MONITOR_EXTERNAL);
                }}
                onKeydown={onThCardKey}
              >
                <div class="ppc-card-head">
                  <div class="ppc-card-head__left">
                    <CloudOutlined style={{ fontSize: "16px" }} />
                    <h2 class="ppc-card-title">湿度监测</h2>
                  </div>
                  <span class="ppc-status ppc-status--warn">
                    {formatOnlineOffline(MOCK.humidityOnlineOffline.online, MOCK.humidityOnlineOffline.offline)}
                  </span>
                </div>
                <div ref={humidityGaugeRef} class="ppc-echarts ppc-echarts--humidity-gauge" aria-hidden />
                <div class="ppc-alert">湿度超标告警</div>
                <div ref={humidityBarRef} class="ppc-echarts ppc-echarts--humidity-bar" aria-hidden />
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
