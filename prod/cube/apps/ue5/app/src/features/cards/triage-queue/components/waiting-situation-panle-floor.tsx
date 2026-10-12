import { defineComponent } from "vue";
import { onMounted, onUnmounted, reactive } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import HorizontalBar from "@/shared-ui/panel/charts/horizontal-bar/horizontal-bar";

import styles from "./waiting-situation-panle-floor.module.less";

export const WaitingSituationPanleFloor = defineComponent({
  name: "WaitingSituationPanleFloor",
  setup(_props, ctx) {
    /**
     * 候诊情况
     */
    const waitingSituationChartData = reactive({
      xData: [{ name: "", value: [820, 832, 901, 934, 1290, 1330, 1320, 934, 1290] }],
      yData: ["心脏内科", "耳鼻喉科", "烧伤科", "心脏外科", "呼吸道科", "肠胃科", "心血管科", "泌尿外科", "神经内科"],
    });

    let timer = null;
    const fakeData = [
      [820, 832, 901, 934, 1290, 1330, 1320, 934, 1290],
      [620, 732, 951, 634, 1390, 1430, 820, 734, 590],
      [620, 842, 941, 734, 1210, 1320, 720, 834, 690],
      [420, 632, 921, 534, 1390, 1310, 1220, 534, 1290],
      [520, 532, 941, 234, 1210, 930, 920, 934, 990],
    ];
    let fakeIndex = 1;
    onMounted(() => {
      timer = setInterval(() => {
        waitingSituationChartData.xData[0].value = fakeData[fakeIndex];
        fakeIndex++;
        if (fakeIndex > fakeData.length - 1) {
          fakeIndex = 0;
        }
      }, 6000);
    });

    onUnmounted(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="候诊情况" class="waiting-situation">
        {" "}
        <HorizontalBar x-data={waitingSituationChartData.xData} y-data={waitingSituationChartData.yData} />
      </SubPanelTemplate>
    );
  },
});

export default WaitingSituationPanleFloor;
