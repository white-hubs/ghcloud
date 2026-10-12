<template>
  <SubPanelTemplate :title="title" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="timeFrame" @search="equipmentAlarmRateInfo"></DateInlineForm>
    </template>
    <div class="equipmentInfo">
      <waterPolo title="" :value="alarmRateData.proportion" unit="%" bgColor="#2989FF" color="#2989FF"> </waterPolo>
      <deviceModule :data-list="dataList"></deviceModule>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import waterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import deviceModule from "@/components/businessPanel/public/deviceModule.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { AlarmRateList, ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { equipmentAlarmRateData } from "@/utils/requestData/alarm";
interface Props {
  title: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "设备报警率",
});
const { globalState } = useStateStore();

let timeFrame = ref<ModelValueItf>();
let alarmRateData = reactive({
  proportion: 0,
  deviceTotal: "",
  alarmNum: "",
  chainRatio: "",
});
const dataList = reactive<AlarmRateList[]>([
  {
    title: "设备总数",
    value: 0,
    ringRatio: false,
  },
  {
    title: "报警设备总数",
    value: 0,
    ringRatio: true,
    label: 0,
    unit: "%",
  },
]);
// 设备报警率
const equipmentAlarmRateInfo = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
  };
  let res = await equipmentAlarmRateData(param);
  alarmRateData.proportion = Math.round(Number(res.proportion) * 10000) / 100.0;
  dataList[0].value = Number(res.deviceTotal);
  dataList[1].value = Number(res.alarmNum);
  dataList[1].label = Math.round(Number(res.chainRatio) * 10000) / 100.0;
};
</script>
<style lang="less" scoped>
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
  .deviceList {
    display: block;
  }
}
</style>
