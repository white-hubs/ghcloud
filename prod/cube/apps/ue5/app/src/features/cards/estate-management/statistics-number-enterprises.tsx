import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import overviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

import styles from "./statistics-number-enterprises.module.less";

export const StatisticsNumberEnterprises = defineComponent({
  name: "StatisticsNumberEnterprises",
  setup(_props, ctx) {
    const barData = reactive({
      xData: ["安防报警", "消防报警", "电气报警", "入侵报警"],
      yData: [
        {
          data: [10, 20, 30, 40],
          name: "已处理",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
        {
          data: [18, 25, 48, 52],
          name: "处理中",
          color: ["rgba(42, 232, 189, 0.80)", "rgba(42, 232, 189, 0)"],
        },
      ],
    });

    return (): JSX.Element => (
      <SubPanelTemplate>
        {" "}
        <div class="stacked-bar-chart">
          {" "}
          <overviewChartBar xData={barData.xData} yData={barData.yData}></overviewChartBar>
        </div>
      </SubPanelTemplate>
    );
  },
});

export default StatisticsNumberEnterprises;
