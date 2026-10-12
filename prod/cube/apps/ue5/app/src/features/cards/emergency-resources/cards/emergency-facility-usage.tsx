import { defineComponent } from "vue";
import { reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { emergencyFacilityStat } from "@/infrastructure/api/emergency";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import deviceModule from "@/shared-ui/panel/deviceModule";
import { AlarmRateList } from "@/shared-ui/panel/types";

import styles from "./emergency-facility-usage.module.less";

export const EmergencyFacilityUsage = defineComponent({
  name: "EmergencyFacilityUsage",
  setup(_props, ctx) {
    const alarmRateData = reactive({
      proportion: 0,
      deviceTotal: "",
      alarmNum: "",
      chainRatio: "",
    });
    const dataList = reactive<AlarmRateList[]>([
      {
        title: "总数",
        value: 0,
        ringRatio: false,
      },
      {
        title: "已使用",
        value: 0,
        ringRatio: false,
        label: 0,
      },
    ]);

    const emergencyFacilities = async () => {
      const res = await emergencyFacilityStat();
      dataList[0].value = res.total;
      dataList[1].value = res.usedValue;
      alarmRateData.proportion = res.total ? (res.usedValue / res.total) * 100 : 0;
    };

    onMounted(() => {
      emergencyFacilities();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="应急设施使用率" class="alarm-event">
          <div class="equipmentInfo">
            <waterPolo title value={alarmRateData.proportion} unit="%" bgColor="#2989FF" color="#2989FF"></waterPolo>
            <deviceModule data-list={dataList}></deviceModule>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default EmergencyFacilityUsage;
