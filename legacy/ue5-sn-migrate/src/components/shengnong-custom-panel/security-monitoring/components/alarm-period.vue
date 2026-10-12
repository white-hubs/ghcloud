<template>
  <SubPanelTemplate title="报警高发时段" image="alarm.png" class="visiting-data">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTime" @search="changeTimeAlarm" menuPage="securityMonitoring" />
    </template>
    <div class="chart" v-if="alarmData.xData.length > 0">
      <LineChart :x-data="alarmData.xData" :legendFontSize="calcFontSize(16)" :series="alarmData.yData" :showLegend="true" gridTop="15"
        :showBackground="true" :axisPointer="true" :titles="['报警数']" :unit="{ x: '', y: '' }" />
    </div>
    <noData v-else />
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import { calcFontSize } from "@/utils/common";
import { storeMarket } from '@/piniaStore/other'
import { alarmHighFrequencyPeriodStat } from "@/api/shennong/alarm";
import { getXDataByType } from "@/utils/common";

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "SECURITY_MONITORING",
  }
);
const piniaStoreMarket = storeMarket();
const alarmTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});

const alarmData = reactive({
  xData: [1,2,3,4,5,6,7,8],
  yData: [
    {
      name: "报警数",
      data: [1,2,3,4,5,6,7],
      linearGradientColor: ["rgba(26, 87, 202, 0.6)", "rgba(26, 87, 202, 0)"],
      lineColor: "#4C7FE0",
    }
  ],
});

const changeTimeAlarm = async () =>{
  let param = {
    period: alarmTime.value.dateRange.join(","),
    type: alarmTime.value.timeType,
    marketTenant: '',
    applicationCode: props.applicationCode,
  };
  let result = await alarmHighFrequencyPeriodStat(param);
  let xData = result.map((item) => {
    return item.period;
  });
  alarmData.xData = getXDataByType("TODAY", xData);
  alarmData.yData[0].data = result.map((item) => {
    return item.totalNum;
  });
}
</script>
<style lang="less" scoped>
:deep(.chart){
  height: 270px;
  padding: 0;
}
</style>