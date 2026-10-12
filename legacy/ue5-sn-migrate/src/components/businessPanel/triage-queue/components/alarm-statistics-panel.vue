<template>
  <SubPanelTemplate title="告警统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmStatisticsTime" @search="changeAlarmStatisticsTime">
      </DateInlineForm>
    </template>
    <AlarmStatistics :statisticsData="alarmStatisticsData.data" />
    <div class="stacked-bar-chart">
      <StackedBar :xData="alarmStatisticsData.chartData.xData" :yData="alarmStatisticsData.chartData.yData" />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import AlarmStatistics from './alarm-statistics.vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import StackedBar from '../../public/charts/stacked-bar/stacked-bar.vue';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ModelValueItf } from '../../public/types';

/**
 * 告警统计
 */
const alarmStatisticsTime = ref<ModelValueItf>();
const changeAlarmStatisticsTime = (): void => {
  // TODO (张正) 接口调用
  const {timeType} = alarmStatisticsTime.value
  if(timeType==='TODAY'){
    alarmStatisticsData.chartData.yData[0].value=[10, 10, 8, 6, 16, 10, 12]
    alarmStatisticsData.chartData.yData[1].value=[30, 20, 4, 16, 36, 20, 42]
    alarmStatisticsData.chartData.yData[2].value=[20, 40, 18, 26, 46, 30, 22]
    alarmStatisticsData.data[0].value=334
    alarmStatisticsData.data[1].value=34
    alarmStatisticsData.data[2].value=34
    alarmStatisticsData.data[0].rate=6.88
    alarmStatisticsData.data[1].rate=6.88
    alarmStatisticsData.data[2].rate=-6.88
  }else if(timeType==='THIS_WEEK'){
    alarmStatisticsData.chartData.yData[0].value=[20, 20, 16, 12, 32, 20, 22]
    alarmStatisticsData.chartData.yData[1].value=[60, 40, 8, 32, 72, 40, 82]
    alarmStatisticsData.chartData.yData[2].value=[40, 80, 36, 52, 92, 60, 72]
    alarmStatisticsData.data[0].value=339
    alarmStatisticsData.data[1].value=57
    alarmStatisticsData.data[2].value=40
    alarmStatisticsData.data[0].rate=2.80
    alarmStatisticsData.data[1].rate=1.31
    alarmStatisticsData.data[2].rate=3.82
  }else if(timeType==='THIS_MONTH'){
    alarmStatisticsData.chartData.yData[0].value=[40, 22, 26, 20, 37, 22, 24]
    alarmStatisticsData.chartData.yData[1].value=[70, 45, 18, 60, 76, 44, 82]
    alarmStatisticsData.chartData.yData[2].value=[80, 100, 46, 52, 94, 65, 82]
    alarmStatisticsData.data[0].value=368
    alarmStatisticsData.data[1].value=74
    alarmStatisticsData.data[2].value=42
    alarmStatisticsData.data[0].rate=7.41
    alarmStatisticsData.data[1].rate=-2.29
    alarmStatisticsData.data[2].rate=-1.01
  }else if(timeType==='THIS_YEAR'){
    alarmStatisticsData.chartData.yData[0].value=[40, 23, 26, 20, 37, 22, 40]
    alarmStatisticsData.chartData.yData[1].value=[70, 46, 18, 70, 76, 54, 82]
    alarmStatisticsData.chartData.yData[2].value=[80, 110, 46, 52, 94, 75, 82]
    alarmStatisticsData.data[0].value=494
    alarmStatisticsData.data[1].value=94
    alarmStatisticsData.data[2].value=59
    alarmStatisticsData.data[0].rate=1.41
    alarmStatisticsData.data[1].rate=-1.29
    alarmStatisticsData.data[2].rate=3.01
  }
}
const alarmStatisticsData = reactive({
  data: [
    { eventName: '一级事件', value: 334, rate: 6.88, color: "#F14545" },
    { eventName: '二级事件', value: 33, rate: 6.88, color: "#FFC700" },
    { eventName: '三级事件', value: 33, rate: -6.88, color: "#2989FF" },
  ],
  chartData: {
    xData: ['1', '2', '3', '4', '5', '6', '7天'],
    yData: [
      { name: '一级事件', value: [10, 10, 8, 6, 16, 10, 12], color: "#F14545" },
      { name: '二级事件', value: [10, 10, 8, 6, 16, 10, 12], color: "#FFC700" },
      { name: '三级事件', value: [10, 10, 8, 6, 16, 10, 12], color: "#2989FF" }
    ]
  }
})

let timer = null
let fakeData = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let fakeIndex = 1
onMounted(() => {
  timer = setInterval(() => {
    alarmStatisticsTime.value.timeType = fakeData[fakeIndex]
    changeAlarmStatisticsTime()
    fakeIndex++;
    if (fakeIndex > fakeData.length - 1) {
      fakeIndex = 0
    }
  }, 1000*20)
})
onUnmounted(() => {
  clearInterval(timer)
})

</script>
<style scoped lang="less">
.stacked-bar-chart {
  width: 100%;
  height: 230px;
}
</style>