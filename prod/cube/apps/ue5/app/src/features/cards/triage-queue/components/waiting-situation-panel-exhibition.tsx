import { defineComponent } from "vue";
import { onMounted, onUnmounted, reactive } from "vue";

import overviewChartBar from "../../hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getXaxleData } from "@/infrastructure/utils/common";
import Bar3D from "@/shared-ui/panel/charts/bar/bar3D";

import styles from "./waiting-situation-panel-exhibition.module.less";

export const WaitingSituationPanelExhibition = defineComponent({
  name: "WaitingSituationPanelExhibition",
  setup(_props, ctx) {
    /**
     * 候诊情况
     */
    const waitingSituationChartData = reactive({
      xData: ["0-4", "4-8", "8-12", "12-16", "16-20", "20-24h"],
      yData: [{ data: [30, 60, 170, 180, 120, 75] }],
    });
    const barData = reactive({
      xData: [],
      yData: [
        {
          data: [10, 20, 30, 40],
          name: "",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });

    let timer = null;
    const fakeData = [
      [30, 60, 170, 180, 120, 75],
      [130, 160, 70, 180, 80, 175],
      [40, 90, 270, 180, 110, 75],
      [130, 85, 75, 180, 100, 175],
      [60, 10, 170, 180, 80, 75],
    ];
    let fakeIndex = 1;
    onMounted(() => {
      timer = setInterval(() => {
        waitingSituationChartData.yData[0].data = fakeData[fakeIndex];

        barData.xData = getXaxleData("");
        barData.yData[0].data = fakeData[fakeIndex];
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
      <SubPanelTemplate title="候诊情况">
        {" "}
        <div class="chart">
          {" "}
          <overviewChartBar title={"人次"} xData={barData.xData} yData={barData.yData} x-font-size={10.5}></overviewChartBar>
        </div>
      </SubPanelTemplate>
    );
  },
});

export default WaitingSituationPanelExhibition;
