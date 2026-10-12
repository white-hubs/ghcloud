import { computed, defineComponent, onMounted, onUnmounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { visualizationQuestionnaire } from "@/infrastructure/api/merchant";
import { splitArray } from "@/infrastructure/utils/common";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./merchant-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card merchant-v2-panel";

export const QuestionnaireStats = defineComponent({
  name: "QuestionnaireStats",
  setup() {
    const statisticsTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const totalData = reactive({
      statisticsTotal: [] as any[][],
    });
    const numTotal = reactive({
      statistics: 0,
    });
    const timer = ref<ReturnType<typeof setInterval> | null>(null);
    const barData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          name: "问卷数量",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });
    const hasData = computed(() => barData.yData.some((item) => item.data.some((value) => Number(value || 0) > 0)));

    const updateBarData = () => {
      const currentData = totalData.statisticsTotal[numTotal.statistics] || [];
      barData.xData = currentData.map((item) => item?.name || "--");
      barData.yData[0].data = currentData.map((item) => Number(item?.value || 0));
    };

    const changeStatisticsTime = async () => {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
      const res = await visualizationQuestionnaire({ period: statisticsTime.value.dateRange.join(",") });
      totalData.statisticsTotal = splitArray(Array.isArray(res) ? res : [], 5);
      numTotal.statistics = 0;
      updateBarData();

      timer.value = setInterval(() => {
        if (totalData.statisticsTotal.length > 0) {
          numTotal.statistics = (numTotal.statistics + 1) % totalData.statisticsTotal.length;
          updateBarData();
        }
      }, 5000);
    };

    onMounted(() => {
      changeStatisticsTime();
    });

    onUnmounted(() => {
      if (timer.value) {
        clearInterval(timer.value);
      }
    });

    const renderExtra = (): JSX.Element => (
      <DateInlineForm
        modelValue={statisticsTime.value}
        onUpdate:modelValue={(v) => {
          statisticsTime.value = v;
        }}
        onSearch={changeStatisticsTime}
      />
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["merchant-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class={["merchant-v2-chart", isZoom ? "is-zoom" : ""]}>
            <OverviewChartBar title="次" gridTop={28} xData={barData.xData} yData={barData.yData} x-font-size={10.5} />
          </div>
        ) : (
          <div class={["merchant-v2-empty", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="merchant-v2-root">
        <SubPanelTemplate
          title="问卷调查统计"
          class={PANEL_CLASS}
          zoomable
          zoom-title="问卷调查统计详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="merchant-questionnaire" />,
            extra: renderExtra,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default QuestionnaireStats;
