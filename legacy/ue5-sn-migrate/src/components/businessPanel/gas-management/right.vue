<template>
  <div class="panel">
    <!-- <SubPanelTemplate title="燃气浓度监测" class="alarm-event">
      <div class="monitorCard">
        <div class="cardItem" v-for="item in twoCardList[carousel]" @click="clickRow(item)">
          <img :src="getAssetsImage('92-icon.png')" alt="" width="32" height="32">
          <div>
            <div :title="item.label" class="label">{{ item.label }}</div>
            <div class="value" v-if="item.value"><span>{{ item.value }}</span><span class="unit">{{ item.unit }}</span></div>
          </div>
        </div>
      </div>
    </SubPanelTemplate> -->
    <securityDeviceCount></securityDeviceCount>
    <SubPanelTemplate title="报警区域TOP5">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleTime" @search="changeHandleTime"></DateInlineForm>
      </template>
      <div class="body" style="min-height: 250px;" v-show="alarmRank.list.length > 0">
        <EventAlarmItem @click="handleClickItem(item)" v-for="(item, index) in alarmRank.list" :key="item.id"
          :sort="index + 1" :name="item.name" :linkRatio="item.chainRatio" :count="item.alarmNum"
          :ratio="item.ratio + '%'" />
      </div>
      <div class="body" style="min-height: 150px;" v-show="alarmRank.list.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警记录">
      <template #extra>
        <DateInlineForm v-model:modelValue="timeTypes" @search="changeEventTime"></DateInlineForm>
      </template>
      <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="overView21.png"
        :statistic="deviceStatisticsRecord"></DeviceStatistics>
      <RollTable @clickRow="openAlarmModal" :column="column" :data="listData" :limitScrollNum="4">
        <template #alarmStatus="{ record }">
          <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
          <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
  <modal-equipmentAll-table :show-modal="deviceAllModalShow" @close="deviceAllModalShow = false"
      :parameter="deviceAllParameter"></modal-equipmentAll-table>
  </div>
</template>
<script lang="ts" setup>
import {onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import securityDeviceCount from '@/components/businessPanel/security-overview/cards/public-security-device-count.vue';
import { getAssetsImage } from "@/utils/getImage";
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import DateInlineForm from '../public/dateInlineForm.vue';
import DeviceStatistics from "../security-monitoring-safty/device-statistics.vue";
import EventAlarmItem from '../public/eventAlarmItem.vue';
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import noData from '@/components/businessPanel/public/noData.vue'
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import { storeArea } from "@/piniaStore/area"
import { ModelValueItf } from '../public/types'
import { AlarmAreaTop } from '@/api/models/alarm'
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { statisticsAreaTop } from '@/api/alarm'
import { storeMenu } from "@/piniaStore/menu"
import { getDeviceBuyArea, getDeviceNumber,byTagProperties } from '@/api/device'
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import {UeClient} from "@ghcloud/cube-visual-sdk";
import { cubeDeviceCenterService } from '@/api/service'
import { setDeviceData } from '@/utils/common'
import { alarmrecords, recordStatus } from "@/api/alarm";
import bus from "@/utils/bus";
import moment from 'moment'

const ueClient = UeClient.getInstance();

const piniaStoreMenu = storeMenu();
let timer: any = ref(null)
interface AlarmHandlType {
    list: AlarmAreaTop[]
}
const piniaStoreArea = storeArea();
const twoCardList = ref([])
const carousel = ref(0)
const parameter = reactive({
  areaIds:'',
  filterAlarmStatus:'',
  alarmStatus:'',
  dateRange:[]
})
let timeTypes = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const deviceParameter = reactive({
  areaId:'',
  tagCodes:[],
  deviceState:undefined,
  dateRange:[],
})
const deviceAllParameter = reactive({
  areaId:'',
  tagCodes:[],
  filterAreaIds:[],
  deviceState:undefined,
  dateRange:[],
})
//燃气浓度监测=================================================================================================
const alarmModalShow = ref<boolean>(false);
const cardList=ref([])
const deviceModalShow = ref<boolean>(false);
const deviceAllModalShow = ref<boolean>(false);
const listData = ref([]);
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const deviceStatisticsRecord = reactive({
  title: "报警数",
  total: 48,
  itemize: [
    {
      name: "已处理数",
      label: "未处理数",
      value: 23,
      offline: 15,
      key: "OFFLINE",
    },
  ],
});
const alarmEventTop =async () => {
 const res = await byTagProperties({tagCode:'builtin.usage::combustible_gas_monitoring.device',iotPropertyCodes:['ppm']})
 cardList.value = []
 res.forEach(item=>{
    item.iotProperties.forEach(iot=>{
      cardList.value.push({label:item.deviceName,value:iot.originalValue,unit:'v%',id:item.id}) 
    })
  })
  twoCardList.value = []
//  数据切割为4个的二维数组
  const chunkSize = 4;
  for (let i = 0; i < cardList.value.length; i += chunkSize) {
    const chunk = cardList.value.slice(i, i + chunkSize);
    while (chunk.length < chunkSize) {
        const remaining = chunkSize - chunk.length;
        const additionalElements = cardList.value.slice(0, remaining);
        chunk.push(...additionalElements);
    }
    twoCardList.value.push(chunk);
}
timer.value = setInterval(() => {
    if (carousel.value == twoCardList.value.length - 1) {
        carousel.value = 0
    }else{
        carousel.value++
    }
 }, 1000 * 60);
}
//报警区域TOP5=================================================================================================
let handleTime = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
})
const alarmRank = reactive<AlarmHandlType>({
    list: []
})
const clickRow = async(value)=>{
  const res = await cubeDeviceCenterService.getDeviceInstanceDetail({deviceId:value.id})
    ueClient.send('focusActor', {id: res.baseArchivesInfo.code});
    ueClient.send("showShell", { id: res.baseArchivesInfo.code});
}
// 报警处理排名
function changeHandleTime() {
    getAlarmHandlTop()
}
const closeModal=()=>{
  alarmModalShow.value=false;
}
async function getAlarmHandlTop() {
    let params = {
        sceneType: piniaStoreMenu.currentMenu,
        areaId: piniaStoreArea.currentAreaId,
        period: handleTime.value.dateRange.join(','),
        type: handleTime.value.timeType,
    }
    alarmRank.list = await statisticsAreaTop(params)
 
}
const  changeEventTime = async ()=> {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: timeTypes.value.dateRange.join(","),
    type: timeTypes.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  let res: any = await alarmrecords(params);
  let data = await recordStatus(params);
  deviceStatisticsRecord.total = data.alarmNum;
  deviceStatisticsRecord.itemize = [
    {
      name: "未处理数",
      label: "已处理数",
      value: data.alarmHandlerNum,
      offline: data.alarmUnresolvedHandlerNum,
      key: "OFFLINE",
    },
  ];

  listData.value = res.records.map((item) => {
    return {
      ...item,
      alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
    };
  });
}
const handelClickItemize = (value)=>{
  parameter.areaIds = ""
  if(value === '未处理数'){
    parameter.alarmStatus = undefined
    parameter.filterAlarmStatus = ['ALARM_HANDLER'].toString()
  }else if (value === '已处理数') {
    parameter.alarmStatus = 'ALARM_HANDLER'
  }else{
    parameter.alarmStatus = undefined
  }
  parameter.dateRange = timeTypes.value.dateRange
  alarmModalShow.value = true
}
const openAlarmModal = (item) => {
  if (window.config.entry === 'views') {
    bus.emit("setOpenAlarmModal", {...item,hidePanel:true});
  }else{
  bus.emit("openAlarmModal", item);
  }
};
onMounted(() => {
  getAlarmHandlTop()
  deviceByArea()
  getDeviceNum()
  alarmEventTop()
})
onBeforeUnmount(() => {
    clearInterval(timer.value)
})
//用气设备=================================================================================================
const alarmTotal = ref(0)
const equipmentStatisticsData= reactive({
  title: "设备总数",
  total: 48,
  itemize: [
    {
      name: "离线设备数",
      label: "在线设备数",
      value: 23,
      offline: 15,
      key: "OFFLINE1",
    }
  ],
});
const detectionData = ref([])
const colorList=['#2AE8BD',"#FFC700", "#3590FF", "#19F8F7", "#EF424A",'#c4ceda','#8c8f96'];
const handleClickItem=(item:AlarmAreaTop)=>{
  parameter.areaIds=item.id
  parameter.filterAlarmStatus=''
  parameter.dateRange=[]
  parameter.alarmStatus=''
  alarmModalShow.value=true
}
const deviceByArea=async()=>{
  let data = await getDeviceBuyArea({
    tagCodes: [`custom.app::visual.${piniaStoreMenu.currentMenu}`],
    areaLevel: piniaStoreArea.currentAreaLeave+1,
  });
  detectionData.value = setDeviceData(data,colorList)
}
const getDeviceNum=async()=>{
  const data =await getDeviceNumber({tagCodes:`custom.app::visual.${piniaStoreMenu.currentMenu}`})
  alarmTotal.value=data.totalNumber
  equipmentStatisticsData.total=data.totalNumber
  equipmentStatisticsData.itemize[0].value=data.normalNumber
  equipmentStatisticsData.itemize[0].offline=data.offlineNumber
}
const handleClickPie=async (value)=>{
  const {name}=value
  if (name === '其他') {
    deviceParameter.areaId = undefined
    deviceAllParameter.filterAreaIds = detectionData.value.map(e=>e.areaId)
    deviceModalShow.value=true
  }else{
    deviceAllParameter.filterAreaIds = []
    const findItem=detectionData.value.find(res=>res.name===name)
    if(findItem){
      deviceParameter.areaId=findItem.id;
      deviceModalShow.value=true
    }
  }
}
const deviceClickItemize = (value)=>{
  if (value === '在线设备数') {
    deviceAllParameter.deviceState = true
  }else if(value === '离线设备数'){
    deviceAllParameter.deviceState = false
  }else{
    deviceAllParameter.deviceState = undefined
  }
  deviceAllParameter.tagCodes =  [`custom.app::visual.${piniaStoreMenu.currentMenu}`]
  deviceAllParameter.areaId = piniaStoreArea.currentAreaId
  deviceAllModalShow.value = true;
}
</script>
<style lang="less" scoped>
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

.monitorCard {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  height: 150px;
  overflow-y: auto;

  .cardItem {
    display: flex;
    cursor: pointer;
    padding: 6px;
    min-width: 158px;
    height: 48px;
    background: rgba(0, 0, 0, 0.05) linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.35) 100%);

    img {
      margin-right: 5px;
    }

    .label {
      width: 108px;
      height: 20px;
      font-size: 12px;
      font-weight: 500;
      color: #CAD9EE;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap
    }

    .value {
      font-size: 14px;
      font-family: DIN Alternate, DIN Alternate;
      font-weight: 500;
      color: #FFFFFF;
    }

    .unit {
      font-size: 12px;
      font-family: DIN Alternate, DIN Alternate;
      font-weight: 500;
      color: #CAD9EE;
    }
  }
}
</style>