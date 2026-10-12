<template>
  <SubPanelTemplate :title="title">
    <template #extra>
      <div class="flex-align">
        <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel" />
        <div class="dataTitle">
          <div class="dataTitle-right" style="color: #5EA6FF;" @click="handleAll">更多</div>
        </div>
      </div>
    </template>
    <div class="echarts">
      <LineChart :x-data="deviceFailureTrendCharData.xData" :series="deviceFailureTrendCharData.yData"
        :showLegend="false" gridTop="15" :unit="{ x: '', y: 'tce' }" />
    </div>
    <EnergyTrendModal :show-modal="show" @close="close"></EnergyTrendModal>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "../../public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { ModelValueItf } from '../../public/types'
import { dcStatTrend } from '@/api/energy'
import EnergyTrendModal from "./energy-trend-modal.vue";

interface Props {
title: string;
}
const props = withDefaults(defineProps<Props>(), {
title: '综合能耗趋势图',
});
const show = ref(false)
let timeFrame = ref<ModelValueItf>({timeType: 'THIS_MONTH'});
const deviceFailureTrendCharData = reactive({
  xData: [1,2,3,4,5,6,7,8,9],
  yData: [
    { data:  [10,10,10,10,10,0,0, 50, 20, 200, 150, 40, 10, 50],
      linearGradientColor: ['rgba(86, 142, 255, 1)', 'rgba(86, 142, 255, 0.1)'], lineColor: 'rgba(86, 142, 255, 1)' },
  ]
})
const getAlarmLevel = async()=> {
 const res = await dcStatTrend({type:timeFrame.value.timeType,period:timeFrame.value.dateRange.join(",")})
 deviceFailureTrendCharData.xData = res.map((res: { time: { toString: () => any } }) => res.time.toString())
 deviceFailureTrendCharData.yData[0].data = res.map((res: { zhValue: { toString: () => any } }) => res.zhValue.toString())
}
const handleAll = ()=>{
  show.value = true
}
const close = ()=>{
  show.value = false
}
</script>
<style lang="less" scoped>
.echarts {
  height: 200px;
}
.flex-align{
  display: flex;
}
.dataTitle {
  color: #ABB8CB;
  font-size: 18px;
  text-align: right;

  .dataTitle-right {
    cursor: pointer;
    font-size: 16px;
  }
}
</style>