<template>
  <div >
   <SecurityAnalysis :title="getTenant"></SecurityAnalysis>
    <SubPanelTemplate title="能耗态势总览">
      <template #extra> 
        <DateInlineForm v-model:modelValue="energyOverviewTime" @search="changeHandleEnergyOverviewTime">
        </DateInlineForm>
      </template>
      <overviewPanel :overPanelData="overPanelData">
        <img width="26" height="26" :src="getAssetsImage('overView24.png')" alt="">
      </overviewPanel>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备情况总览">
      <div class="monitorPanelBox">
        <monitorPanel v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item"
          @handel-click-itemize=" handelClickDeviceItemize(index)"></monitorPanel>
      </div>
      <div class="elevator-analysis">
        <div class="chart" style="width: 120px;">
          <elevator-analysis-pie :pieData="pieData">
            <div style="color: #fff;text-align: center;font-size: 14px;">{{ alarmTotal }}</div>
            <div style="color: #fff;text-align: center;font-size: 14px;">总量</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px;"></elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
  </div>
  <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
  <modal-equipment-table :show-modal="deviceModalShow" @close="closeModal"
    :parameter="deviceParameter"></modal-equipment-table>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted, computed } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DeviceStatistics from "@/components/businessPanel/triage-queue/components/device-statistics.vue"
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import overviewPanel from "@/components/businessPanel/public/overview-panel.vue"
import monitorPanel from "./monitor-panel.vue"
import overviewChartBar from "./overview-chartBar.vue"
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import { getAssetsImage } from '@/utils/getImage';
import { OverviewConsumptionSituation, SecuritySituationOverview } from '@/mock/hospital';
import { ModelValueItf } from '@/components/businessPanel/public/types'
import useCommon from '@/components/hooks/useCommon'
import SecurityAnalysis from '@/components/businessPanel/security-overview/cards/security-analysis.vue'

const { getEquipmentNumber } = useCommon();
const deviceModalShow = ref<boolean>(false);
const overviewTime = ref<ModelValueItf>()
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({});
const energyOverviewTime = ref<ModelValueItf>()
const deviceParameter = ref<Record<string, any>>({
  status: "",
});
const getTenant = computed(()=>{
  const { code } = JSON.parse(sessionStorage.getItem('GH-NowEnterprise'))
  if (code !== 48055979) {
    return '安全态势总览'
  }else{
    return '火灾消防'
  }
})
const overPanelData = reactive({
  panelData1: 300,
  panelImg1: 'overView25.png',
  panelRatio1: 0.5,
  panelName1: '碳排量(kg CO₂e)',

  panelData2: 405,
  panelImg2: 'overView28.png',
  panelRatio2: 2,
  panelName2: '用水量(t)',

  panelData3: 623,
  panelImg3: 'overView26.png',
  panelRatio3: -2,
  panelName3: '用电量(kw·h)',

  panelData4: 524,
  panelImg4: 'overView27.png',
  panelRatio4: -1,
  panelName4: '燃气用量(m³)',
})
const monitorPanelData = ref([
  {
    imgPath: 'overView5.png',
    value: 30,
    name: '系统总量'
  },
  {
    imgPath: 'overView29.png',
    value: 2334,
    name: '设备总量'
  },
])
let alarmTotal = ref<number>(2334)
const changeHandleOverviewTime = () => {
  let res = SecuritySituationOverview(overviewTime.value.timeType)
  barData.yData[0].data = res[0]
  barData.yData[1].data = res[1]
};
const changeHandleEnergyOverviewTime = () => {
  let res = OverviewConsumptionSituation(energyOverviewTime.value.timeType)
  overPanelData.panelData1 = res[0]
  overPanelData.panelRatio1 = res[1]
  overPanelData.panelData2 = res[2]
  overPanelData.panelRatio2 = res[3]
  overPanelData.panelData3 = res[4]
  overPanelData.panelRatio3 = res[5]
  overPanelData.panelData4 = res[6]
  overPanelData.panelRatio4 = res[7]
};
const pieData = ref([
  {
    name: '正常',
    value: 300,
    color: '#2AE8BD',
  },
  {
    name: '离线',
    value: 14,
    color: '#2989FF',
  },
  {
    name: '故障',
    value: 10,
    color: '#FFC700',
  },
  {
    name: '告警',
    value: 10,
    color: '#F14545',
  },
])
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
const handelClickDeviceItemize = (item?: any) => {

  if (item !== 0) {
    deviceModalShow.value = true;
  }
  // deviceParameter.value = { applicationCode: item?.applicationCode };
}
// 设备实时数据
const deviceDataInfo = async () => {
  const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
  const colorList = ["#2AE8BD", "#2989FF", "#FFC700", "#EF424A"];
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
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
const handelClickDeviceNum = () => {
  alarmModalShow.value = true
}
const closeModal = () => {
  alarmModalShow.value = false;
  deviceModalShow.value = false;
};
let timer = null
const fakeData = [
  { total: 3345, offlineNum: 234 },
  { total: 3345, offlineNum: 635 },
  { total: 3345, offlineNum: 1201 },
  { total: 3345, offlineNum: 1549 },
  { total: 3345, offlineNum: 2134 },
]
let fakeIndex = 1

let pieChartData = [
  [18, 2, 5, 3],
  [25, 3, 4, 1],
  [30, 7, 2, 3],
  [35, 2, 4, 7],
  [40, 5, 4, 7],
]
let barChanrtData = [
  [[18, 22, 37, 44], [20, 28, 37, 40]],
  [[25, 28, 45, 50], [28, 32, 45, 50]],
  [[28, 30, 48, 58], [31, 36, 49, 57]],
  [[35, 39, 45, 60], [38, 40, 45, 60]],
  [[50, 61, 47, 65], [35, 45, 66, 68]],
]
onMounted(() => {
  deviceDataInfo()
  return
  timer = setInterval(() => {
    deviceStatisticsData.total = fakeData[fakeIndex].total
    deviceStatisticsData.itemize[0].value = fakeData[fakeIndex].offlineNum

    barData.yData[0].data = barChanrtData[fakeIndex][0]
    barData.yData[1].data = barChanrtData[fakeIndex][1]

    // alarmTotal.value = 0
    // pieChartData[fakeIndex].forEach(item => alarmTotal.value += item)
    // pieData.value[0].value = pieChartData[fakeIndex][0]
    // pieData.value[1].value = pieChartData[fakeIndex][1]
    // pieData.value[2].value = pieChartData[fakeIndex][2]
    // pieData.value[3].value = pieChartData[fakeIndex][3]
    fakeIndex++
    if (fakeIndex > fakeData.length - 1) {
      clearInterval(timer)
      fakeIndex = 0
    }
  }, 20*1000)
})

onUnmounted(() => {
  clearInterval(timer)
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
  height: 220px;
}
</style>
