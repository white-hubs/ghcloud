import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import alarmLevel from "./components/alarm-level";
import alarmStatus from "./components/alarm-processing-status";
import deviceOfflineDetails from "./components/device-offline-details";
import DeviceOfflineRate from "./components/DeviceOfflineRate";
import equipmentDetails from "./components/equipment-alarm-details";
import equipmentRate from "./components/equipment-alarm-rate";
import equipmentTrend from "./components/equipment-alarm-trend";
import equipmentStatistics from "./components/equipment-anomaly-statistics";
import EquipmentStatusOverview from "./components/EquipmentStatusOverview";

export const DevicePanel = defineComponent({
  name: "DevicePanel",
  props: {
    universalPanelVo: { type: Object, required: true },
  },
  setup(props, ctx) {
    interface Props {
      universalPanelVo: {
        tableOneName: string;
        tableOne: string;
        tableTwoName: string;
        tableTwo: string;
        tableThreeName: string;
        tableThree: string;
      };
    }
    const componentObj = {
      DeviceOfflineRate,
      EquipmentStatusOverview,
      alarmLevel,
      alarmStatus,
      equipmentDetails,
      equipmentRate,
      equipmentTrend,
      equipmentStatistics,
      deviceOfflineDetails,
    };
    const universalData = ref([]);
    onMounted(() => {
      if (props.universalPanelVo) {
        universalData.value = [
          {
            label: props.universalPanelVo.tableOneName,
            value: componentObj[props.universalPanelVo.tableOne],
          },
          {
            label: props.universalPanelVo.tableTwoName,
            value: componentObj[props.universalPanelVo.tableTwo],
          },
          {
            label: props.universalPanelVo.tableThreeName,
            value: componentObj[props.universalPanelVo.tableThree],
          },
        ];
      }
    });

    return (): JSX.Element => (
      <div>
        {universalData.map((item) => (
          <component is={item.value} title={item.label}></component>
        ))}
      </div>
    );
  },
});

export default DevicePanel;
