import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./trend-enterprise-settlement.module.less";

export const TrendEnterpriseSettlement = defineComponent({
  name: "TrendEnterpriseSettlement",
  setup(_props, ctx) {
    const receptionTrendsChartData = reactive({
      xData: ["4", "8", "12", "16", "20", "24h"],
      yData: [{ data: [1, 2, 3, 4, 5, 6] }],
    });

    return (): JSX.Element => (
      <SubPanelTemplate>
        {" "}
        <div class="chart">
          {" "}
          <LineChart
            x-data={receptionTrendsChartData.xData}
            series={receptionTrendsChartData.yData}
            showLegend={false}
            gridTop="15"
            unit={{ x: "", y: "能耗" }}
          />
        </div>
      </SubPanelTemplate>
    );
  },
});

export default TrendEnterpriseSettlement;
