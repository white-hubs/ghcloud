<template>
  <SubPanelTemplate title="巡逻时间分布">
    <template #extra>
      <DateInlineForm v-model:modelValue="trend" @search="getAlarmTrend"></DateInlineForm>
    </template>
    <LineChart class="chart" :x-data="xData" :series="series"></LineChart>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { cameraPatrolStatisticsTimeDistribution } from '@/api/vmonitor'

const trend = ref()
const xData = ref([])
const series = reactive([
  {
    data: [],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
const getAlarmTrend = async ()=>{
  let res = await cameraPatrolStatisticsTimeDistribution({period:trend.value.dateRange.join(",")})
  res = res.filter((_, index) => index % 2 === 0);
  xData.value = res.map(e=>e.period)
  series[0].data = res.map(e=>e.totalNum)
}
</script>
<style lang="less" scoped>
.chart {
  height: 260px;
}
</style>