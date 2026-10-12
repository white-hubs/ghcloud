<template>
  <SubPanelTemplate title="部门资产分布情况" class="visiting-data">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <div class="chart">
      <overviewChartBar :title="''" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import { getPropertyByDepHistogram } from '@/api/property'

const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
const barData = reactive({
  xData: ['安防报警', '消防报警', '电气报警', '入侵报警'],
  yData: []
})
const getTemplateData = async () => {
  const res = await getPropertyByDepHistogram({period: trendTime.value.dateRange.join(",")})
  barData.xData = res.xdata
  barData.yData = res.series.map(e=>{
    return {
      data: e.value,
      color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
    }
  })
}
</script>
<style lang="less" scoped>
.chart{
  height: 220px;
}
</style>