<template>
  <SubPanelTemplate title="访客预约统计">
    <div class="chart">
      <overviewChartBar :bottom="'0%'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const barData = reactive({
  xData: [  '门禁报警','消防报警','安防报警','其他'],
  yData: [
    {
      data: [37,19,53,6],
      name: '',
      color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
    }
  ]
})
</script>
<style lang="less" scoped>
.chart {
  height: 250px;
}
</style>