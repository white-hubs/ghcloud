import { Skeleton } from "ant-design-vue";
import moment, { type Moment } from "moment";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import { type TrafficDetectionAreaPersonFlowRankVO } from "@ghcloud/cube-traffic-detection-service";

import { RankListBody, type RankItem } from "./rank-list-body";
import { usePeopleFlow } from "@/features/cards/people-flow/hooks/use-people-flow";
import { trafficStore } from "@/features/cards/people-flow/store/traffic";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeTrafficStatisticsService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";

import "./people-flow-distribution.module.less";

const regionalPedestrianFlowRankingIcon = getThemeImage("regional-pedestrian-flow-ranking.png");
const scrollThreshold = 4;

type TimeType = "TODAY" | "MONTH" | "YEAR";
type Granularity = "HOUR" | "DAY" | "MONTH";

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

const buildPeriod = (begin: Moment, end: Moment): string => `${begin.format("YYYY-MM-DD HH:mm:ss")},${end.format("YYYY-MM-DD HH:mm:ss")}`;

const getPeriodConfig = (type: TimeType): { type: TimeType; period: string; granularity: Granularity } => {
  const now = moment();
  if (type === "MONTH") {
    const begin = now.clone().startOf("month");
    return { type, period: buildPeriod(begin, begin.clone().endOf("month")), granularity: "DAY" };
  }
  if (type === "YEAR") {
    const begin = now.clone().startOf("year");
    return { type, period: buildPeriod(begin, begin.clone().endOf("year")), granularity: "MONTH" };
  }
  const begin = now.clone().startOf("day");
  return { type, period: buildPeriod(begin, begin.clone().endOf("day")), granularity: "HOUR" };
};

export const PeopleFlowDistribution = defineComponent({
  name: "PeopleFlowDistribution",
  setup() {
    const dateFilter = ref({ timeType: "TODAY", dateRange: [] as string[] });
    const { showPreloadAreaHeatmap } = usePeopleFlow();
    const store = trafficStore();

    const state = reactive({
      list: [] as RankItem[],
      loading: false,
    });

    const averageTitle = computed(() => {
      const apiType = mapFormTypeToApiType(dateFilter.value.timeType);
      if (apiType === "MONTH") return "日均人次";
      if (apiType === "YEAR") return "月均人次";
      return "时均人次";
    });

    const peakTitle = computed(() => {
      const apiType = mapFormTypeToApiType(dateFilter.value.timeType);
      if (apiType === "MONTH") return "日峰值";
      if (apiType === "YEAR") return "月峰值";
      return "峰值人数";
    });

    const list = computed(() => state.list);
    const total = computed(() => state.list.reduce((sum, item) => sum + (item.totalPersonNumber || 0), 0));
    const peakMax = computed(() => (state.list.length ? Math.max(...state.list.map((item) => item.peakPersonNumber || 0)) : 0));
    const maxTotal = computed(() => (state.list.length ? Math.max(...state.list.map((item) => item.totalPersonNumber || 0)) : 0));

    const patchList = (data?: TrafficDetectionAreaPersonFlowRankVO[]): void => {
      state.list = (data ?? [])
        .map((item, index) => ({
          ...item,
          id: item.id ?? `${item.name ?? "area"}-${index}`,
          totalPersonNumber: item.totalPersonNumber || 0,
          avgPersonNumber: item.avgPersonNumber || 0,
          peakPersonNumber: item.peakPersonNumber || 0,
        }))
        .sort((a, b) => (b.totalPersonNumber || 0) - (a.totalPersonNumber || 0));
    };

    const getData = async (): Promise<void> => {
      const apiType = mapFormTypeToApiType(dateFilter.value.timeType);
      const config = getPeriodConfig(apiType);
      const period = dateFilter.value.dateRange.join(",") || config.period;
      try {
        state.loading = true;
        const result = await cubeTrafficStatisticsService.getTrafficAreaPersonFlowAreaRank({
          type: config.type,
          period,
          granularity: config.granularity,
          sortField: "TOTAL",
        });
        const records = Array.isArray(result?.records)
          ? result.records
          : Array.isArray(result)
            ? result
            : Array.isArray((result as { data?: TrafficDetectionAreaPersonFlowRankVO[] })?.data)
              ? (result as { data: TrafficDetectionAreaPersonFlowRankVO[] }).data
              : [];
        patchList(records);
      } catch {
        patchList();
      } finally {
        state.loading = false;
      }
    };

    const handleCurrent = (item: RankItem): void => {
      store.updateCurrentTraffic(item);
      showPreloadAreaHeatmap();
    };

    onMounted(() => {
      void getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <RankListBody
        list={list.value}
        total={total.value}
        areaCount={list.value.length}
        peakMax={peakMax.value}
        averageTitle={averageTitle.value}
        peakTitle={peakTitle.value}
        maxTotal={maxTotal.value}
        scrollThreshold={scrollThreshold}
        isZoom={isZoom}
        data-no-zoom
        onSelect={handleCurrent}
      />
    );

    return () => (
      <div class="people-flow-distribution-v2-root v2-panel-root">
        <SubPanelTemplate
          title="区域人流排行榜"
          class="visual-v2-sub-panel people-flow-distribution-v2-panel v2-panel-card"
          zoomable
          zoom-title="区域人流排行榜详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={regionalPedestrianFlowRankingIcon} alt="" class="title-card-icon" />,
            extra: () => <DateInlineForm v-model:modelValue={dateFilter.value} timeList={timeList} data-no-zoom onSearch={getData} />,
            "zoom-content": () => (
              <Skeleton loading={state.loading} active>
                {renderBody(true)}
              </Skeleton>
            ),
          }}
        >
          <Skeleton loading={state.loading} active>
            {renderBody(false)}
          </Skeleton>
        </SubPanelTemplate>
      </div>
    );
  },
});
