<template>
  <SubPanelTemplate title="设备告警统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="getAlarmsNumbers">
      </DateInlineForm>
    </template>
    <DeviceStatistics @handel-click-itemize="handelClickDeviceItemize" style="height: 60px;" imgPath="overView21.png"
      :statistic="deviceStatisticsData1">
    </DeviceStatistics>
    <div class="chart">
      <overviewChartBar :bottom="'0%'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive} from 'vue'
import SubPanelTemplate from '@/components/businessPanel/public/subPanelTemplate.vue';
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DeviceStatistics from "@/components/businessPanel/triage-queue/components/device-statistics.vue"
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import { groupStatistics, statisticsStatus } from "@/api/alarm";
import { useStateStore } from '@/pages/state/use-state-store';

const overviewTime = ref()
const { globalState } = useStateStore()
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
// 报警状态统计&报警趋势折线图统计
async function getAlarmsNumbers() {
    let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: overviewTime.value.dateRange.join(","),
    type: overviewTime.value.timeType,
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
}
</script>
<style lang="less" scoped>
.chart{
  height: 220px;
}
</style>