import moment from "moment";
import { defineComponent } from "vue";
import { reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { passengerFlowRegions } from "@/infrastructure/api/passenger-flow";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./passenger-flow-regional.module.less";

export const PassengerFlowRegional = defineComponent({
  name: "PassengerFlowRegional",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    //各个区域客流量==================================================================================
    const areaChart = reactive({
      xData: [],
      yData: [],
    });

    const getPassengerFlowRegions = async () => {
      const date = [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(",");
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: date,
      };
      const res = await passengerFlowRegions(params);
      areaChart.xData = [];
      areaChart.yData = [];
      res.forEach((item) => {
        areaChart.xData.push(item.areaName);
        areaChart.yData.push(item.num);
      });
    };

    onMounted(() => {
      getPassengerFlowRegions();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="各个区域客流量">
        {" "}
        <div class="chart">
          {" "}
          <barChart
            title={"人次"}
            unit={"人"}
            x-data={areaChart.xData}
            data={[{ color: "#1890FF", name: "", data: areaChart.yData }]}
            class="columnBox"
          />
        </div>
      </SubPanelTemplate>
    );
  },
});

export default PassengerFlowRegional;
