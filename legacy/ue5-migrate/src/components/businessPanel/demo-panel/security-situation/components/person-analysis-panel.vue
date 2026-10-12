<template>
  <SubPanelTemplate title="人员出入情况">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <GridContainer style="margin-top: 10px" :data="alarmStatusData"></GridContainer>
    <div :style="{ height: px2rem(chartHeight + 'px') }">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles"
        gridTop="15" :unit="{ x: '', y: '人次' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { getPersonData } from "@/mock/security-situation"
import { getXaxleData, px2rem } from '@/utils/common'

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
  chartHeight?: number;
}>(), {
  fromPage: 'PARK',
  chartHeight: 220
})

const colorList = ['#2AE8BD', '#2989FF']
const alarmStatusData = ref([
  {alarmStatus: "0", alarmStatusName: "进入", alarmNum: 0, color: 'rgb(255, 199, 0)'},
  {alarmStatus: "1", alarmStatusName: "离开", alarmNum: 0, color: 'rgb(0, 242, 123)'},
  {alarmStatus: "2", alarmStatusName: "在院", alarmNum: 0, color: 'rgb(41, 194, 255)'}
]);
const alarmStatusInit = ref([...alarmStatusData.value])
const titles = ref<string[]>([])
const xData = ref<string[]>([])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([])
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; data?:number[];}[]>([]);

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  xData.value = getXaxleData(timeType)
  titles.value = chartData.value.map((item)=> item.label)
  chartData.value = getPersonData({formPage: props.fromPage, timeType: timeType as TimeType})
const linearList = [['rgba(120, 252, 252, 0.5)', 'rgba(120, 252, 252, 0.1)'], ['rgba(86, 142, 255, 0.5)', 'rgba(86, 142, 255, 0.1)']]
  chartData.value.forEach((item, index) => {
    yData.value = chartData.value.map((item, index) => {
      return {
        name: item.label,
        lineColor: colorList[index] ?? '#2AE8BD',
        linearGradientColor: linearList[index],
        data: item.data,
        // showSymbol:true,
        smooth:true,
        symbolSize: 8
      }
    })
  })
  alarmStatusData.value = alarmStatusInit.value
  const inNum = chartData.value.filter((item)=> item.label === '进入')[0].data.reduce(function (total, value) {
    return total + value;
  }, 0);
  const outNum = chartData.value.filter((item)=> item.label === '离开')[0].data.reduce(function (total, value) {
    return total + value;
  }, 0);
  const exitNum = inNum - outNum 
  alarmStatusData.value[0].alarmNum = inNum
  alarmStatusData.value[1].alarmNum = outNum
  alarmStatusData.value[2].alarmNum = exitNum < 0 ? 0 : exitNum
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
// 单个模块统计样式
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
</style>