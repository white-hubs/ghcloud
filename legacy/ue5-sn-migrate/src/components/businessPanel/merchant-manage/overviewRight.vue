<template>
  <div class="panel">
    <SubPanelTemplate title="监控态势" class="alarm-event">
      <DeviceStatistics @handelClickItemize="deviceOpen" imgPath="overView5.png" :statistic="deviceStatisticsData">
      </DeviceStatistics>
      <div class="elevator-analysis">
        <div class="chart">
          <elevator-analysis-pie @clickbar="alarmRegion" :pieData="detectionData">
            <div style="color: #fff;text-align: center;font-size: 14px;">{{ alarmTotal }}</div>
            <div style="color: #fff;text-align: center;font-size: 14px;">设备总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList @handlecurrent="alarmRegion" :showRatio="false" :contentList="detectionData"
          class="pie_list">
        </elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="隐患统计">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="hiddenDangerTime"
          @search="changeHandleHiddenDangerTime"
        ></DateInlineForm>
      </template>
      <GridContainer style="margin-top: 10px" :data="alarmStatusData"></GridContainer>
      <div class="monitor-statistic">
        <div class="flex-between">
            <PlanPie :pieData="hiddenDanger.PieData">
              <div class="content">
                <div class="total-num">{{ hiddenDanger.total }}</div>
                <div>工单总数</div>
              </div>
            </PlanPie>
            <PieList
              :roundPieData="hiddenDanger.PieData"
            ></PieList>
          </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报修工单统计">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="workOrderTime"
          @search="changeHandleworkOrderTime"
        ></DateInlineForm>
      </template>
      <div class="charts">
        <barChart :title="''" :x-data="xData"
            :data="[{ color: '#1890FF', name: '', data: yData }]" class="columnBox" />
    </div>
    </SubPanelTemplate>
    <modal-equipmentAll-table :show-modal="deviceModalShow" @close="deviceModalShow = false"
      :parameter="deviceParameter"></modal-equipmentAll-table>
  </div>
</template>
<script setup lang="ts">
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import SituationAnalysis from "../overview/situation-analysis.vue";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import DeviceStatistics from "../security-monitoring-safty/device-statistics.vue";
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import PieList from "../public/pieList.vue";
import { ModelValueItf } from "../public/types";
import { onMounted, reactive, ref } from "vue";
import { getDeviceBuyArea, getDeviceNumber, getMonitorSituation } from "@/api/device";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { getStateTotal } from "@/api/personnel";
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import {getFaultyEquipmentTop, getHazardStatistics} from "@/api/merchant"
import { storeMenu } from '@/piniaStore/menu'
import { setDeviceData } from '@/utils/common'
import { storeArea } from '@/piniaStore/area'
import { sceneTypePage } from '@/api/mdata'
const workOrderTime = ref<ModelValueItf>();
const hiddenDangerTime = ref<ModelValueItf>();
const xData = ref<string[]>([])
const yData = ref<number[]>([])
  const alarmStatusData = ref([
  {alarmStatus: "ALARM_PROGRESS_CONFIRMED", alarmStatusName: "工单总数", alarmNum: 0, color: 'rgb(255, 199, 0)'},
  {alarmStatus: "ALARM_PROGRESS_CONFIRMED", alarmStatusName: "未处理", alarmNum: 0, color: 'rgb(0, 242, 123)'},
  {alarmStatus: "ALARM_PROGRESS_CONFIRMED", alarmStatusName: "已处理 ", alarmNum: '', color: 'rgb(41, 194, 255)'}
]);
const detectionData = ref([])
const alarmTotal = ref<number>(0);
const deviceStatisticsData = reactive({
  title: "设备总数",
  total: 48,
  itemize: [
    {
      name: "在线设备数",
      label: "离线设备数",
      value: 23,
      offline: 15,
      key: "OFFLINE1",
    }
  ],
});
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const deviceParameter = reactive({
  areaId:'',
  status:'',
  filterAreaIds:[],
  tagCodes:[`custom.app::visual.${piniaStoreMenu.currentMenu}`],
  dateRange:[],
})
const monitorSituationAnalysis = reactive({
  title: "设备总数",
  total: 0,
  itemize: [
    {
      label: "在线",
      value: 0,
      color: "#35D93D",
      key: "NORMAL",
    },
    {
      label: "离线",
      value: 0,
      color: "#D0DEEE",
      key: "OFFLINE",
    },
    {
      label: "故障",
      value: 0,
      color: "#FFC700",
      key: "TROUBLE",
    },
    {
      label: "报警",
      value: 0,
      color: "#F14545",
      key: "ALARM",
    },
  ],
});
const hiddenDanger = reactive({
  PieData:[],
  total:0
})
const monitorSituationColors = ref<string[]>([
  "#FFAB10",
  "#2F8DFF",
  "#F14545",
  "#19F8F7",
]);
const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>(
  []
);
const personStatistic = reactive({
  total: 0,
  onDutyNum: 0,
  leaveNum: 0,
});
const deviceModalShow = ref(false);
const closeModal = () => {
  deviceModalShow.value = false;
};

const requestStateTotal = async () => {
  const res = await getStateTotal();
  personStatistic.total = res.find((item) => item.name === "TOTAL")?.value;
  personStatistic.onDutyNum = res.find((item) => item.name === "ON_DUTY")?.value;
  personStatistic.leaveNum = res.find((item) => item.name === "OFF_DUTY")?.value;
};
const alarmRegion = (value) =>{
deviceParameter.status = ''
    if (value.name === '其他') {
        deviceParameter.areaId = undefined
        deviceParameter.filterAreaIds = detectionData.value.map(e=>e.areaId)
    }else{
        deviceParameter.areaId = detectionData.value.find(e=>e.name === value.name).areaId
        deviceParameter.filterAreaIds = []
    }
deviceModalShow.value = true
}

const changeHandleworkOrderTime = async() => { 
 const res =await getFaultyEquipmentTop({period:workOrderTime.value.dateRange.join(',')})
    xData.value.length = 0
    yData.value.length = 0
    res.forEach(item=>{
      xData.value.push(item.name)
      yData.value.push(item.value)
    })
};
const alarmEventTop =async () => {
let colorList = ['#328BF7', '#19F8F7', '#FFC700', '#EF424A']
    const data =await getDeviceNumber({tagCodes:deviceParameter.tagCodes[0],areaId:piniaStoreArea.currentAreaId})
    deviceStatisticsData.total = data.totalNumber
    deviceStatisticsData.itemize[0].value = data.offlineNumber
    deviceStatisticsData.itemize[0].offline = data.normalNumber
    const res = await getDeviceBuyArea({
        tagCodes: deviceParameter.tagCodes,
        areaLevel: piniaStoreArea.currentAreaLeave,
    });
    alarmTotal.value = 0
    detectionData.value = setDeviceData(res,colorList)
    detectionData.value.forEach(item=>{
        alarmTotal.value += item.value
    })
}
const deviceOpen = (value)=>{
    if (value === '离线设备数') {
        deviceParameter.status = 'OFFLINE'
    }else if( value === '在线设备数'){
        deviceParameter.status = 'ONLINE'
    }else{
        deviceParameter.status = ''
    }
    deviceParameter.areaId = piniaStoreArea.currentAreaId
    deviceModalShow.value = true
}
const changeHandleHiddenDangerTime = async()=>{
 const res =await getHazardStatistics({period:hiddenDangerTime.value.dateRange.join(',')})
 alarmStatusData.value[0].alarmNum =res.total
 alarmStatusData.value[1].alarmNum =res.afoot
 alarmStatusData.value[2].alarmNum =res.end
 hiddenDanger.total = 0
 hiddenDanger.PieData = res.data.map((item,index)=>{
  hiddenDanger.total +=item.value
  return {
    label:item.name,
    value:item.value,
    color:monitorSituationColors.value[index]
  }
 })
}
/** 获取菜单 */
async function getMenuList() {
  const res = await sceneTypePage();
  const arr = res.filter(e=>{
    return e.name.includes('安防')
  })
  if (arr.length) {
    deviceParameter.tagCodes = [`custom.app::visual.${arr[0].id}`]
  }
  
}
onMounted(async() => {
 await getMenuList()
  requestStateTotal();
  alarmEventTop()
});
</script>
<style lang="less" scoped>
.panel {
  font-size: 12px;
  color: #d0deee;

  .scroll-number {
    font-size: 24px;
    margin-left: 8px;
  }
}

.monitor-statistic {
  width: 100%;

  .content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
      font-size: 16px;
    }
  }
}

.charts{
  height: 200px;
}
:deep(.policeList){
  height: auto !important;
}
.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 10px 10px;
    align-items: center;

    .pie_list {
        width: 150px;
        margin-left: 10px;
    }
}
.chart {
    flex: 1;
    height: 180px;
}
</style>
