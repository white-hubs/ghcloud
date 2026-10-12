<template>
  <SubPanelTemplate title="报警高发时段" image="bj.png" class="left-bottom-panel">
    <template #extra>
      <DateInlineForm v-model:modelValue="safetyWorkTime" menuPage="comprehensive" @search="changeReceptionRecordTime" />
    </template>
    <div class="chart" v-if="gasChartData.xData.length > 0">
      <LineChart 
          :legendFontSize="calcFontSize(16)" 
          :x-data="gasChartData.xData" 
          :series="gasChartData.yData" 
          :showLegend="true" 
          gridTop="15"
          :showBackground="true" 
          :axisPointer="true" 
          :titles="['报警数']" 
          :unit="{ x: '', y: '' }" 
        />
    </div>
    <noData v-else />
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from 'vue'
import noData from "@/components/businessPanel/public/noData.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import { ModelValueItf } from "../../../businessPanel/public/types";
import { storeMarket } from "@/piniaStore/other";
import { calcFontSize } from "@/utils/common";
import { alarmHighFrequencyPeriodStat } from '@/api/shennong/alarm';
import {  getXDataByType } from "@/utils/common";

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "",
  }
);
const piniaStoreMarket = storeMarket();
const safetyWorkTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const alarmDetailParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  alarmTypeCode: props.applicationCode,
});
const gasChartData = reactive({
  xData: [],
  yData: [
    {
      name: "报警数",
      data: [],
      lineColor: '#1A57CA',
      linearGradientColor: ['rgba(26,87,202,0.6)', 'rgba(26,87,202,0.0)'],
    },
  ],
});
const changeReceptionRecordTime = async () => {
  alarmDetailParameter.value.dateRange = safetyWorkTime.value.dateRange;
  let param = {
    period: safetyWorkTime.value.dateRange.join(","),
    type: safetyWorkTime.value.timeType,
    marketTenant: '',
    applicationCode: '',
  };
  let alarmTrends = await alarmHighFrequencyPeriodStat(param);
  let xData = alarmTrends.map((item) => {
    return item.period;
  });

  gasChartData.xData = getXDataByType('TODAY', xData);
  gasChartData.yData[0].data = alarmTrends.map((item) => {
    return item.totalNum;
  });
};
</script>
<style lang="less" scoped>
.left-bottom-panel {
  // margin-top: 10px;
  min-height: 360px;
}
.chart {
  flex: 1;
  height: 400px !important;
}
</style>