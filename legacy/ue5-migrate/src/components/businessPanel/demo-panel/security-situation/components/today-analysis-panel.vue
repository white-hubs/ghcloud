
<template>
  <SubPanelTemplate title="今日巡更情况" class="visiting-data">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <GridContainer style="margin-top: 10px" :data="alarmStatusData"></GridContainer>
    <div style="width: 100%;" :style="{ height: px2rem(chartHeight + 'px') }">
        <barChart :title="''" :x-data="xData"
            :data="[{ color: '#1890FF', name: '', data: yData }]" class="columnBox" />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import { onMounted, onUnmounted, ref } from 'vue';
import { ModelValueItf } from '@/components/businessPanel/public/types';
import { getTodayAnalysis } from "@/mock/security-situation"
import { px2rem } from '@/utils/common'

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
  chartHeight?: number;
}>(), {
  fromPage: 'PARK',
  chartHeight: 200
})

let alarmStatusData = ref([
  {alarmStatus: "ALARM_PROGRESS_CONFIRMED", alarmStatusName: "巡更计划", alarmNum: 0, color: 'rgb(255, 199, 0)'},
  {alarmStatus: "ALARM_PROGRESS_CONFIRMED", alarmStatusName: "巡更任务", alarmNum: 0, color: 'rgb(0, 242, 123)'},
  {alarmStatus: "ALARM_PROGRESS_CONFIRMED", alarmStatusName: "完成率", alarmNum: '', color: 'rgb(41, 194, 255)'}
]);

const xData = ref<string[]>([])
const yData = ref<number[]>([])
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; value: number; }[]>([]);

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getTodayAnalysis({formPage: props.fromPage, timeType: timeType as TimeType})
  xData.value = chartData.value.map((item)=> item.label)
  chartData.value.forEach((item, index) => {
    yData.value = chartData.value.map((item)=> item.value)
  })
  const total = chartData.value.reduce(function (total, value) {
    return total + value.value;
  }, 0);
  const mask = total - chartData.value[1].value
  alarmStatusData.value[0].alarmNum = total
  alarmStatusData.value[1].alarmNum = total - chartData.value[1].value
  alarmStatusData.value[2].alarmNum = (mask / total * 100).toFixed(0) + '%' 
 
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
:deep(.grid-container){
  display: flex;
  width: 100%;
}
:deep(.grid-item){
  flex: 1;
}

:deep(.gh-count-to){
  color:#fff;
}
:deep(.sub-panel-content .item){
  margin-bottom: 15px !important;
}
.contanier{
  background: url("/resource/v1/ue5-migrate/assets/images/business-icon/triage-queue/5.png");
  background-size: 100%100%;
  width: 66px;
  height: 46px;
  position: relative;
  margin-right: 9px;
  img{
    position: absolute;
    width: 24px;
    height: 24px;
    left: 21px;
  }
}
.visiting-data {
  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .item {
      width: 49%;
      height: 60px;
      margin-bottom: 5px;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding-left: 23px;

      .ant-statistic {
        display: inline-flex;
        flex-flow: column-reverse;

        .ant-statistic-content {
          height: 29px;

          .ant-statistic-content-value {
            color: #5EA6FF;
            font-size: 22px;
            font-weight: 400;
          }
        }

        .ant-statistic-title {
          color: #D0DEEE;
          font-size: 12px;
          margin: 0;
        }
      }
    }
  }
}
</style>