<template>
      <SubPanelTemplate title="安全态势总览">
      <template #extra>
        <DateInlineForm v-model:modelValue="overviewTime" @search="getAlarmsNumbers">
        </DateInlineForm>
      </template>
      <DeviceStatistics @handel-click-itemize="handelClickDeviceNum" style="height: 60px;" imgPath="overView21.png" :statistic="deviceStatisticsData1">
      </DeviceStatistics>
      <div class="chart">
        <overviewChartBar :bottom="'0%'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
      </div>
    </SubPanelTemplate>
  <modal-alarm-table v-if="alarmModalShow" :show-modal="alarmModalShow" @close="closeModal" :parameter="overviewTime"></modal-alarm-table>

</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import DeviceStatistics from "../triage-queue/components/device-statistics.vue"
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import { ModelValueItf } from "../public/types";
import { groupStatistics, statisticsStatus } from '@/api/alarm'
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const overviewTime = ref<ModelValueItf>()
const alarmModalShow = ref<boolean>(false);

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
// 报警状态统计&报警趋势折线图统计
async function getAlarmsNumbers() {
    let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
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
   barData.xData.length?barData.xData:barData.xData=['安防报警', '消防报警', '电气报警', '入侵报警']
   barData.yData[1].data.length?barData.yData[1].data:barData.yData[1].data=['0']
   barData.yData[0].data.length?barData.yData[0].data:barData.yData[0].data=['0']
}
const handelClickDeviceNum = () => {
  alarmModalShow.value = true
}
const closeModal = () => {
  alarmModalShow.value = false;
};
</script>
<style lang="less" scoped>
.chart {
  flex: 1;
  height: 220px;
}
</style>