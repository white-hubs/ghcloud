<!--企业入驻趋势 -->
<template>
  <SubPanelTemplate>
    <div class="chart">
      <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
        gridTop="15" :unit="{ x: '', y: '能耗' }" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";

const receptionTrendsChartData = reactive({
    xData: ['4', '8', '12', '16', '20', '24h'],
    yData: [
        { data: [1,2,3,4,5,6]},
    ]
})
</script>
<style lang="less" scoped>
.chart{
  height: 240px;
}
</style>