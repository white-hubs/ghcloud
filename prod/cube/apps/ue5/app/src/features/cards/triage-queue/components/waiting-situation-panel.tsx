import { defineComponent } from "vue";
import { onMounted, reactive } from "vue";

import overviewChartBar from "../../hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { waitingSituation } from "@/infrastructure/api/consultation-data";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./waiting-situation-panel.module.less";

export const WaitingSituationPanel = defineComponent({
  name: "WaitingSituationPanel",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    /**
     * 候诊情况
     */
    const barData = reactive({
      xData: [],
      yData: [
        {
          data: [],
          name: "",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });
    //候诊情况
    const getWaitingSituation = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      const res = await waitingSituation(params);

      res.forEach((item) => {
        barData.xData.push(item.timeFlag);
        item.visitNum ? barData.yData[0].data.push(item.visitNum) : barData.yData[0].data.push(0);
      });
    };
    onMounted(() => {
      getWaitingSituation();
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

export default WaitingSituationPanel;
