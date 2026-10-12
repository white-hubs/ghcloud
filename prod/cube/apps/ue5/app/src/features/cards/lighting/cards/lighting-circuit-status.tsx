import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import stackedBarChart from "@/features/cards/Information-release/stacked-bar-chart";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { groupControlStat } from "@/infrastructure/api/device";

import styles from "./lighting-circuit-status.module.less";

export const LightingCircuitStatus = defineComponent({
  name: "LightingCircuitStatus",
  setup(_props, ctx) {
    const xData = ref<string[]>([]);
    const yData = ref<{ name: string; data: number[]; color: string }[]>([
      {
        name: "正常",
        data: [],
        color: "#2AE8BD",
      },
      {
        name: "关闭",
        data: [],
        color: "#2989FF",
      },
    ]);

    const getLightingCircuit = async () => {
      const res = await groupControlStat();
      yData.value[0].data.length = 0;
      yData.value[1].data.length = 0;
      xData.value = res.map((item) => {
        return item.groupName;
      });
      res.forEach((item) => {
        item.detailStat.forEach((data) => {
          if (data.label === "开") {
            yData.value[0].data.push(data.num);
          } else {
            yData.value[1].data.push(data.num);
          }
        });
      });
    };

    onMounted(() => {
      getLightingCircuit();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="照明回路实况" class="device-statistics">
        {" "}
        <div class="chart">
          {" "}
          <stackedBarChart x-data={xData.value} y-data={yData.value}></stackedBarChart>
        </div>
      </SubPanelTemplate>
    );
  },
});

export default LightingCircuitStatus;
