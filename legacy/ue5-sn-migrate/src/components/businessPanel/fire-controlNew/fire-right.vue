<template>
  <div class="panel">
    <SubPanelTemplate title="消防管网监测">
      <DeviceStatistics imgPath="93-icon.png" :statistic="equipmentStatistics"></DeviceStatistics>
      <div class="monitorCard">
        <div class="cardItem" @click="handlecurrentUps(item)" v-for="item in  twoCardList[carousel]">
          <img :src="getAssetsImage('92-icon.png')" alt="" width="32" height="32">
          <div>
            <div class="label">{{ item.label }}</div>
            <div class="value"><span>{{ item.value }}</span><span class="unit">{{ item.unit }}</span></div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="消防设备分布情况" class="alarm-event">
      <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="business-icon/triage-queue/12.png" :statistic="deviceStatusData">
      </DeviceStatistics>
      <div class="chart">
        <elevator-analysis-pie @clickbar="handleClickPie" style="width: 50%" :pieData="pieData" :radius="'75'">
          <div style="color: #fff; text-align: center; font-size: 14px">
            {{ deviceStatusData.total }}
          </div>
          <div style="color: #fff; text-align: center; font-size: 12px">设备总数</div>
        </elevator-analysis-pie>
        <elevatorAnalysisList @handlecurrent="handleClickPie" :contentList="pieData" style="width: 50%;">
        </elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警列表" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmRecordTime" @search="changeAlarmRecordDate"></DateInlineForm>
      </template>
      <div v-show="listData.length > 0">
        <DeviceStatistics 
        @handelClickItemize="alarmClickItemize" 
        imgPath="business-icon/triage-queue/10.png" :statistic="deviceStatisticsData">
        </DeviceStatistics>
        <div class="footer">
          <RollTable :column="column" :data="listData" @click-row="handelClickRow">
            <template #alarmStatus="{ record }">
              <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
              <span v-else-if="record.alarmStatus  === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
              <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
            </template>
          </RollTable>
        </div>
      </div>
      <div v-show="listData.length === 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
    <modal-equipmentAll-table :show-modal="deviceModalShow" @close="deviceModalShow = false"
      :parameter="deviceParameter"></modal-equipmentAll-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, onBeforeUnmount} from 'vue'
import noData from '@/components/businessPanel/public/noData.vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DeviceStatistics from "../security-monitoring-safty/device-statistics.vue"
import RollTable from "../public/rollTable/index.vue";
import { getAssetsImage } from "@/utils/getImage";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import modalEquipmentTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import bus from '@/utils/bus'
import useCommon from '@/components/hooks/useCommon'
import { ModelValueItf } from '../public/types'
import {alarmrecords,recordStatus} from '@/api/alarm'
import { byTagProperties, getDeviceBuyArea, getDeviceNumber } from '@/api/device'
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import moment from 'moment'
import { cubeDeviceCenterService } from '@/api/service';
import {UeClient} from "@ghcloud/cube-visual-sdk";
import { getPropertyByOptType } from '@/api/property';
import { setDeviceData } from '@/utils/common'
import { setSpecialCamera } from '@/views';
const ueClient = UeClient.getInstance();
const {
  piniaStoreArea,
  piniaStoreMenu,
  getEquipmentNumber,
} = useCommon();
const cardList=ref([])
const twoCardList = ref([])
const assetModalShow = ref<boolean>(false);
const carousel = ref(0)
const assetParameter = ref<Record<string, any>>({
  status: "",
  typeId: "",
  anyAreaId:'',
  filterAreaIds:[]
});
const alarmRecordTime=ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
})
const  equipmentStatistics = reactive({
  title: "监测数",
  total: 0,
});
const listData = ref([]);
const pieData = ref([]);
const alarmModalShow = ref<boolean>(false);
const deviceModalShow = ref<boolean>(false);
let timer: any = ref(null)
const parameter = reactive({
  areaIds:'',
  alarmStatus:'',
  dateRange:[],
})
const deviceParameter = reactive({
  anyAreaId:'',
  deviceState:undefined,
  filterAreaIds:[],
  tagCodes:[`custom.app::visual.${piniaStoreMenu.currentMenu}`],
  dateRange:[],
})
const deviceStatisticsData = reactive({
  title: "报警总数",
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

const deviceStatusData=reactive({
  title: "设备数",
  total: 48,
  itemize: [
    {
      name: "离线",
      label: "在线",
      value: 23,
      offline: 15,
      key: "OFFLINE",
    },
  ],
})
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
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
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const getAlarmRecords=async ()=>{
  const params={
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: alarmRecordTime.value.dateRange.join(","),
    type: alarmRecordTime.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  }
  const data=await alarmrecords(params)
  listData.value=data.records.map(item=>{
    return {
      ...item,
      alarmTime:moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
    }
  })
  
}
const getAlarmStatus=async ()=>{
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: alarmRecordTime.value.dateRange.join(","),
    type: alarmRecordTime.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  const res = await recordStatus(params)
  deviceStatisticsData.total=res.alarmNum
  deviceStatisticsData.itemize[0].offline=res.alarmHandlerNum
  deviceStatisticsData.itemize[0].value=res.alarmUnresolvedHandlerNum
}
const changeAlarmRecordDate = ()=>{
  getAlarmRecords()
  getAlarmStatus()
}
const changeDate = async () => {
 const res1 = await byTagProperties({tagCode:'builtin.usage::liquid.level.sensors',iotPropertyCodes:['hydraulics']})
 const res2 = await byTagProperties({tagCode:'builtin.usage::fire.water_pressure.device',iotPropertyCodes:['pressure']})
const res=[...res1,...res2]
 equipmentStatistics.total = res.length ? res.length: 0
 cardList.value = []
 res.forEach(item=>{
    item.iotProperties.forEach(iot=>{
      cardList.value.push({label:item.deviceName,value:iot.originalValue||0,unit:'',id:item.id}) 
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
const handlecurrentUps =async (value) => {
  const res = await cubeDeviceCenterService.getDeviceInstanceDetail({deviceId:value.id})
  setSpecialCamera(res.productInfo.productCategory.name,res.baseArchivesInfo.code)
}
const alarmClickItemize = (value)=>{
  if(value === '未处理数'){
    parameter.alarmStatus = 'ALARM_UN_CONFIRMED'
  }else if (value === '已处理数') {
    parameter.alarmStatus = 'ALARM_HANDLER'
  }else{
    parameter.alarmStatus = undefined
  }
  parameter.dateRange = alarmRecordTime.value.dateRange
  alarmModalShow.value = true
}
const closeModal=()=>{
  alarmModalShow.value=false;
}
const handelClickRow = (record) => {
  if (window.config.entry === 'views') {
    bus.emit("setOpenAlarmModal", {...record,hidePanel:true});
  }else{
  bus.emit("openAlarmModal", record);
  }
};
const getDeviceDistribution = async () => {
  const res =await getDeviceNumber({tagCodes:`custom.app::visual.${piniaStoreMenu.currentMenu}`})
  deviceStatusData.total=res.totalNumber
  deviceStatusData.itemize[0].value=res.normalNumber
  deviceStatusData.itemize[0].offline=res.offlineNumber
  const data=await getDeviceBuyArea({
    tagCodes:[`custom.app::visual.${piniaStoreMenu.currentMenu}`],
    areaLevel:piniaStoreArea.currentAreaLeave,
  })
  pieData.value = setDeviceData(data,colors)
};
const handelClickItemize = (value)=>{
  if (value === '离线') {
    deviceParameter.deviceState = false
  }else if (value === '在线') {
    deviceParameter.deviceState = true
  }else{
    deviceParameter.deviceState = undefined
  }
  deviceParameter.anyAreaId=piniaStoreArea.currentAreaId
  deviceModalShow.value=true;
}
const handleClickPie=async (value)=>{
  const {name}=value
  if (value.name === '其他') {
    deviceParameter.anyAreaId = undefined
    deviceParameter.filterAreaIds = pieData.value.map(e=>e.areaId)
    deviceModalShow.value=true
  }else{
    deviceParameter.filterAreaIds = []
    const findItem=pieData.value.find(res=>res.name===name)
    if(findItem){
      deviceParameter.anyAreaId = findItem.areaId
      deviceModalShow.value=true
    }
  }
}
onMounted(()=>{
  getDeviceDistribution()
  changeDate()
  })
  onBeforeUnmount(() => {
    clearInterval(timer.value)
})
</script>
<style lang="less" scoped>
.point_list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .point_item {
    margin: 0 6px 16px 0;
    background: rgba(0, 0, 0, 0.05) linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.35) 100%);
    display: flex;
    width: 108px;
    height: 48px;
    justify-content: space-around;
    padding: 5px 0;

    img {
      width: 16px;
      height: 16px;
    }

    .point_item_right {

      .point_item_name {
        font-size: 12px;
        color: #CAD9EE;
      }

      .point_item_conte {
        font-size: 14px;
        font-weight: 700;
        color: #FFFFFF;

        .unit {
          font-size: 12px;
          font-weight: 500;
          color: #CAD9EE;
        }
      }

    }
  }
}

.chart {
  height: 150px;
  display: flex;
  align-items: center;
}

.monitorCard {
  display: flex;
  flex-wrap: wrap;
  height: 100px;
  overflow-y: auto;
  .cardItem {
    margin-right: 4px;
    display: flex;
    padding: 6px;
    min-width: 158px;
    // height: 48px;
    background: rgba(0, 0, 0, 0.05) linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.35) 100%);

    img {
      margin-right: 5px;
    }

    .label {
      width: 78px;
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
.alarm-analysis{
  height: 150px;
}
</style>