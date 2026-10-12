import moment, { type Moment } from "moment";
import { computed, defineComponent, onMounted, reactive } from "vue";

import { type TrafficDetectionPersonFlowSummaryVO } from "@ghcloud/cube-traffic-detection-service";

import { cubeTrafficStatisticsService } from "@/api/service";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

import styles from "./people-flow-today-statistics.module.less";

type TrendType = "up" | "down";
type IconType = "people" | "chart" | "clock";
type TimeType = "TODAY" | "MONTH" | "YEAR";
type Granularity = "HOUR" | "DAY" | "MONTH";

interface TimeOption {
  label: string;
  value: TimeType;
}

interface PeriodConfig {
  type: TimeType;
  period: string;
  granularity: Granularity;
  badge: string;
  averageTitle: string;
  averageUnit: string;
  peakTitle: string;
}

interface TrendItem {
  label: string;
  value: string;
  type: TrendType;
}

interface StatItem {
  icon: IconType;
  label: string;
  value: string;
  unit: string;
  badge?: string;
  trends?: TrendItem[];
  note?: string;
}

const timeOptions: TimeOption[] = [
  { label: "今日", value: "TODAY" },
  { label: "本月", value: "MONTH" },
  { label: "今年", value: "YEAR" },
];

const formatNumber = (value?: number): string => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue.toLocaleString() : "0";
};

const normalizeRate = (value?: number): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatRate = (value?: number): string => `${Math.abs(normalizeRate(value)).toFixed(1)}%`;

const unwrapData = (
  res?: TrafficDetectionPersonFlowSummaryVO | { data?: TrafficDetectionPersonFlowSummaryVO },
): TrafficDetectionPersonFlowSummaryVO => {
  if (res?.data && typeof res.data === "object") {
    return res.data;
  }
  return res && typeof res === "object" ? res : {};
};

const buildPeriod = (begin: Moment, end: Moment): string => `${begin.format("YYYY-MM-DD HH:mm:ss")},${end.format("YYYY-MM-DD HH:mm:ss")}`;

const getPeriodConfig = (type: TimeType): PeriodConfig => {
  const now = moment();

  if (type === "MONTH") {
    const begin = now.clone().startOf("month");
    return {
      type,
      period: buildPeriod(begin, begin.clone().endOf("month")),
      granularity: "DAY",
      badge: "本月",
      averageTitle: "日均人次",
      averageUnit: "次/日",
      peakTitle: "单日峰值在场人次",
    };
  }

  if (type === "YEAR") {
    const begin = now.clone().startOf("year");
    return {
      type,
      period: buildPeriod(begin, begin.clone().endOf("year")),
      granularity: "MONTH",
      badge: "今年",
      averageTitle: "月均人次",
      averageUnit: "次/月",
      peakTitle: "单月峰值在场人次",
    };
  }

  const begin = now.clone().startOf("day");
  return {
    type,
    period: buildPeriod(begin, begin.clone().endOf("day")),
    granularity: "HOUR",
    badge: "今日",
    averageTitle: "时均人次",
    averageUnit: "次/时",
    peakTitle: "小时峰值在场人次",
  };
};

const renderIcon = (type: IconType) => {
  if (type === "people") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4.2 18.8c.6-2.7 2-4 3.8-4s3.2 1.3 3.8 4H4.2Zm8 0c.5-2.1 1.8-3.2 3.8-3.2s3.3 1.1 3.8 3.2h-7.6Z" />
      </svg>
    );
  }

  if (type === "chart") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 19h14v-2H7V5H5v14Zm4-4h2v-4H9v4Zm4 0h2V8h-2v7Zm4 0h2v-6h-2v6Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 8.6 3 1.7-.9 1.5-3.9-2.3V7h1.8v5.6Z" />
    </svg>
  );
};

// 今日人流量统计
export const PeopleFlowTodayStatistics = defineComponent({
  name: "PeopleFlowTodayStatistics",
  setup() {
    const state = reactive({
      timeType: "TODAY" as TimeType,
      loading: false,
      summary: {
        totalPersonNumber: 0,
        totalMomRate: 0,
        totalYoyRate: 0,
        avgPersonNumber: 0,
        peakPersonNumber: 0,
        peakPeriod: "",
      } as TrafficDetectionPersonFlowSummaryVO,
    });

    const patchSummary = (data?: TrafficDetectionPersonFlowSummaryVO): void => {
      state.summary.totalPersonNumber = data?.totalPersonNumber || 0;
      state.summary.totalMomRate = data?.totalMomRate || 0;
      state.summary.totalYoyRate = data?.totalYoyRate || 0;
      state.summary.avgPersonNumber = data?.avgPersonNumber || 0;
      state.summary.peakPersonNumber = data?.peakPersonNumber || 0;
      state.summary.peakPeriod = data?.peakPeriod || "";
    };

    const getData = async (): Promise<void> => {
      const config = getPeriodConfig(state.timeType);
      try {
        state.loading = true;
        const res = await cubeTrafficStatisticsService.getTrafficAreaPersonFlowSummary({
          type: config.type,
          period: config.period,
          granularity: config.granularity,
          sortField: "TOTAL",
        });
        patchSummary(unwrapData(res));
      } catch {
        patchSummary();
      } finally {
        state.loading = false;
      }
    };

    const handleTimeChange = (value: TimeType): void => {
      if (state.timeType === value) {
        return;
      }
      state.timeType = value;
      getData();
    };

    const statItems = computed<StatItem[]>(() => {
      const config = getPeriodConfig(state.timeType);
      const momRate = normalizeRate(state.summary.totalMomRate);
      const yoyRate = normalizeRate(state.summary.totalYoyRate);

      return [
        {
          icon: "people",
          label: "累计人次",
          badge: config.badge,
          value: formatNumber(state.summary.totalPersonNumber),
          unit: "次",
          trends: [
            { label: "环比", value: formatRate(momRate), type: momRate >= 0 ? "up" : "down" },
            { label: "同比去年", value: formatRate(yoyRate), type: yoyRate >= 0 ? "up" : "down" },
          ],
        },
        {
          icon: "chart",
          label: config.peakTitle,
          value: formatNumber(state.summary.peakPersonNumber),
          unit: "人次",
          note: state.summary.peakPeriod ? `出现在 ${state.summary.peakPeriod}` : "暂无峰值时间",
        },
        {
          icon: "clock",
          label: config.averageTitle,
          value: formatNumber(state.summary.avgPersonNumber),
          unit: config.averageUnit,
        },
      ];
    });

    onMounted(() => {
      getData();
    });

    return () => (
      <SubPanelTemplate
        title="人流量统计"
        zoomable
        zoom-title="人流量统计详情"
        zoom-width={600}
        v-slots={{
          extra: () => (
            <div class={styles.timeSwitch} data-no-zoom>
              {timeOptions.map((item) => (
                <button
                  class={[styles.timeButton, state.timeType === item.value ? styles.active : ""]}
                  type="button"
                  key={item.value}
                  onClick={() => handleTimeChange(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ),
          "zoom-content": () => (
            <div class={styles.zoomTodayStatistics}>
              {statItems.value.map((item) => (
                <div class={styles.zoomStatItem} key={item.label}>
                  <div class={styles.zoomIcon}>{renderIcon(item.icon)}</div>
                  <div class={styles.zoomContent}>
                    <div class={styles.zoomLabelRow}>
                      <span class={styles.zoomLabel}>{item.label}</span>
                      {item.badge ? <span class={styles.zoomBadge}>{item.badge}</span> : null}
                    </div>
                    <div class={styles.zoomValueRow}>
                      <span class={styles.zoomValue}>{item.value}</span>
                      <span class={styles.zoomUnit}>{item.unit}</span>
                    </div>
                    {item.trends?.length ? (
                      <div class={styles.zoomMeta}>
                        {item.trends.map((trend) => (
                          <span class={trend.type === "up" ? styles.up : styles.down} key={trend.label}>
                            {trend.label} {trend.type === "up" ? "↑" : "↓"}
                            {trend.value}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {item.note ? <div class={styles.zoomNote}>{item.note}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          ),
        }}
      >
        <div class={styles.todayStatistics} data-no-zoom>
          {statItems.value.map((item) => (
            <div class={styles.statItem} key={item.label}>
              <div class={styles.icon}>{renderIcon(item.icon)}</div>
              <div class={styles.content}>
                <div class={styles.labelRow}>
                  <span class={styles.label}>{item.label}</span>
                  {item.badge ? <span class={styles.badge}>{item.badge}</span> : null}
                </div>
                <div class={styles.valueRow}>
                  <span class={styles.value}>{item.value}</span>
                  <span class={styles.unit}>{item.unit}</span>
                </div>
                {item.trends?.length ? (
                  <div class={styles.meta}>
                    {item.trends.map((trend) => (
                      <span class={trend.type === "up" ? styles.up : styles.down} key={trend.label}>
                        {trend.label} {trend.type === "up" ? "↑" : "↓"}
                        {trend.value}
                      </span>
                    ))}
                  </div>
                ) : null}
                {item.note ? <div class={styles.note}>{item.note}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </SubPanelTemplate>
    );
  },
});
