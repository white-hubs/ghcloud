import { computed, defineComponent, onMounted, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { energyDailySummaryTrend } from "@/infrastructure/api/energy";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import lineAndPillarCharts from "@/shared-ui/panel/charts/lineAndPillar/lineAndPillar-charts";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import type { ModelValueItf } from "@/shared-ui/panel/types";

import "./carbon-trends.module.less";

const titleIcon = getThemeImage("energy-consumption-statistics.png");

export const CarbonTrends = defineComponent({
  name: "CarbonTrends",
  props: {
    title: { type: String, required: true, default: "碳排量趋势图" },
  },
  setup(props) {
    const timeFrame = ref<ModelValueItf>({ timeType: "THIS_MONTH", dateRange: ["", ""] });
    const xData = ref<string[]>([]);
    const yData = ref<string[]>([]);
    const hasChartData = computed(() => xData.value.length > 0 && yData.value.some((value) => Number(value) !== 0));

    const getAlarmLevel = async (): Promise<void> => {
      xData.value = [];
      yData.value = [];
      const res = await energyDailySummaryTrend({
        type: timeFrame.value.timeType,
        period: timeFrame.value.dateRange.join(","),
      });
      xData.value = res.map((item: { time: { toString: () => string } }) => item.time.toString());
      yData.value = res.map((item: { dcValue: { toString: () => string } }) => item.dcValue.toString());
    };

    onMounted(() => {
      void getAlarmLevel();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["energy-v2-chart-panel", isZoom ? "is-zoom" : ""]}>
          {hasChartData.value ? (
            <lineAndPillarCharts unit={{ x: "", y: "kgCO2e" }} legend={["碳排"]} xData={xData.value} yData={yData.value} />
          ) : (
            <NoData />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root carbon-trends-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card energy-v2-panel carbon-trends-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => (
              <div class="energy-v2-filter-group" data-no-zoom>
                <DateInlineForm
                  modelValue={timeFrame.value}
                  onUpdate:modelValue={(v) => {
                    timeFrame.value = v;
                  }}
                  onSearch={getAlarmLevel}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default CarbonTrends;
