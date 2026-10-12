<template>
  <SubPanelTemplate>
    <template #extra>
      <DateInlineForm v-model:modelValue="trendPeriod" @search="getListData"></DateInlineForm>
    </template>
    <div class="reserve-period-chart">
      <LineChart :xData="state.xData" :series="[
            {
              data: state.yData,
              linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
            },
          ]" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang='ts'>
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import LineChart from "../public/lineChart.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import { reactive, onMounted,ref } from 'vue';
import { ModelValueItf } from '../public/types'
import { cubeVisitorManagementService } from '@/api/service'
const trendPeriod = ref<ModelValueItf>();
/**
* 数据部分
*/
const state = reactive<{
  xData: any[],
  yData:any[],
}>({
  xData: [],
  yData: [],
})
const getListData=async ()=>{
  const params={
    period:trendPeriod.value.dateRange.join(',')
  }
  const result=await cubeVisitorManagementService.getVisitorPassTrend(params)
  state.xData=result.map(item=>`${item.hourStr}:00`)
  state.yData=result.map(item=>item.count)
}
onMounted(() => {
  // getListData()
})
</script>
<style scoped lang='less'>
.reserve-period-chart {
  height: 200px;
}
</style>