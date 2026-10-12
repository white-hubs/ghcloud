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
    <div class="chart">
      <lineAndPillarCharts :unit="{ x: '', y: 'kgCO2e' }" :legend="['碳排']" :xData="xData" :yData="yData">
      </lineAndPillarCharts>
    </div>
    <EnergyEmissionsTrendModal :show-modal="show" @close="close"></EnergyEmissionsTrendModal>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "../../public/dateInlineForm.vue";
import lineAndPillarCharts from "../../public/charts/lineAndPillar/lineAndPillar-charts.vue";
import { ModelValueItf } from '../../public/types'
import { dcStatTrend, energyDailySummaryTrend } from '@/api/energy'
import EnergyEmissionsTrendModal from "./energy-emissions-trend-modal.vue";

interface Props {
title: string;
}
const props = withDefaults(defineProps<Props>(), {
title: '碳排量趋势图',
});
let timeFrame = ref<ModelValueItf>();
const xData = ref([1,2,3,4,5,6])
const yData = ref([1,2,3,4,5,6])
const show = ref(false)
const getAlarmLevel = async()=> {
 const res = await energyDailySummaryTrend({type:timeFrame.value.timeType,period:timeFrame.value.dateRange.join(",")})
 xData.value = res.map((res: { time: { toString: () => any } }) => res.time.toString())
 yData.value = res.map((res: { dcValue: { toString: () => any } }) => res.dcValue.toString())
}
const handleAll = ()=>{
  show.value = true
}
const close = ()=>{
  show.value = false
}
</script>
<style lang="less" scoped>
.chart {
  height: 250px;
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
  }
}
</style>