import moment, { type Moment } from "moment";
import { computed, defineComponent, onMounted, reactive } from "vue";
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";

import { type TrafficDetectionAreaPersonFlowRankVO } from "@ghcloud/cube-traffic-detection-service";

import { usePeopleFlow } from "../../hooks/use-people-flow";
import { trafficStore } from "../../store/traffic";
import { cubeTrafficStatisticsService } from "@/api/service";
import NoData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

import styles from "./people-flow-distribution.module.less";

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
}

interface RankItem extends TrafficDetectionAreaPersonFlowRankVO {
  id?: number | string;
  name?: string;
  totalPersonNumber?: number;
  avgPersonNumber?: number;
  peakPersonNumber?: number;
}

const rankColors = ["#2f7bff", "#35c56f", "#ff9f18", "#7c61ff", "#ec5ca8", "#13c2c2"];
const timeOptions: TimeOption[] = [
  { label: "今日", value: "TODAY" },
  { label: "本月", value: "MONTH" },
  { label: "今年", value: "YEAR" },
];

const formatNumber = (value?: number): string => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue.toLocaleString() : "0";
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
    };
  }

  if (type === "YEAR") {
    const begin = now.clone().startOf("year");
    return {
      type,
      period: buildPeriod(begin, begin.clone().endOf("year")),
      granularity: "MONTH",
    };
  }

  const begin = now.clone().startOf("day");
  return {
    type,
    period: buildPeriod(begin, begin.clone().endOf("day")),
    granularity: "HOUR",
  };
};

const unwrapList = (
  res?: TrafficDetectionAreaPersonFlowRankVO[] | { data?: TrafficDetectionAreaPersonFlowRankVO[] },
): TrafficDetectionAreaPersonFlowRankVO[] => {
  if (Array.isArray(res)) {
    return res;
  }
  if (Array.isArray(res?.data)) {
    return res.data;
  }
  return [];
};

// 区域人流排行榜
export const PeopleFlowDistribution = defineComponent({
  name: "PeopleFlowDistribution",
  setup() {
    const { showPreloadAreaHeatmap } = usePeopleFlow();
    const store = trafficStore();
    const state = reactive({
      timeType: "TODAY" as TimeType,
      list: [] as RankItem[],
      loading: false,
    });

    const averageTitle = computed(() => "时均人次");
    const list = computed(() => state.list);

    const patchList = (data?: TrafficDetectionAreaPersonFlowRankVO[]): void => {
      state.list = (data ?? []).map((item, index) => ({
        ...item,
        id: item.id ?? `${item.name ?? "area"}-${index}`,
        totalPersonNumber: item.totalPersonNumber || 0,
        avgPersonNumber: item.avgPersonNumber || 0,
        peakPersonNumber: item.peakPersonNumber || 0,
      }));
    };

    const getData = async (): Promise<void> => {
      const config = getPeriodConfig(state.timeType);
      try {
        state.loading = true;
        const result = await cubeTrafficStatisticsService.getTrafficAreaPersonFlowAreaRank({
          type: config.type,
          period: config.period,
          granularity: config.granularity,
          sortField: "TOTAL",
        });
        patchList(unwrapList(result.records));
      } catch {
        patchList();
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

    const handleCurrent = (item: RankItem): void => {
      store.updateCurrentTraffic(item);
      showPreloadAreaHeatmap();
    };

    const renderRankItem = (item: RankItem, index: number, isZoom: boolean = false) => {
      const rankColor = rankColors[index % rankColors.length];
      const rowClass = isZoom ? styles.zoomTableRow : styles.tableRow;
      const rankClass = isZoom ? [styles.zoomRank, index < 3 ? styles.topRank : ""] : [styles.rank, index < 3 ? styles.topRank : ""];
      const areaNameClass = isZoom ? styles.zoomAreaName : styles.areaName;
      return (
        <div class={rowClass} key={item.id} onClick={() => handleCurrent(item)} data-no-zoom>
          <span class={rankClass}>{index + 1}</span>
          <span class={areaNameClass} title={item.name || "--"}>
            <i style={{ backgroundColor: rankColor }}></i>
            {item.name || "--"}
          </span>
          <span>{formatNumber(item.totalPersonNumber)}</span>
          <span>{formatNumber(item.avgPersonNumber)}</span>
          <span>{formatNumber(item.peakPersonNumber)}</span>
        </div>
      );
    };

    const renderList = () => {
      if (!list.value.length && !state.loading) {
        return (
          <div class={styles.empty}>
            <NoData />
          </div>
        );
      }

      if (list.value.length < 7) {
        return <div class={styles.tableBody}>{list.value.map(renderRankItem)}</div>;
      }

      return (
        <Vue3SeamlessScroll list={list.value} step={0.5} hover={true} style={{ height: "100%", overflow: "hidden" }}>
          {list.value.map(renderRankItem)}
        </Vue3SeamlessScroll>
      );
    };

    onMounted(() => {
      getData();
    });

    return () => (
      <SubPanelTemplate
        title="区域人流排行榜"
        zoomable
        zoom-title="区域人流排行榜详情"
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
            <div class={styles.zoomRankTable}>
              <div class={styles.zoomTableHead}>
                <span>排名</span>
                <span>名称</span>
                <span>累计人次</span>
                <span>{averageTitle.value}</span>
                <span>峰值人数</span>
              </div>
              <div class={styles.zoomScroll}>
                {list.value.length === 0 && !state.loading ? (
                  <div class={styles.zoomEmpty}>
                    <NoData />
                  </div>
                ) : list.value.length < 7 ? (
                  <div class={styles.zoomTableBody}>{list.value.map((item, index) => renderRankItem(item, index, true))}</div>
                ) : (
                  <Vue3SeamlessScroll list={list.value} step={0.5} hover={true} style={{ height: "100%", overflow: "hidden" }}>
                    {list.value.map((item, index) => renderRankItem(item, index, true))}
                  </Vue3SeamlessScroll>
                )}
              </div>
            </div>
          ),
        }}
      >
        <div class={styles.rankTable} data-no-zoom>
          <div class={styles.tableHead}>
            <span>排名</span>
            <span>名称</span>
            <span>累计人次</span>
            <span>{averageTitle.value}</span>
            <span>峰值人数</span>
          </div>
          <div class={styles.scroll}>{renderList()}</div>
        </div>
      </SubPanelTemplate>
    );
  },
});
