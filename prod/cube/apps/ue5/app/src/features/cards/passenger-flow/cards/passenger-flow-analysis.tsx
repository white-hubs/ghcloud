import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { passengerFlowMuseum } from "@/infrastructure/api/passenger-flow";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./passenger-flow-analysis.module.less";

export const PassengerFlowAnalysis = defineComponent({
  name: "PassengerFlowAnalysis",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const enterTime = ref<ModelValueItf>();

    const receptionTrendsChartData = reactive({
      xData: [],
      yData: [
        { data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" },
      ],
    });

    //在馆客流分析======================================================
    const getPassengerFlowMuseum = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: enterTime.value.dateRange.join(","),
        type: enterTime.value.timeType,
      };
      receptionTrendsChartData.xData = [];
      const res = await passengerFlowMuseum(params);
      receptionTrendsChartData.xData = res.xtitle;
      receptionTrendsChartData.yData[0].data = [];
      res.analysis.forEach((item, index) => {
        receptionTrendsChartData.yData[0].data.push(item.num);
      });
    };

    onMounted(() => {
      getPassengerFlowMuseum();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="客流分析图">
          <template>
            {" "}
            <DateInlineForm
              modelValue={enterTime.value}
              onUpdate:modelValue={(v) => {
                enterTime.value = v;
              }}
              onSearch={getPassengerFlowMuseum}
            ></DateInlineForm>
          </template>
          <div class="chart">
            {" "}
            <LineChart
              x-data={receptionTrendsChartData.xData}
              series={receptionTrendsChartData.yData}
              showLegend={false}
              gridTop="20"
              unit={{ x: "", y: "人次" }}
            />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PassengerFlowAnalysis;
