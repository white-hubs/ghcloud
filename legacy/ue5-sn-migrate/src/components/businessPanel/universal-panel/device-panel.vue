<template>
  <div class="panel">
    <component v-for="item in universalData" :is="item.value" :title="item.label"></component>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DeviceOfflineRate from "./components/DeviceOfflineRate.vue";
import EquipmentStatusOverview from "./components/EquipmentStatusOverview.vue";
import alarmLevel from "./components/alarm-level.vue";
import alarmStatus from "./components/alarm-processing-status.vue";
import equipmentDetails from "./components/equipment-alarm-details.vue";
import equipmentRate from "./components/equipment-alarm-rate.vue";
import equipmentTrend from "./components/equipment-alarm-trend.vue";
import equipmentStatistics from "./components/equipment-anomaly-statistics.vue";
import deviceOfflineDetails from "./components/device-offline-details.vue";

interface Props {
  universalPanelVo:{
	tableOneName: string;
	tableOne: string;
	tableTwoName: string;
	tableTwo: string;
	tableThreeName: string;
	tableThree: string;
  }
}
const props = withDefaults(defineProps<Props>(), {});
const componentObj = {
  DeviceOfflineRate,
  EquipmentStatusOverview,
  alarmLevel,
  alarmStatus,    
  equipmentDetails,
  equipmentRate,
  equipmentTrend,
  equipmentStatistics,
  deviceOfflineDetails
}
const universalData = ref([])
onMounted(()=>{
  if (props.universalPanelVo) {
    universalData.value = [
    {
      label: props.universalPanelVo.tableOneName,
      value: componentObj[props.universalPanelVo.tableOne]
    },
    {
      label: props.universalPanelVo.tableTwoName,
      value: componentObj[props.universalPanelVo.tableTwo]
    },
    {
      label: props.universalPanelVo.tableThreeName,
      value: componentObj[props.universalPanelVo.tableThree]
    },
  ]
  }
})
</script>
<style lang="less" scoped>
</style>