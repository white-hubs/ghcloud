import dayjs from "dayjs";
import { defineComponent } from "vue";
import { reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { callTrends } from "@/infrastructure/api/medical-intercom";
import LineChart from "@/shared-ui/panel/lineChart";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./distribution-call-time-periods.module.less";

export const DistributionCallTimePeriods = defineComponent({
  name: "DistributionCallTimePeriods",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const distributionChartData = reactive({
      xData: ["4", "8", "12", "16", "20", "24h"],
      yData: [
        {
          data: [],
          smooth: false,
          linearGradientColor: ["rgba(24, 144, 255, 1)", "rgba(120, 252, 252, 0.1)"],
          lineColor: "rgba(120, 252, 252, 1)",
        },
      ],
    });
    //呼叫时段分布
    const getCallTrends = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: [dayjs().format("YYYY-MM-DD 00:00:00"), dayjs().format("YYYY-MM-DD HH:mm:ss")].join(","),
        type: "TODAY",
      };
      const res = await callTrends(param);
      distributionChartData.xData = res.xtitle;
      distributionChartData.yData[0].data = res.xtitle.map((xItem) => {
        return res.callTrends.find((item) => item.timeFlag === xItem) ? res.callTrends.find((item) => item.timeFlag === xItem).num : 0;
      });
    };
    onMounted(() => {
      getCallTrends();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="呼叫时段分布">
        {" "}
        <div class="charts">
          {" "}
          <LineChart
            x-data={distributionChartData.xData}
            series={distributionChartData.yData}
            showLegend={false}
            gridTop="15"
            unit={{ x: "", y: "次" }}
          />
        </div>
      </SubPanelTemplate>
    );
  },
});

export default DistributionCallTimePeriods;
