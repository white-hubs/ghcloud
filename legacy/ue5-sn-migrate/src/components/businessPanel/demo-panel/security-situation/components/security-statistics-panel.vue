<template>
  <SubPanelTemplate title="安全态势总览">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <GridContainer @clickItem="handelClickDeviceItemize" style="margin-top: 12px;" :data="alarmStatusData">
    </GridContainer>
    <div class="stacked-bar-chart" :style="{ height: px2rem(chartHeight + 'px') }">
      <!-- <stackedBarChart :x-data="xData" :y-data="yData"></stackedBarChart> -->
      <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
  <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
</template> 
<script setup lang="ts">
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import stackedBarChart from '@/components/businessPanel/Information-release/stacked-bar-chart.vue'
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ModelValueItf } from '@/components/businessPanel/public/types';
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { getSecurityStatic } from "@/mock/security-situation"
import overviewChartBar from "../../hospital/overview-chartBar.vue"
import { px2rem } from '@/utils/common'

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
  chartHeight?: number;
}>(), {
  fromPage: 'PARK',
  chartHeight: 220
})
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({});
const handelClickDeviceItemize = (item?: any) => {
  alarmModalShow.value = true;
}
const closeModal = () => {
  alarmModalShow.value = false;
};
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
const alarmStatusData = ref([
  { alarmStatus: "0", alarmStatusName: "报警总量", alarmNum: 0, color: 'rgb(255, 199, 0)' },
  { alarmStatus: "1", alarmStatusName: "已处理", alarmNum: 0, color: 'rgb(0, 242, 123)' },
  { alarmStatus: "2", alarmStatusName: "处理占比", alarmNum: '', color: 'rgb(41, 194, 255)' }
]);
const alarmStatusInit = ref([...alarmStatusData.value])
const xData = ref<string[]>([])
const yData = ref<{ name: string; data: number[]; color: string; }[]>([])
const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
const chartData = ref<{ label: string; processing?: number; handle?: number; }[]>([]);
let barChanrtData = {
  'TODAY': [[18, 22, 37, 44], [20, 28, 37, 40]],
  'THIS_WEEK': [[25, 28, 45, 50], [28, 32, 45, 50]],
  'THIS_MONTH': [[28, 30, 48, 58], [31, 36, 49, 57]],
  'THIS_YEAR': [[35, 39, 45, 60], [38, 40, 45, 60]],
}
const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getSecurityStatic({ formPage: props.fromPage, timeType: timeType as TimeType })
  xData.value = chartData.value.map((item) => item.label)
  chartData.value.forEach((item, index) => {
    const processingList = chartData.value.map((item) => item.processing)
    const handleList = chartData.value.map((item) => item.handle)
    yData.value = [
      {
        name: '处理中',
        data: processingList,
        color: '#2AE8BD'
      },
      {
        name: '已处理',
        data: handleList,
        color: '#328BF7'
      }
    ]
  })
  alarmStatusData.value = alarmStatusInit.value
  const total = chartData.value.reduce(function (total, value) {
    return total + value.processing + value.handle;
  }, 0);
  const handleTotal = chartData.value.reduce(function (total, value) {
    return total + value.handle;
  }, 0);
  alarmStatusData.value[0].alarmNum = total
  alarmStatusData.value[1].alarmNum = handleTotal
  alarmStatusData.value[2].alarmNum = (handleTotal / total * 100).toFixed(0) + '%'

  barData.yData[0].data = barChanrtData[timeType][0]
  barData.yData[1].data = barChanrtData[timeType][1]
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
.stacked-bar-chart {
  width: 100%;
  height: 300px;
}

:deep(.ant-statistic) {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

:deep(.ant-statistic-title) {
  white-space: nowrap;
  margin-bottom: 0;
}

:deep(.ant-statistic-content) {
  font-size: 14px !important;
  padding-left: 0 !important;
}
</style>