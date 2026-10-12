<template>
  <SubPanelTemplate title="耗材出库趋势" class="visiting-data">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <div class="echart">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
        :unit="{ x: '', y: '' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { ModelValueItf } from '../public/types'
import { getConsumableVisualizationReduceRecord } from '@/api/property'

const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
const xData = ref<string[]>([])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
  {
    name: '进入',
    data: [],
    smooth: true,
    symbolSize: 8,
    showSymbol: false,
    lineColor: '#2989FF',
    linearGradientColor: ['#2AE8BD', '#2989FF']
  }
])
const getTemplateData = async () => {
  const res = await getConsumableVisualizationReduceRecord({period: trendTime.value.dateRange.join(",")})
  xData.value = res.map(e=>e.name)
  yData.value[0].data = res.map(e=>e.value)
}
</script>
<style lang="less" scoped>
.echart{
  height: 220px;
}
</style>