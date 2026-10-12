<!--企业数量统计 -->
<template>
  <SubPanelTemplate>
    <div class="stacked-bar-chart">
      <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"

const barData = reactive({
  xData: ['安防报警', '消防报警', '电气报警', '入侵报警'],
  yData: [
    {
      data: [10, 20, 30, 40],
      name: '已处理',
      color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
    },
    {
      data: [18, 25, 48, 52],
      name: '处理中',
      color: ['rgba(42, 232, 189, 0.80)', 'rgba(42, 232, 189, 0)']
    },
  ]
})
</script>
<style lang="less" scoped>
.stacked-bar-chart{
  height: 240px;
}
</style>