import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { emergencyDevicePage, emergencyDeviceStat } from "@/infrastructure/api/emergency";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import pieList from "@/shared-ui/panel/pieList";

import styles from "./emergency-equipment-stats.module.less";

export const EmergencyEquipmentStats = defineComponent({
  name: "EmergencyEquipmentStats",
  setup(_props, ctx) {
    const roundPieData = ref([
      {
        value: 0,
        label: "已使用",
        color: "rgba(3, 182, 21, 1)",
      },
      {
        value: 0,
        label: "未使用",
        color: "rgba(245, 154, 35, 1)",
      },
    ]);
    const deviceTotal = ref(0);
    const column = reactive([
      {
        title: "设备名称",
        dataIndex: "name",
        width: 120,
      },
      {
        title: "已使用",
        dataIndex: "deviceUsedNum",
      },
      {
        title: "未使用",
        dataIndex: "notUsedValue",
      },
    ]);
    const listData = ref([]);

    const emergencyFacilityEvent = async () => {
      const res = await emergencyDeviceStat();
      const data = await emergencyDevicePage();
      roundPieData.value[0].value = res.usedValue;
      roundPieData.value[1].value = res.notUsedValue;
      deviceTotal.value = res.total;
      listData.value = data.records.map((item) => {
        return {
          ...item,
          notUsedValue: item.deviceNum - item.deviceUsedNum,
        };
      });
    };

    onMounted(() => {
      emergencyFacilityEvent();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="应急设备统计">
          <div class="equipmentAlarm">
            <PlanPie pieData={roundPieData.value}>
              <div class="content">
                <div class="total-num"> {deviceTotal.value}</div>
                <div> 设备总数</div>
              </div>
            </PlanPie>
            <pieList roundPieData={roundPieData.value}></pieList>
          </div>
          <div class="footer">
            {" "}
            <RollTable column={column} data={listData.value}></RollTable>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default EmergencyEquipmentStats;
