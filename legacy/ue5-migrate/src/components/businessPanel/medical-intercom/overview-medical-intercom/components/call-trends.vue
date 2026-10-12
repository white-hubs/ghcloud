<template>
  <SubPanelTemplate title="呼叫趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="receptionTrendsTime" @search="getCallTrends"></DateInlineForm>
    </template>
    <div class="charts">
      <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
        gridTop="15" :unit="{ x: '', y: '次' }" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { ModelValueItf } from '@/components/businessPanel/public/types'
import { storeMenu } from "@/piniaStore/menu";
import {callTrends} from '@/api/medical-intercom'
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore()
const receptionTrendsTime = ref<ModelValueItf>();
  const receptionTrendsChartData = reactive({
  xData: ['4', '8', '12', '16', '20', '24h'],
  yData: [
    { data: [], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
  ]
})
//呼叫趋势数据
const getCallTrends= async () => {
  let params = {
      sceneType: globalState.business.currentMenu,
      areaId: globalState.business.currentAreaId,
      period: receptionTrendsTime.value.dateRange.join(","),
      type: receptionTrendsTime.value.timeType,
    };
  const res= await callTrends(params)
  receptionTrendsChartData.xData=res.xtitle
  receptionTrendsChartData.yData[0].data=res.xtitle.map(xItem=>{
                return res.callTrends.find(item=>item.timeFlag===xItem)?res.callTrends.find(item=>item.timeFlag===xItem).num
:0
            });
}
</script>
<style lang="less" scoped>
.charts{
  height: 220px;
}
</style>