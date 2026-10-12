<template>
    <div >
        <SubPanelTemplate title="设备告警统计">
            <template #extra>
                <DateInlineForm v-model:modelValue="overviewTime" @search="getAlarmsNumbers">
                </DateInlineForm>
            </template>
            <DeviceStatistics @handel-click-itemize="handelClickDeviceItemize" style="height: 60px;" imgPath="overView21.png" :statistic="deviceStatisticsData1">
            </DeviceStatistics>
            <div class="chart">
                <overviewChartBar :bottom="'0%'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="信息发布">
            <RollTable :column="column" :data="listData">
            </RollTable>
        </SubPanelTemplate>
        <SubPanelTemplate title="设备报警趋势" class="alarm-event">
            <template #extra>
                <DateInlineForm v-model:modelValue="trend" @search="getAlarmTrend"></DateInlineForm>
            </template>
            <OperateDays :value="alarmInfo.total" title="报警总数">
                <div class="ringRatio">
                    <span>环比</span>
                    <!-- uptriangle 向上三角根据Prop改变 -->
                    <div :class="['downtriangle', alarmInfo.chainRatio > 0 && 'uptriangle']"></div>
                    <div :class="[alarmInfo.chainRatio > 0 ? 'up' : 'down']">
                        {{ alarmInfo.chainRatio + "%" }}
                    </div>
                </div>
            </OperateDays>
            <GridContainer :parameter="trend" style="margin-top: 12px" :data="alarmStatusData"></GridContainer>
              <LineChart class="chart1" :x-data="xData.arr" :series="series"></LineChart>
        </SubPanelTemplate>
    </div>
    <modal-alarm-table v-if="alarmModalShow" :show-modal="alarmModalShow" @close="closeModal" :parameter="overviewTime"></modal-alarm-table>
</template>
  
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import DeviceStatistics from "../triage-queue/components/device-statistics.vue"
import OperateDays from "../public/operateDays.vue";
import GridContainer from "../public/gridContainer.vue";
import LineChart from "../public/lineChart.vue";
import overviewChartBar from "../hospital/overview-chartBar.vue"
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import { ModelValueItf } from "../public/types";
import RollTable from "../public/rollTable/index.vue";
import { groupStatistics, statisticsStatus } from "@/api/alarm";
import useCommon from '@/components/hooks/useCommon'
import { alarmTrend } from '@/utils/requestData/alarm'
import enumeratie from '@/utils/enumeratie'
import {  playRecord } from '@/api/securitymanagement'
import dayjs from 'dayjs'
import { useStateStore } from '@/pages/state/use-state-store';

const { alarmStatusOptions } = enumeratie();
const {
  getAlarmsNumber,
} = useCommon();
const { globalState } = useStateStore()
const alarmInfo = reactive({
  total: 0,
  chainRatio: 0,
});
const overviewTime = ref<ModelValueItf>()
const alarmModalShow = ref<boolean>(false);
const trend = reactive<ModelValueItf>({
timeType: 'TODAY',
dateRange: []
});
const xData = reactive({ arr: [] });
const series = reactive([
  {
    data: [],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
const alarmStatusData = reactive([]);
const closeModal = () => {
    alarmModalShow.value = false;
};
const handelClickDeviceItemize = () => {
  alarmModalShow.value = true;
}
const column = reactive([
  {
    title: "信息名称",
    dataIndex: "itemName",
    width: 120,
  },
  {
    title: "发布时间",
    dataIndex: "startTime",
    width: 160,
  },
]);
const listData = ref([
])
// 设备报警趋势
const getAlarmTrend = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: trend.dateRange.join(","),
    type: trend.timeType,
  };
  let res: any = await getAlarmsNumber(param);
  let data: any = await alarmTrend(param);
  
  xData.arr = data.xdata;
  series[0].data = data.ydata;
  alarmStatusData.length = 0;
  res.alarmStatusStatistics.forEach((item) => {
    let obj = {
      alarmStatusName: item.alarmStatusName,
      alarmNum: item.alarmNum,
      color: "",
    };
    alarmStatusOptions.value.forEach((element) => {
      if (item.alarmStatus === element.value) {
        obj.color = element.color;
      }
    });
    alarmStatusData.push(obj);
  });
  alarmInfo.total = res.count;
  alarmInfo.chainRatio = res.ratio;
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
// 信息发布
const getPlayRecord = async () => {
  const res = await playRecord()
  listData.value = res.records
  listData.value.forEach(item=>{
    item.startTime = dayjs(item.startTime).format("YYYY-MM-DD HH:mm:ss")
  })
}
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
onMounted(() => {
  getPlayRecord()
})

</script>
<style scoped lang="less">
.monitorPanelBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
}

.chart {
    flex: 1;
    height: 180px;
}

.stacked-bar-chart {
    width: 100%;
    height: 220px;
}

.monitorPanelBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.ringRatio {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    margin-left: 6px;
}
.chart1{
  height: 200px;
}
</style>
  