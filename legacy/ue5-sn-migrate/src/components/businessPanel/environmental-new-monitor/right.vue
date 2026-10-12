<template>
    <div class="panel">
        <SubPanelTemplate title="报警区域TOP5">
            <template #extra>
                <DateInlineForm v-model:modelValue="handleTime" @search="changeHandleTime"></DateInlineForm>
            </template>
            <div class="body" style="min-height: 250px;cursor: pointer;" v-show="alarmRank.list.length > 0">
                <EventAlarmItem @click="alarmOpen(item)" v-for="(item, index) in alarmRank.list" :key="item.id" :sort="index + 1" :name="item.name"
                    :linkRatio="item.chainRatio" :count="item.alarmNum" :ratio="item.ratio + '%'" />
            </div>
            <div class="body" style="min-height: 150px;" v-show="alarmRank.list.length <= 0">
                <noData></noData>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="UPS工作情况" class="alarm-event">
            <div class="ups-title">剩余工作时间</div>
            <work-situation @handlecurrent="handlecurrentUps" :contentList="twoUpsData[carousel]" v-show="twoUpsData[carousel]?.length"></work-situation>
            <noData v-show="!twoUpsData[carousel]?.length"></noData> 
        </SubPanelTemplate>
        <SubPanelTemplate title="动环设备" class="alarm-event">
            <DeviceStatistics @handelClickItemize="deviceOpen" imgPath="overView16.png" :statistic="deviceStatisticsData">
            </DeviceStatistics>
            <div class="elevator-analysis">
                <div class="chart">
                    <elevator-analysis-pie  @clickbar="alarmRegion" :pieData="detectionData">
                        <div style="color: #fff;text-align: center;font-size: 0.072rem;">{{ alarmTotal }}</div>
                        <div style="color: #fff;text-align: center;font-size: 0.072rem;">设备总数</div>
                    </elevator-analysis-pie>
                </div>
                <elevatorAnalysisList @handlecurrent="alarmRegion" :showRatio="false" :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
            </div>
        </SubPanelTemplate>
    </div>
  <modal-alarm-table  :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
  <modal-equipmentAll-table :show-modal="deviceModalShow" @close="deviceModalShow = false"
      :parameter="deviceParameter"></modal-equipmentAll-table>
</template>
<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import DateInlineForm from '../public/dateInlineForm.vue';
import DeviceStatistics from "../security-monitoring-safty/device-statistics.vue";
import EventAlarmItem from '../public/eventAlarmItem.vue';
import WorkSituation from './components/work-situation.vue';
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import noData from '@/components/businessPanel/public/noData.vue'
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { ModelValueItf } from '../public/types'
import { AlarmAreaTop } from '@/api/models/alarm'
import { statisticsAreaTop } from '@/api/alarm'
import { storeMenu } from "@/piniaStore/menu"
import { storeArea } from '@/piniaStore/area'
import { byTagProperties, getDeviceBuyArea, getDeviceNumber } from '@/api/device'
import { cubeDeviceCenterService } from '@/api/service'
import {UeClient} from "@ghcloud/cube-visual-sdk";
import { setDeviceData } from '@/utils/common'
import { setSpecialCamera } from '@/views';
const ueClient = UeClient.getInstance();
const piniaStoreArea = storeArea();
const piniaStoreMenu = storeMenu();
interface AlarmHandlType {
    list: AlarmAreaTop[]
}
const alarmTotal = ref(0)
const upsData = ref([])
const parameter = reactive({
  areaIds:'',
  dateRange:[],
})
const deviceParameter = reactive({
  areaId:'',
  status:'',
  filterAreaIds:[],
  tagCodes:[`custom.app::visual.${piniaStoreMenu.currentMenu}`],
  dateRange:[],
})
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
let timer: any = ref(null)
const alarmModalShow = ref<boolean>(false);
const deviceModalShow = ref<boolean>(false);
const detectionData = ref([])
const closeModal = () => {
  alarmModalShow.value = false;
};
let handleTime = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
})
let colorList = ['#328BF7', '#19F8F7', '#FFC700', '#EF424A']

const twoUpsData = ref([])
const carousel = ref(0)
const getUpsData = async () => {
  const res = await byTagProperties({tagCode:'builtin.usage::ups',iotPropertyCodes:['bat_time']})
  upsData.value = []
  res.forEach(item=>{
    item.iotProperties.forEach(iot=>{
        upsData.value.push({name:item.deviceName,value:iot.name +':' + (iot.originalValue?(iot.originalValue/3600).toFixed(2) :0)+'时',id:item.id}) 
    })
  })
  twoUpsData.value = []
//  数据切割为4个的二维数组
  const chunkSize = 4;
  for (let i = 0; i < upsData.value.length; i += chunkSize) {
    const chunk = upsData.value.slice(i, i + chunkSize);
    while (chunk.length < chunkSize) {
        const remaining = chunkSize - chunk.length;
        const additionalElements = upsData.value.slice(0, remaining);
        chunk.push(...additionalElements);
    }
    twoUpsData.value.push(chunk);
}
timer.value = setInterval(() => {
    if (carousel.value == twoUpsData.value.length - 1) {
        carousel.value = 0
    }else{
        carousel.value++
    }
 }, 1000 * 60);
}
const alarmRank = reactive<AlarmHandlType>({
    list: []
})

watch(() => piniaStoreArea.currentAreaId, () => {
    init()
})

// 报警处理排名
const changeHandleTime = async ()=> {
    let params = {
        sceneType: piniaStoreMenu.currentMenu,
        areaId: piniaStoreArea.currentAreaId,
        period: handleTime.value.dateRange.join(','),
        type: handleTime.value.timeType,
        areaLevel:piniaStoreArea.currentAreaLeave
    }
    alarmRank.list = await statisticsAreaTop(params)
}
const alarmOpen = (value)=>{
    parameter.areaIds = value.id
    parameter.dateRange = handleTime.value.dateRange
    alarmModalShow.value = true
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
const alarmEventTop =async () => {
    const data =await getDeviceNumber({tagCodes:`custom.app::visual.${piniaStoreMenu.currentMenu}`,areaId:piniaStoreArea.currentAreaId})
    deviceStatisticsData.total = data.totalNumber
    deviceStatisticsData.itemize[0].value = data.offlineNumber
    deviceStatisticsData.itemize[0].offline = data.normalNumber
    const res = await getDeviceBuyArea({
        tagCodes: [`custom.app::visual.${piniaStoreMenu.currentMenu}`],
        areaLevel: piniaStoreArea.currentAreaLeave+1,
    });
    alarmTotal.value = 0
    detectionData.value = setDeviceData(res,colorList)
    detectionData.value.forEach(item=>{
        alarmTotal.value += item.value
    })
}
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
const handlecurrentUps =async (value) => {
    const res = await cubeDeviceCenterService.getDeviceInstanceDetail({deviceId:value.id})
    setSpecialCamera(res.productInfo.productCategory.name,res.baseArchivesInfo.code)
}
function init() {
    getUpsData()
    alarmEventTop()
}
onMounted(() => {
        init()
})
onBeforeUnmount(() => {
    clearInterval(timer.value)
})
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
.ups-title{
    font-size: 14px;
color: #CAD9EE;
}
</style>