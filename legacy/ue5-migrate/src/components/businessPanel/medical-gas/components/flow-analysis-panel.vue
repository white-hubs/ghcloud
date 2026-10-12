<template>
  <SubPanelTemplate title="流量使用趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <div :style="{ height: chartHeight + 'px' }">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" 
        gridTop="15" :unit="{ x: '', y: 'm³' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { getXaxleData } from "@/utils/common";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getFlowData } from "@/mock/medical-gas"

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
  chartHeight?: number;
}>(), {
  fromPage: 'PARK',
  chartHeight: 240
})

const colorList = ['rgba(25,248,247, 0.5)', 'rgba(25,248,247, 0.1)']
const titles = ref<string[]>([])
const xData = ref<string[]>([])
const yData = ref<{name:string; data: number[]; lineColor?:string; linearGradientColor?:string[]; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([])
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; data?:number[];}[]>([]);

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  xData.value = getXaxleData(timeType)
  titles.value = chartData.value.map((item)=> item.label)
  chartData.value = getFlowData({formPage: props.fromPage, timeType: timeType as TimeType})
  yData.value = chartData.value.map((item, index) => {
    return {
      name: item.label,
      linearGradientColor: colorList,
      lineColor: '#19F8F7',
      data: item.data,
      // showSymbol:true,
      smooth:true,
      symbolSize: 8
    }
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

</style>