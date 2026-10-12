import moment, { type Moment } from "moment";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import { type TrafficDetectionPersonFlowSummaryVO } from "@ghcloud/cube-traffic-detection-service";

import { FlowStatsBody, type FlowStatItem } from "./flow-stats-body";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeTrafficStatisticsService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";

import "./people-flow-today-statistics.module.less";

const peopleFlowStatisticsIcon = getThemeImage("people-flow-statistics.png");

type TrendType = "up" | "down";
type TimeType = "TODAY" | "MONTH" | "YEAR";
type Granularity = "HOUR" | "DAY" | "MONTH";

interface PeriodConfig {
  type: TimeType;
  period: string;
  granularity: Granularity;
  badge: string;
  averageTitle: string;
  averageUnit: string;
  peakTitle: string;
}

const timeList = [
  { label: "今日", value: "TODAY" },
  { label: "本月", value: "THIS_MONTH" },
  { label: "今年", value: "THIS_YEAR" },
];

const mapFormTypeToApiType = (timeType: string): TimeType => {
  if (timeType === "THIS_MONTH") return "MONTH";
  if (timeType === "THIS_YEAR") return "YEAR";
  return "TODAY";
};

const normalizeRate = (value?: number): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatRate = (value?: number): string => `${Math.abs(normalizeRate(value)).toFixed(1)}%`;

const unwrapData = (
  res?: TrafficDetectionPersonFlowSummaryVO | { data?: TrafficDetectionPersonFlowSummaryVO },
): TrafficDetectionPersonFlowSummaryVO => {
  if (res?.data && typeof res.data === "object") return res.data;
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

export const PeopleFlowTodayStatistics = defineComponent({
  name: "PeopleFlowTodayStatistics",
  props: {
    fillPanel: { type: Boolean, default: false },
  },
  setup(props) {
    const dateFilter = ref({
      timeType: "TODAY",
      dateRange: [] as string[],
    });

    const state = reactive({
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
      const apiType = mapFormTypeToApiType(dateFilter.value.timeType);
      const config = getPeriodConfig(apiType);
      const period = dateFilter.value.dateRange.join(",") || config.period;
      try {
        state.loading = true;
        const res = await cubeTrafficStatisticsService.getTrafficAreaPersonFlowSummary({
          type: config.type,
          period,
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

    const statItems = computed<FlowStatItem[]>(() => {
      const config = getPeriodConfig(mapFormTypeToApiType(dateFilter.value.timeType));
      const momRate = normalizeRate(state.summary.totalMomRate);
      const yoyRate = normalizeRate(state.summary.totalYoyRate);

      return [
        {
          icon: "people",
          label: "累计人次",
          badge: config.badge,
          numericValue: state.summary.totalPersonNumber || 0,
          unit: "次",
          trends: [
            { label: "环比", value: formatRate(momRate), type: (momRate >= 0 ? "up" : "down") as TrendType },
            { label: "同比去年", value: formatRate(yoyRate), type: (yoyRate >= 0 ? "up" : "down") as TrendType },
          ],
        },
        {
          icon: "chart",
          label: config.peakTitle,
          numericValue: state.summary.peakPersonNumber || 0,
          unit: "人次",
          note: state.summary.peakPeriod ? `小时峰值出现在 ${state.summary.peakPeriod}` : "暂无峰值时间",
        },
        {
          icon: "clock",
          label: config.averageTitle,
          numericValue: state.summary.avgPersonNumber || 0,
          unit: config.averageUnit,
        },
      ];
    });

    const primaryStat = computed(() => {
      const primary = statItems.value[0];
      const peakNote = statItems.value[1]?.note;
      return peakNote ? { ...primary, note: peakNote } : primary;
    });

    onMounted(() => {
      void getData();
    });

    return () => (
      <div class={["people-flow-today-statistics-v2-root", "v2-panel-root", props.fillPanel ? "is-fill-panel" : ""]}>
        <SubPanelTemplate
          title="人流量统计"
          class="visual-v2-sub-panel people-flow-today-statistics-v2-panel v2-panel-card"
          zoomable
          zoom-title="人流量统计详情"
          zoom-width={600}
          v-slots={{
            titleIcon: () => <img src={peopleFlowStatisticsIcon} alt="" class="title-card-icon" />,
            extra: () => <DateInlineForm v-model:modelValue={dateFilter.value} timeList={timeList} data-no-zoom onSearch={getData} />,
            "zoom-content": () => (
              <div class="people-flow-today-statistics-v2 people-flow-today-statistics-v2-panel is-zoom">
                <FlowStatsBody items={statItems.value} primary={primaryStat.value} isZoom data-no-zoom />
              </div>
            ),
          }}
        >
          <div class="people-flow-today-statistics-v2 people-flow-today-statistics-v2-panel v2-panel-body">
            <FlowStatsBody items={statItems.value} primary={primaryStat.value} fillPanel={props.fillPanel} data-no-zoom />
          </div>
        </SubPanelTemplate>
      </div>
    );
  },
});
