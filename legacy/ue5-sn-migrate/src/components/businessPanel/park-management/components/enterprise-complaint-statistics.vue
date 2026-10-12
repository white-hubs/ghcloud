<template>
  <SubPanelTemplate :title="props.title">
    <template #extra>
      <div>
        <DateInlineForm :timeList="timeList" v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
      </div>
    </template>
    <LineChart class="chart" :x-data="xData.arr" :series="series" :showLegend="false"
      gridTop="20" :unit="{ x: '', y: '' }"  :titles="['PM2.5']"/>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import {complaintStatTrend} from '@/api/youxianqu-park';
const props = withDefaults(defineProps<{title?: string;}>(), {
  title: '企业投诉建议统计'
})
const timeList = [
  { label: "本周", value: "THIS_WEEK" },
	{ label: "本月", value: "THIS_MONTH" },
	{ label: "今年", value: "THIS_YEAR" }
]
const topTimeFrame = ref({
timeType:'THIS_YEAR',
dateRange:[]
});
const xData = reactive({
  arr: [],
});
const series = reactive([
  {
    data: [],
    name:'PM2.5',
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);

const changeTopTimeFrame = async()=>{
  const res = await complaintStatTrend({periodType:topTimeFrame.value.timeType})
  xData.arr = res.map(e=>e.trendX)
  series[0].data = res.map(e=>e.trendY)
}
</script>
<style lang="less" scoped>
.chart{
  height: 220px;
}
</style>