import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { passengerFlowRegions } from "@/infrastructure/api/passenger-flow";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./passenger-flow-ranking.module.less";

export const PassengerFlowRanking = defineComponent({
  name: "PassengerFlowRanking",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const handleTime = ref<ModelValueItf>();

    //客流量排名====================================================================
    const areaChart = reactive({
      xData: [],
      yData: [],
    });

    const getPassengerFlowRegions = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
      };
      const res = await passengerFlowRegions(params);
      areaChart.xData = [];
      areaChart.yData = [];
      res.forEach((item, index) => {
        areaChart.xData.push(item.areaName);
        areaChart.yData.push(item.num);
      });
    };

    onMounted(() => {
      getPassengerFlowRegions();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="各区域客流量排名Top10">
          <template>
            {" "}
            <DateInlineForm
              modelValue={handleTime.value}
              onUpdate:modelValue={(v) => {
                handleTime.value = v;
              }}
              onSearch={getPassengerFlowRegions}
            ></DateInlineForm>
          </template>
          <div class="chart">
            {" "}
            <barChart
              title={""}
              x-data={areaChart.xData}
              max={9}
              inverse
              data={[{ color: "#1890FF", name: "人次", data: areaChart.yData }]}
              class="columnBox"
            />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PassengerFlowRanking;
