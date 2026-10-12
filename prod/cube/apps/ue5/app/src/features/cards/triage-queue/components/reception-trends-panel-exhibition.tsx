import { defineComponent } from "vue";
import { onMounted, onUnmounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getXaxleData, px2rem } from "@/infrastructure/utils/common";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

export const ReceptionTrendsPanelExhibition = defineComponent({
  name: "ReceptionTrendsPanelExhibition",
  props: {
    chartHeight: { type: Number, required: false, default: 180 },
  },
  setup(props, ctx) {
    const changeReceptionTrendsTime = (): void => {
      // TODO (张正) 接口调用
      const { timeType } = receptionTrendsTime.value;
      if (timeType === "TODAY") {
        receptionTrendsChartData.yData[0].data = [0, 50, 20, 200, 150, 20];
        receptionTrendsChartData.xData = ["4", "8", "12", "16", "20", "24h"];
      } else if (timeType === "THIS_WEEK") {
        receptionTrendsChartData.yData[0].data = [0, 150, 220, 400, 350, 20, 10];
        receptionTrendsChartData.xData = ["1", "2", "3", "4", "5", "6", "7天"];
      } else if (timeType === "THIS_MONTH") {
        receptionTrendsChartData.yData[0].data = [10, 350, 520, 700, 450, 80];
        receptionTrendsChartData.xData = ["1", "5", "10", "15", "20", "25", "30日"];
      } else if (timeType === "THIS_YEAR") {
        receptionTrendsChartData.yData[0].data = [110, 1350, 1520, 1700, 550, 280];
        receptionTrendsChartData.xData = ["1", "3", "5", "7", "9", "12月"];
      }
    };
    const receptionTrendsChartData = reactive({
      xData: ["4", "8", "12", "16", "20", "24h"],
      yData: [
        { data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" },
      ],
    });

    let timer = null;
    let fakeData = ["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_YEAR"];
    let fakeIndex = 1;
    onMounted(() => {
      timer = setInterval(() => {
        receptionTrendsTime.value.timeType = fakeData[fakeIndex];
        changeReceptionTrendsTime();
        fakeIndex++;
        if (fakeIndex > fakeData.length - 1) {
          fakeIndex = 0;
        }
      }, 1000 * 20);
    });
    onUnmounted(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="接诊趋势">
          <template>
            {" "}
            <DateInlineForm
              modelValue={receptionTrendsTime}
              onUpdate:modelValue={(v) => {
                receptionTrendsTime.value = v;
              }}
              onSearch={changeReceptionTrendsTime}
            ></DateInlineForm>
          </template>
          <div style={{ height: px2rem(chartHeight + "px") }}>
            {" "}
            <LineChart
              x-data={receptionTrendsChartData.xData}
              series={receptionTrendsChartData.yData}
              showLegend={false}
              gridTop="15"
              unit={{ x: "", y: "人次" }}
            />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default ReceptionTrendsPanelExhibition;
