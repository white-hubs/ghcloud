<template>
  <div >
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
      <EnergyTrend></EnergyTrend>
    <SubPanelTemplate title="设备情况总览">
      <div class="monitorPanelBox">
        <monitorPanel @handel-click-itemize="handelClickDeviceItemize(index)"  v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item">
        </monitorPanel>
      </div>
      <div class="elevator-analysis">
        <div class="chart">
          <elevator-analysis-pie :pieData="pieData">
            <div style="color: #fff;text-align: center;font-size: 14px;">{{ alarmTotal }}</div>
            <div style="color: #fff;text-align: center;font-size: 14px;">总量</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList :contentList="pieData" class="analysisList"></elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
  </div>
  <modal-alarm-table v-if="alarmModalShow" :show-modal="alarmModalShow" @close="closeModal" :parameter="overviewTime"></modal-alarm-table>
  <modal-equipment-table v-if="deviceModalShow" :show-modal="deviceModalShow" @close="closeModal"
    :parameter="deviceParameter"></modal-equipment-table>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import DeviceStatistics from "../triage-queue/components/device-statistics.vue"
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import monitorPanel from "./monitor-panel.vue"
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import overviewChartBar from "./overview-chartBar.vue"
import { ModelValueItf } from "../public/types";
import { getAssetsImage } from '@/utils/getImage';
import { storeMenu } from "@/piniaStore/menu";
import { groupStatistics, statisticsStatus } from '@/api/alarm'
import useCommon from '@/components/hooks/useCommon'
import EnergyTrend from "@/components/businessPanel/energy-consumption/components/energy-trend.vue";//综合能耗趋势图
import { useStateStore } from '@/pages/state/use-state-store';

const { getEquipmentNumber } = useCommon();
const { globalState } = useStateStore()
const deviceModalShow = ref<boolean>(false);
const overviewTime = ref<ModelValueItf>({timeType: 'THIS_MONTH'});
const alarmModalShow = ref<boolean>(false);
  const deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
const colorList = ["#2AE8BD", "#2989FF", "#FFC700", "#EF424A"];

const deviceParameter = ref<Record<string, any>>({
  status: "",
});
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
const monitorPanelData = ref([
  {
    imgPath: 'overView5.png',
    value: 0,
    name: '系统总量'
  },
  {
    imgPath: 'overView29.png',
    value: 0,
    name: '设备总量'
  },
])
let alarmTotal = ref<number>(0)
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
   barData.xData.length?barData.xData:barData.xData=['安防报警', '消防报警', '电气报警', '入侵报警']
   barData.yData[1].data.length?barData.yData[1].data:barData.yData[1].data=['0']
   barData.yData[0].data.length?barData.yData[0].data:barData.yData[0].data=['0']
}
const handelClickDeviceItemize = (item?: any) => {
if (item !== 0) {
  deviceModalShow.value = true;
}
}
const handelClickDeviceNum = () => {
  alarmModalShow.value = true
}
const pieData = ref([
  {
    name: '正常',
    value: 0,
    color: '#2AE8BD',
  },
  {
    name: '离线',
    value: 0,
    color: '#2989FF',
  },
  {
    name: '故障',
    value: 0,
    color: '#FFC700',
  },
  {
    name: '告警',
    value: 0,
    color: '#F14545',
  },
])
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
const receptionTrendsChartData = reactive({
    xData: ['4', '8', '12', '16', '20', '24h'],
    yData: [
        { data: [], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
    ]
})
/**
 * 设备统计
 */
const deviceStatisticsData = reactive({
  title: "报警总量",
  total: 48,
  itemize: [
    {
      name: '处理占比',
      label: "已处理",
      value: 23,
      key: "OFFLINE",
    }
  ],
  list: [
    { img: getAssetsImage('overView5.png'), typeName: "监控设备", total: '333', offlineNum: '33' },
    { img: getAssetsImage('overView5.png'), typeName: "叫号机", total: '33', offlineNum: '33' },
    { img: getAssetsImage('overView5.png'), typeName: "签到机", total: '233', offlineNum: '33' },
    { img: getAssetsImage('overView5.png'), typeName: "叫号机", total: '33', offlineNum: '33' },
  ]
});

// 设备实时数据
const deviceDataInfo = async () => {
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  deviceStatisticsData.total = res.deviceNum
  pieData.value.length = 0
  res.deviceStatusNums.forEach((item,index)=>{
    pieData.value.push({
        name:deviceStatusType[item.name],
        value:item.num,
        color:colorList[index]
    })
  })
  monitorPanelData.value[0].value = res.equipmentOverview
  monitorPanelData.value[1].value = res.deviceNum
  alarmTotal.value = res.deviceNum
}
const closeModal = () => {
  alarmModalShow.value = false;
  deviceModalShow.value = false;
};

onMounted(() => {
  deviceDataInfo()
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
  height: 220px;
}

.analysisList {
  width: 150px;
  margin-left: 10px;
}
</style>
