<template>
  <SubPanelTemplate title="电梯运行分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="operationsAnalysis.operationsAnalysisTime"
        @search="changeHandleOperationsAnalysis">
      </DateInlineForm>
    </template>
    <div class="chart">
      <overviewChartBar :title="'次'" :xData="barData.xData" :yData="barData.yData" :x-font-size="10.5">
      </overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { ModelValueItf } from '../../public/types'
import { operationsAnalysisData } from '@/api/securitymanagement'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "../../public/dateInlineForm.vue";
import overviewChartBar from "../../hospital/overview-chartBar.vue"

const operationsAnalysis = reactive<{ operationsAnalysisTime: ModelValueItf; operationsAnalysisXdata: string[]; operationsAnalysisYdata: any }>({
  operationsAnalysisTime: {
      timeType: 'TODAY',
      dateRange: ['']
  },
  operationsAnalysisXdata: ['4:00', '8:00', '12:00', '16:00', '20:00', '24:00'],
  operationsAnalysisYdata: [
      {
          data: [10, 20, 30, 40],
          name: '',
          color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
      }
  ],
});
const barData = reactive({
  xData: [],
  yData: [
      {
          data: [10, 20, 30, 40],
          name: '',
          color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
      }
  ]
})
const changeHandleOperationsAnalysis = async () => {
  const params = {
    type:operationsAnalysis.operationsAnalysisTime.timeType,
    period:operationsAnalysis.operationsAnalysisTime.dateRange.join(","),
  }
  const res =await operationsAnalysisData(params)
  barData.xData = res.xtitle
  barData.yData[0].data = res.xtitle.map(xItem=>{
                return res.operationsAnalysis.find(item=>item.timeFlag===xItem)?res.operationsAnalysis.find(item=>item.timeFlag===xItem).dataValue:0
            })};
</script>
<style lang="less" scoped>
.chart {
  height: 260px;
}
</style>