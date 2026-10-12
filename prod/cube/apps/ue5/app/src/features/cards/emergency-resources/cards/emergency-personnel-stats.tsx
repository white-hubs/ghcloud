import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { emergencyUserStats } from "@/infrastructure/api/emergency";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import pieList from "@/shared-ui/panel/pieList";

import styles from "./emergency-personnel-stats.module.less";

export const EmergencyPersonnelStats = defineComponent({
  name: "EmergencyPersonnelStats",
  setup(_props, ctx) {
    const roundPieData1 = ref([]);
    const devicesNum = ref(0);
    const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];

    const getAlarmLevel = async () => {
      const res = await emergencyUserStats();
      roundPieData1.value = res.map((item, index) => {
        return {
          value: item.value,
          label: item.name,
          color: colorList[index],
        };
      });
    };

    onMounted(() => {
      getAlarmLevel();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="应急人员统计">
          <div class="equipmentAlarm">
            <RoundPie data={roundPieData1.value} eventNum={devicesNum.value}></RoundPie>
            <pieList roundPieData={roundPieData1.value}></pieList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default EmergencyPersonnelStats;
