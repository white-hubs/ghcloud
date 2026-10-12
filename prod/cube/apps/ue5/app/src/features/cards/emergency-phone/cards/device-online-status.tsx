import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import stackedBarChart from "@/features/cards/Information-release/stacked-bar-chart";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statusNum } from "@/infrastructure/api/securitymanagement";

import styles from "./device-online-status.module.less";

export const DeviceOnlineStatus = defineComponent({
  name: "DeviceOnlineStatus",
  setup(_props, ctx) {
    const barXData = ref<string[]>([]);
    const barYData = ref<{ name: string; data: number[]; color: string }[]>([
      {
        name: "正常",
        data: [1, 2, 3, 4],
        color: "#2AE8BD",
      },
      {
        name: "离线",
        data: [1, 2, 3, 4],
        color: "#2989FF",
      },
    ]);

    const getStatusNum = async () => {
      const res = await statusNum({ applicationCode: "EMERGENCY_CALL" });
      barXData.value = res.areaStatusNum.map((item) => {
        return item.areaName;
      });
      barYData.value[0].data = res.areaStatusNum.map((item) => {
        return item.onNum;
      });
      barYData.value[1].data = res.areaStatusNum.map((item) => {
        return item.offlineNum;
      });
    };

    onMounted(() => {
      getStatusNum();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="设备在线情况">
        {" "}
        <div class="charts">
          {" "}
          <stackedBarChart x-data={barXData.value} y-data={barYData.value}></stackedBarChart>
        </div>
      </SubPanelTemplate>
    );
  },
});

export default DeviceOnlineStatus;
