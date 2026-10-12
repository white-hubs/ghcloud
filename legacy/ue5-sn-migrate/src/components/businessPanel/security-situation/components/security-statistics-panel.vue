<template>
  <SubPanelTemplate title="安全态势总览">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getAlarmsNumbers"></DateInlineForm>
    </template>
    <DeviceStatistics  @handel-click-itemize="handelClickDeviceItemize" style="height: 60px;" imgPath="overView21.png" :statistic="deviceStatisticsData1">
    </DeviceStatistics>
    <div class="stacked-bar-chart" :style="{ height: px2rem(chartHeight + 'px') }">
      <!-- <stackedBarChart :x-data="xData" :y-data="yData"></stackedBarChart> -->
      <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
  <modal-alarm-table v-if="alarmModalShow" :show-modal="alarmModalShow" @close="closeModal" :parameter="trendTime"></modal-alarm-table>
</template> 
<script setup lang="ts">
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "../../triage-queue/components/device-statistics.vue"
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ModelValueItf } from '@/components/businessPanel/public/types';
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import { getSecurityStatic } from "@/mock/security-situation"
import overviewChartBar from "../../hospital/overview-chartBar.vue"
import { px2rem } from '@/utils/common'
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { groupStatistics, statisticsStatus } from '@/api/alarm'

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
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
      data: [],
      name: '已处理',
      color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
    },
    {
      data: [],
      name: '处理中',
      color: ['rgba(42, 232, 189, 0.80)', 'rgba(42, 232, 189, 0)']
    },
  ]
})
/**
 * 设备统计
 */
 const deviceStatisticsData1 = reactive({
    title: "告警总量",
    total: 0,
    itemize: [
        {
            name: '处理占比',
            label: "已处理",
            value: 0,
            key: "OFFLINE",
        }
    ]
});
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
// 报警状态统计&报警趋势折线图统计
async function getAlarmsNumbers() {
    let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: trendTime.value.dateRange.join(","),
    type: trendTime.value.timeType,
  };
  const Status = await statisticsStatus(params);
  deviceStatisticsData1.total = Status.alarmNum
  Status.alarmStatusStatistics.forEach(item=>{
    if (item.alarmStatusName === '已处理') {
        deviceStatisticsData1.itemize[0].value = item.alarmNum
    }
  })
   const res = await groupStatistics(params)
   barData.xData = res.map(item=>item.applicationName)
   barData.yData[0].data = res.map(item=>item.alarmHandler)
   barData.yData[1].data = res.map(item=>item.alarmProgressConfirmed)
   barData.yData[0].data.length?barData.yData[0].data:barData.yData[0].data=['']
   barData.yData[1].data.length?barData.yData[1].data:barData.yData[1].data=['']
   barData.xData.length?barData.xData:barData.xData=['安防报警', '消防报警', '电气报警', '入侵报警']
}


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