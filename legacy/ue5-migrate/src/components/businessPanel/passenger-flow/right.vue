<template>
  <div >
    <SubPanelTemplate title="设备状态">
      <div >
        <GridContainer :data="deviceStatistic" class="body-bum"></GridContainer>
        <div class="pie-chart">
          <pieGuidance :y-data="yData"  height="80%"></pieGuidance>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备告警"  style="maxHeight: 200px;" class="product-table">
      <template #extra>
        <div class="dataTitle">
          <div class="dataTitle-right" style="color: #5EA6FF;" @click="handleAll">查看详情>></div>
        </div>
      </template>
      <RollTable :column="alarmColumn" :data="alarmListData" :showLength="4">
        <template #alarmStatus="{ record }">
          <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待接收</span>
          <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
    <SubPanelTemplate title="各个区域客流量">
      <div class="chart">
        <barChart :title="'人次'" :unit="'人'" :x-data="areaChart.xData"
          :data="[{ color: '#1890FF', name: '', data: areaChart.yData }]" class="columnBox" />
      </div>
    </SubPanelTemplate>
   <!-- <div class="btn"> 
    <a-button type="primary" size="small">上一页</a-button>
    <a-button size="small">下一页</a-button>
  </div> -->
  </div>
  <modal-alarm-table :show-modal="deviceModal" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
</template>
<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import pieGuidance from "../public/charts/pie/pie-guidance.vue"
import useCommon from '@/components/hooks/useCommon'
import RollTable from "../public/rollTable/index.vue";
import barChart from "../public/charts/bar/barChart.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import GridContainer from "../public/gridContainer.vue";
import { alarmStatisticsList } from '@/api/alarm'
import { passengerFlowRegions } from '@/api/passenger-flow'
import moment from 'moment'
import { useStateStore } from '@/pages/state/use-state-store';
const { globalState } = useStateStore()
const { getEquipmentNumber } = useCommon();
//设备状态=============================================================================================
const deviceModal = ref<boolean>(false);
let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const yData = ref([])
let deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
const handleAll = () => {
  deviceModal.value = true
}
const closeModal = () => {
  deviceModal.value = false;
};
const alarmParameter = ref<Record<string, any>>({});
const deviceStatistic = ref([]);
//设备告警===============================================================================================
const alarmColumn = [
  {
    title: "设备名称",
    dataIndex: "alarmTargetName",
    width: 120,
  },
  {
    title: "所属区域",
    dataIndex: "areaName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
  },
  {
    title: "当前状态",
    dataIndex: "status",
    width: 140,
    slots: {
      customRender: "alarmStatus",
    },
  }
];
const alarmListData = ref([])
//获取设备状态
const getEquipmentInfo = async () => {
    yData.value.length = 0
    let res:any = await getEquipmentNumber()
    if (!res.deviceNum) {
        return
    }
    deviceStatistic.value.length = 0
    res.deviceStatusNums.forEach((item, index) => {
        yData.value.push({
            name: deviceStatusType[item.name],
            value: item.num,
            itemStyle:{color:colorList[index]} 
        })
        deviceStatistic.value.push({
            alarmStatusName: deviceStatusType[item.name],
            color: colorList[index],
            alarmNum: item.num,
        })

    })
}
// 获取报警列表
async function getAlarmTakeNotes() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    pageSize: 50,
    pageNumber: 1,
  };
  let res: any = await alarmStatisticsList(params);
  alarmListData.value = res.records.map((item) => {
    return {
      ...item
    };
  });
}
//各个区域客流量==================================================================================
const areaChart = reactive({
    xData: [],
    yData: []
})
const getPassengerFlowRegions=async ()=>{
  const date=[moment().format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(',')
  let params = {
      sceneType: globalState.business.currentMenu,
      areaId: globalState.business.currentAreaId,
      period: date
    };
  const res=await passengerFlowRegions(params)
  areaChart.xData=[]
  res.forEach((item)=>{
    areaChart.xData.push(item.areaName)
    areaChart.yData.push(item.num)
  })
}


onMounted(()=>{
  getEquipmentInfo()
  getAlarmTakeNotes()
  getPassengerFlowRegions()
})
</script>
<style lang="less" scoped>
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}
// .btn{
//   display: flex;justify-content: end;
//   margin-top:10px;
//   button{
//     margin:5px;
//   }
// }
.monitor {
  .body {
    margin-top: 0;
  }

  .title {
    color: #fff;
    font-size: 16px;
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .camera {
      margin: 0 6px;
      width: 160px;
      height: 90px;
      margin-top: 10px;
    }
  }

  .right-bar {
    width: 56px;
    height: 24px;
    background: rgba(41, 137, 255, 0.102);
    border-radius: 2px;
    border: 1px solid #2989ff;
    color: #fff;
    text-align: center;
    line-height: 24px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: space-around;

    img {
      width: 14px;
      height: 14px;
    }
  }
}

.more {
  color: #2F8DFF;
  cursor: pointer;
  font-size: 16px;
}

.chart {
  height: 220px;
}
:deep(.ant-radio-button-wrapper) {
  background: none;
  border: none;
  color: #fff;
}

:deep(.ant-radio-button-wrapper-checked) {
  background: linear-gradient(180deg, rgba(41, 137, 255, 0.4) 0%, rgba(41, 137, 255, 0.8) 100%) !important;
}
.pie-chart{
  height: 320px;
}
</style>