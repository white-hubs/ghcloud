<template>
  <SubPanelTemplate title="照明回路实况" class="device-statistics">
    <GridContainer style="margin-top: 12px; margin-bottom: 20px;" :data="guidList"></GridContainer>
    <div :style="{ height: px2rem(chartHeight + 'px') }">
        <stackedBarChart :x-data="xData" :y-data="yData"></stackedBarChart>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import stackedBarChart from '@/components/businessPanel/Information-release/stacked-bar-chart.vue'
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getLoopData } from "@/mock/light"
import { px2rem } from '@/utils/common';

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
  chartHeight?: number;
}>(), {
  fromPage: 'PARK',
  chartHeight: 220
})

const guidList = ref<{alarmStatus?:string; alarmStatusName:string; alarmNum:number; color:string;}[]>([]);
const xData = ref<string[]>([])
const yData = ref<{name:string; data: number[]; color:string;}[]>([])
const colorList = ['rgb(255, 199, 0)', 'rgb(0, 242, 123)', 'rgb(41, 194, 255)']
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; open?: number; close?:number; }[]>([]);

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getLoopData({formPage: props.fromPage, timeType: timeType as TimeType})
  xData.value = chartData.value.map((item)=> item.label)
  chartData.value.forEach((item, index) => {
    const openList = chartData.value.map((item)=> item.open)
    const closeList = chartData.value.map((item)=> item.close)
    yData.value = [
      {
        name: '正常',
        data: openList,
        color: '#2AE8BD'
      },
      {
        name: '关闭',
        data: closeList,
        color: '#2989FF'
      }
    ]
  })
  guidList.value = []
  guidList.value = chartData.value.map((item, index)=> {
    return {
        alarmStatusName: item.label, 
        alarmNum: item.open + item.close, 
        color: colorList[index] ?? colorList[0]
    }
  })
  const total = chartData.value.reduce(function (total, value) {
    return total + value.open + value.close;
  }, 0);
  guidList.value.push({
      alarmStatusName: '总回路数', 
      alarmNum: total, 
      color: colorList[2]
  })
}

// 模拟动态数据
let timer = null
let timeList = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let index = 1
const changeTime = () => {
  timer = setInterval(() => {
    trendTime.value.timeType = timeList[index]
    getTemplateData()
    index++;
    if (index > timeList.length - 1) {
      index = 0
      // return
    }
  }, window.config.pageLoopRequestTime)
}

onMounted(() => {
  getTemplateData()
  changeTime()
})

onUnmounted(() => {
  clearInterval(timer)
})

</script>
<style scoped lang="less">

:deep(.situation-analysis .right .total) {
  height: 40px;
  background-repeat: no-repeat;
  background-size: cover;
  padding: 0 10px;
}
.chart {
  flex: 1;
  height: 200px;
  margin-top: 20px;
}
:deep(.monitor){
  padding: 0;
}
:deep(.monitorColor ~ div){
  white-space: nowrap;
}

:deep(.ant-statistic){
  display: flex;
  align-items: center;
  justify-content: space-around;
}
:deep(.ant-statistic-title){
  white-space: nowrap;
  margin-bottom: 0;
}
:deep(.ant-statistic-content){
  font-size: 14px !important;
  padding-left: 0 !important;
}
</style>