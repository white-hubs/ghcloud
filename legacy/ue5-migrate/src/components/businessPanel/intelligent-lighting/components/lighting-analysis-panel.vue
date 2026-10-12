<template>
  <SubPanelTemplate title="照明能耗分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <div :style="{ height: px2rem(chartHeight + 'px') }">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles"
        gridTop="15" :unit="{ x: '', y: 'kw' }" :axisPointer="true" />
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
import { getlightAnalysis } from "@/mock/light"
import { px2rem } from '@/utils/common';

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
  chartHeight?: number
}>(), {
  fromPage: 'PARK',
  chartHeight: 220
})

const colorList = ['#2AE8BD', '#2989FF']
const titles = ref<string[]>([])
const xData = ref<string[]>([])
const yData = ref<{name:string; data: number[]; lineColor:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([])
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; data?:number[];}[]>([]);

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  xData.value = getXaxleData(timeType)
  titles.value = chartData.value.map((item)=> item.label)
  chartData.value = getlightAnalysis({formPage: props.fromPage, timeType: timeType as TimeType})
  yData.value = chartData.value.map((item, index) => {
    return {
      name: item.label,
      lineColor: colorList[index] ?? '#2AE8BD',
      data: item.data,
      showSymbol:true,
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
      // background: rgba(108, 128, 151, 0.1);
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