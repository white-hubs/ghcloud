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
import { reactive, ref } from 'vue';
import { ModelValueItf } from '@/components/businessPanel/public/types';
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import overviewChartBar from "../../hospital/overview-chartBar.vue"
import { px2rem } from '@/utils/common'
import { storeMenu } from "@/piniaStore/menu";
import { groupStatistics, statisticsStatus } from '@/api/alarm'
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore()
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
const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
// 报警状态统计&报警趋势折线图统计
async function getAlarmsNumbers() {
    let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
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