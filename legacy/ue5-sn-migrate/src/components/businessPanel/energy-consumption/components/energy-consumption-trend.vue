<template>
  <SubPanelTemplate :title="title">
   <template #extra>
    <div style="display: flex;">
      <a-select ref="select" v-model:value="state" style="height: 28px;margin-right: 10px;width: 50px;" 
          @change="changeEnergyCarbonTime" :getPopupContainer="(triggerNode) => triggerNode.parentNode">
          <a-select-option :value="item.value" v-for="(item, i) in deviceStateList">{{
            item.label }}</a-select-option>
        </a-select>
       <DateInlineForm v-model:modelValue="timeFrame" @search="changeEnergyCarbonTime" />
       <div class="dataTitle">
          <div class="dataTitle-right" style="color: #5EA6FF;" @click="handleAll">更多</div>
        </div>
    </div>
    </template>
      <div class="chart">
        <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
          gridTop="14" :unit="{ x: '', y: 'tce' }" />
      </div>
    <EnergyUsingEnergyTrendModal :show-modal="show" @close="close"></EnergyUsingEnergyTrendModal>
  </SubPanelTemplate>
</template> 

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "../../public/dateInlineForm.vue";
import { ModelValueItf } from '../../public/types'
import { collectConfigList, dcStatTrend } from '@/api/energy'
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import EnergyUsingEnergyTrendModal from "./energy-using-energy-trend-modal.vue";

interface Props {
title: string;
}
const props = withDefaults(defineProps<Props>(), {
title: '能耗用能趋势图',
});
const deviceStateList = ref([])
const state = ref('electricity_meter')
let timeFrame = ref<ModelValueItf>();
  const receptionTrendsChartData = reactive({
  xData: ['4', '8', '12', '16', '20', '24h'],
  yData: [
    { data: [], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
  ],
})
const show = ref(false)
const changeEnergyCarbonTime =async () => {
  const params = {
    type:timeFrame.value.timeType,
    period:timeFrame.value.dateRange.join(","),
    instrumentType:state.value
  }
 const res = await dcStatTrend(params)
 receptionTrendsChartData.xData = res.map(item=>item.time)
 receptionTrendsChartData.yData[0].data = res.map(item=>item.value) 
}
// 能耗分类配置
const getCollectConfigList = async () => {
 const res = await collectConfigList()
 deviceStateList.value = res.map(e=>{
  return {
    label:e.categoryName,
    value:e.categoryCode
  }
 })
 state.value = deviceStateList.value[0].value
}
const handleAll = ()=>{
  show.value = true
}
const close = ()=>{
  show.value = false
}
onMounted(()=>{
  getCollectConfigList()
})
</script>
<style lang="less" scoped>
.radioBar {
  text-align: right;
  margin: 6px 0;
  text-align: left;
  :deep(.ant-radio-button-wrapper) {
    height: 28px;
    line-height: 28px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px 2px 2px 2px;
    font-size: 12px;
    color: #ABB8CB;
    margin-left: 6px;
  }

  :deep(.ant-radio-button-wrapper-checked) {
    color: #fff;
    background: rgba(41, 137, 255, 0.302);
  }
}
.chart {
  height: 200px;
  min-height: 150px;
  width: 100%;
}
:deep(.time-type){
  width: 50px !important;
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