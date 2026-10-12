import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { emergencySuppliesStock } from "@/infrastructure/api/emergency";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import pieList from "@/shared-ui/panel/pieList";

import styles from "./emergency-supplies-stock.module.less";

export const EmergencySuppliesStock = defineComponent({
  name: "EmergencySuppliesStock",
  setup(_props, ctx) {
    const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const roundPieData = ref([
      {
        value: 10,
        label: "生活物资",
        color: "#328BF7",
      },
      {
        value: 10,
        label: "医疗物资",
        color: "#19F8F7",
      },
      {
        value: 10,
        label: "救援物资",
        color: "#FFC700",
      },
      {
        value: 10,
        label: "能耗物资",
        color: "#EF424A",
      },
    ]);
    const roundPieData1 = ref([]);
    const devicesNum = ref(0);

    const getMaterialStatistics = async () => {
      const res = await emergencySuppliesStock();
      roundPieData.value = res.map((item, index) => {
        return {
          value: item.percentage,
          label: item.name,
          color: colorList[index],
        };
      });
      roundPieData1.value = res.map((item, index) => {
        return {
          value: item.percentage + "%",
          label: item.name,
          color: colorList[index],
        };
      });
    };

    onMounted(() => {
      getMaterialStatistics();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="应急物资在库统计">
          <div class="equipmentAlarm">
            <RoundPie data={roundPieData.value} eventNum={devicesNum.value}></RoundPie>
            <pieList roundPieData={roundPieData1.value}></pieList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default EmergencySuppliesStock;
