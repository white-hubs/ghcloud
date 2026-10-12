<template>
  <SubPanelTemplate title="车辆通行情况">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <GridContainer style="margin-top: 12px" :data="alarmStatusData"></GridContainer>
    <div :style="{ height: px2rem(chartHeight + 'px') }">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles"
        gridTop="15" :unit="{ x: '', y: '车次' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getCarData } from "@/mock/security-situation"
import { getXaxleData, px2rem } from '@/utils/common'

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
  chartHeight?: number;
}>(), {
  fromPage: 'PARK',
  chartHeight: 220
})

const colorList = ['rgba(120, 252, 252, 1)', 'rgba(86, 142, 255, 1)']
const linearList = [['rgba(120, 252, 252, 0.5)', 'rgba(120, 252, 252, 0.1)'], ['rgba(86, 142, 255, 0.5)', 'rgba(86, 142, 255, 0.1)']]

const alarmStatusData = ref([
  {alarmStatus: "0", alarmStatusName: "驶入", alarmNum: 0, color: 'rgb(255, 199, 0)'},
  {alarmStatus: "1", alarmStatusName: "驶出", alarmNum: 0, color: 'rgb(0, 242, 123)'},
  {alarmStatus: "2", alarmStatusName: "车位使用率", alarmNum: '', color: 'rgb(41, 194, 255)'}
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
  chartData.value = getCarData({formPage: props.fromPage, timeType: timeType as TimeType})
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
  const inNum = chartData.value.filter((item)=> item.label === '驶入')[0].data.reduce(function (total, value) {
    return total + value;
  }, 0);
  const outNum = chartData.value.filter((item)=> item.label === '驶出')[0].data.reduce(function (total, value) {
    return total + value;
  }, 0);
  const exitNum = inNum - outNum 
  alarmStatusData.value[0].alarmNum = inNum
  alarmStatusData.value[1].alarmNum = outNum
  alarmStatusData.value[2].alarmNum = (inNum / outNum * 100).toFixed(0) + '%' 
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

.appointment-data {
  display: flex;
  align-items: center;
  height: 100%;

  img {
    width: 20px;
    height: 20px;
  }

  :deep(.policeList) {
    display: flex;
    flex-flow: column;
    justify-content: center;

    .thePolice {
      margin-bottom: 6px;
  background: rgba(171, 177, 189, 0.12);

      .thePoliceLeft {
        overflow: visible;
      }
    }
  }
}
.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
}

.chart {
    flex: 1;
    height: 220px;
}
</style>