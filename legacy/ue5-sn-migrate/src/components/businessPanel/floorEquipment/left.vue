<template>
  <div class="panel">
    <SubPanelTemplate title="设备数据" class="device_panel">
      <div class="search flex-between">
        <a-select placeholder="设备状态" ref="select" v-model:value="deviceQuery.status" style="width: 40%"
          @change="getData">
          <a-select-option value="NORMAL">在线</a-select-option>
          <a-select-option value="OFFLINE">离线</a-select-option>
        </a-select>
        <a-input-search enter-button v-model:value="deviceQuery.keyword" placeholder="按设备名称搜索"
          style="width: 55%;margin-left: 4px;" @search="getData" />
      </div>
      <div class="device_list">
        <div class="header flex-between">
          <div class="table-th" v-for="(td, index) in column" :key="index" :style="styleItem(td)">
            <a-checkbox @change.stop="allChangeCheck" v-model:checked="allChecked" style="color: #fff;"
              v-if="td.dataIndex === 'name'">
              {{td.title }}</a-checkbox>
            <span v-else>
              {{ td.title }}
            </span>
          </div>
        </div>
        <div class="device_item">
          <template v-for="(tr, index) in tableData" :key="tr?.key || index">
            <div class="table-tr flex-between" @click="clickTableRow(tr)">
              <div class="table-td" v-for="(td, j) in column" :key="index + '_' + j" :style="styleItem(td)">
                <template v-if="td.dataIndex === 'status'">
                  <span v-show="tr[td.dataIndex] === 'NORMAL'" style="color: #58FAB6;">在线</span>
                  <span v-show="tr[td.dataIndex] === 'OFFLINE'" style="color: #D9E7FF;">离线</span>
                </template>
                <div v-else-if="td.dataIndex === 'name'" class="flex-between">
                  <a-checkbox @change.stop="changeCheck" v-model:checked="tr.checked" style="color: #fff;"
                    v-if="tr.isCheck">
                    {{tr[td.dataIndex] }}</a-checkbox>
                  <span v-else style="margin-left: 20px;">{{tr[td.dataIndex] }}</span>
                </div>
                <span v-else>{{tr[td.dataIndex] }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <a-pagination class="pagination" @change="getData" v-model:current="deviceQuery.pageNumber"
        v-model:pageSize="deviceQuery.pageSize" :total="deviceQuery.total" show-less-items />
    </SubPanelTemplate>

    <div class="alarmDetail-wrap" v-show="modal.visible">
      <div class="alarmDetail-modal">
        <div class="alarmDetail-modal-header">
          <div class="header-title">{{ modal.name }}</div>
          <div class="header-operate">
            <div class="header-close" @click="backModal">
              <RollbackOutlined />
            </div>
            <div class="header-close" @click="closeModal">
              <CloseOutlined />
            </div>
          </div>
        </div>
        <div class="alarmDetail-modal-content flex-column">
          <div class="conent-body">
            <div>
              <span style="margin-right: 10px;">{{ modal.code }}</span>
              <span v-show="modal.status === 'NORMAL'" style="color: #58FAB6;">在线</span>
              <span v-show="modal.status === 'OFFLINE'" style="color: #D9E7FF;">离线</span>
            </div>
            <div>{{ modal.areaName }}</div>
            <div class="details" @click="details(modal)">详情>></div>
          </div>
        </div>
      </div>
    </div>
    <MonitorGridsModal v-model:visible="visible" :cameraList="cameraList"/>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, computed, onBeforeUnmount} from 'vue'
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import { getDeviceListBuyScene } from '@/api/device'
import { storeArea } from '@/piniaStore/area'
import {UeClient} from "@ghcloud/cube-visual-sdk";
import { DeviceTypeIcon, DeviceStatusCode } from "@/utils/enumeratie"
import bus from '@/utils/bus'
import { cubeDeviceCenterService } from '@/api/service'
import { storeMarket } from "@/piniaStore/other";
import {
  CloseOutlined,
  RollbackOutlined
} from '@ant-design/icons-vue';
import { getAlarmDetail } from '@/api/alarm'
import { sceneTypePage } from '@/api/mdata'
import { riskSceneStall } from '@/api/property'
import MonitorGridsModal from "@/components/monitor-grids-modal/monitor-grids-modal.vue";

const emit = defineEmits(["openDevicePanelEmit"]);
const ueClient = UeClient.getInstance();
const piniaStoreArea = storeArea();
const piniaStoreMarket = storeMarket();
const cancelButtonProps = {
        style: 'display: none',
      }
const deviceQuery = reactive({
  status:null,
  keyword:'',
  pageSize: 20,
  pageNumber: 1,
  total: 0,
})
const isFullScreen = ref(false)
const allChecked = ref(false)
const cameraList = ref([])
const visible = ref(false)
const alarmDeviceType = ref("")
const styleItem = computed(() => (item) => {
  let style = {};
  if (item?.width) {
    style = { ...style, width: item.width + "px" };
  }
  if (item?.align) {
    style = { ...style, textAlign: item.align };
  }
  return style;
});
const column = [
{
    title:'设备名称',
    dataIndex:'name',
    width:250,
  },
  {
    title:'状态',
    dataIndex:'status',
    width:50,
  },
  // {
  //   title:'操作',
  //   dataIndex:'operate',
  //   width:110,
  // },
]
const columnNum = computed(() => {
  return 100 / column.length;
});
const tableData = ref([])
const getData = async () => {
  ueClient.send('removePoiByType', {
    type: 'icon'     
  });
  let res = await sceneTypePage();
  res = res.filter(e=>{
    return e.name === '总览'
  })
  let query = {
      sceneType:res[0].id,
      areaId:piniaStoreArea.currentAreaId,
      pageNumber:deviceQuery.pageNumber,
      pageSize:deviceQuery.pageSize,
      status:deviceQuery.status,
      keyword:deviceQuery.keyword,
   }

  const DEVICE = await getDeviceListBuyScene(query)
  const risk =	await riskSceneStall(query)
  piniaStoreMarket.alarmDeviceRisk = [{label:'设备',value:'device'}]
  DEVICE.records.forEach(e=>e.type='device')
  let arr =[]
  risk.records = risk.records.filter(e=>{
    e.type='risk'
    arr.push({label:e.typeName.split("/")[e.typeName.split("/").length-1],value:e.typeCode})
    if(alarmDeviceType.value && alarmDeviceType.value !== 'device' ){
      return e.typeCode === alarmDeviceType.value
    }else {
      return e
    }
  })
   arr = arr.filter((item, index, self) =>
    index === self.findIndex((t) => (
      t.label === item.label 
    ))
  );
  piniaStoreMarket.alarmDeviceRisk.push(...arr)
  if (!alarmDeviceType.value) {
    tableData.value = [...DEVICE.records,...risk.records]
    deviceQuery.total = DEVICE.total + risk.total
  }else if(alarmDeviceType.value === 'device'){
    tableData.value = DEVICE.records
    deviceQuery.total = DEVICE.total
  }else{
    tableData.value = risk.records
    deviceQuery.total = risk.total
  }
  tableData.value.forEach(e=>{
    e.status = e?.status?.onlineState?'NORMAL':'OFFLINE'
    e.productName = e?.product?.name?e?.product?.name:e.typeName
    e.checked = false
    if (e?.prodCategory?.name?.includes('摄像')) {
      e.isCheck = true
    }else{
      e.isCheck = false
    }
  })
  tableData.value.forEach((async e=>{
    if (e.isCheck) {
     const data = await cubeDeviceCenterService.getDeviceInstanceDetail({deviceId:e.id})
     e.token = data.baseArchivesInfo.thirdPartyId
    }
  }))
  tableData.value = tableData.value.sort((a, b) => {
    if (a.isCheck && !b.isCheck) {
      return -1;
    } else if (!a.isCheck && b.isCheck) {
      return 1;
    } else {
      return 0;
    }
  });
  
 if (DEVICE.records.length && (alarmDeviceType.value === '' || alarmDeviceType.value === 'device')) {
		const deviceListPio = DEVICE.records.map((item: {typeName:string; area:{key:string}; code: any; genreName: string | number; status: any; id: any; genreId: any;product:{modelName:string} })=>{
		item.code = item.code.trim()
		if (piniaStoreArea.currentAreaId === item?.area.key) {
			return {
				targetActorId: item.code,
				icon: DeviceTypeIcon[item.prodCategory.name],
				color: DeviceStatusCode[item?.status],
				scale: window.config?.iconScale?window.config.iconScale:1,
				props: {
					iconType: 'device',
					actorId:item.code,
					id: item.id,
					code: item.code,
					genreId: item.genreId,
					deviceData : item
				}
			}
		}
		})
  ueClient.send("addIconPoiBatch", { pois: deviceListPio.filter(item=>item) })
	}

  if (risk.records.length && alarmDeviceType.value !== 'device') {
    const deviceListPio = risk.records.map((item)=>{
		item.bimCode = item.bimCode.trim()
		if (piniaStoreArea.currentAreaId === item?.areaId.split(",")[item?.areaId.split(",").length-1]) {
			return {
				targetActorId: item.bimCode,
				icon: DeviceTypeIcon[item.typeName.split("/")[item.typeName.split("/").length-1] ],
				color: 0,
				scale: window.config?.iconScale?window.config.iconScale:1,
				props: {
					iconType: 'risk_source',
					actorId:item.bimCode,
					id: item.riskSourceId,
					code: item.bimCode,
					genreId: item.bimCode,
				}
			}
		}
		})
   
  ueClient.send("addIconPoiBatch", { pois: deviceListPio.filter(item=>item) })
  }
  }
  const allChangeCheck = ()=>{
      tableData.value.forEach(e=>{
        if (e.isCheck && allChecked.value) {
          e.checked = true
        }else if(e.isCheck && !allChecked.value){
          e.checked = false
        }
      })
    changeCheck()
  }
const changeCheck = ()=>{
  backModal()
  const arr = tableData.value.filter(e=>{
    return e.isCheck && e.checked
  })
  if(arr.length === tableData.value.filter(e=>e.isCheck).length){
    allChecked.value = true
  }else{
    allChecked.value = false
  }
  if (arr.length>9) {
    cameraList.value = arr.slice(arr.length - 9)
  }else{
    cameraList.value = arr
  }
  
  if (cameraList.value.length) {
    visible.value = true
  }else{
    visible.value = false
  }
}
const modal = reactive({
  visible:false,
  name:'设备名称',
  status:'NORMAL',
  code:'',
  areaName:''
})
const clickTableRow = async (data)=>{
  if(data.type === 'risk'){
    bus.emit("openDevicePopup", {alarmTargetKey:data.id,modalType:'RiskDetailPanel'})
    return
  }
    if (!data.isCheck) {
    //保存当前视角
    await ueClient.saveNowViewPoint();
    Object.assign(modal,data)
    visible.value = false
    modal.visible= true
  }
}
const backModal = () => {
  modal.visible = false;
}
const closeModal = () => {
  modal.visible = false;
  ueClient.backViewPoint();
};
const details = (data)=>{
  const obj={
    alarmTargetCode:data.code,
    alarmTargetKey:data.id,
    viewLocation:true
  }
  bus.emit("openDevicePopup", obj)
  modal.visible = false
}
/** 报警设备过滤 */
bus.on("alarmDeviceFilter", (data: any): void => {
  alarmDeviceType.value = data.value.value
  getData()
});
let timer: any = reactive(null);
onMounted(()=>{
  getData()
  timer =  setInterval(async ()=>{
    const result = await getAlarmDetail(piniaStoreMarket.alarmBusinessKey)
    if (result.alarmStatusName === '已处理') {
       ueClient.send('removeEffectAll');
       clearInterval(timer);
    }
  },5000)
})
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.device_list {
  margin-top: 10px;

  .header {
    padding: 0 10px;
    width: 100%;
    height: 30px;
    color: #ffffff;
    font-size: 14px;
    background: rgba(97, 148, 247, 0.20) // border: 1px solid rgba(86, 142, 255, 0.3);
  }
}

.device_item {
  cursor: pointer;
}

.table-tr {
  padding: 0 10px;
  background: rgb(83 82 82 / 15%);
  height: 35px;
  font-size: 12px;
  color: #d9e7ff;
  cursor: pointer;


  &:nth-child(2n) {
    background: transparent;
  }
}

.table-th,
.table-td {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(v-bind(columnNum) * 1%);
}

.device_panel {
  position: relative;
  height: 900px;

  .pagination {
    position: absolute;
    bottom: 0;
    right: 0;
  }
}


.alarmDetail-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -10;
}

.alarmDetail-modal {
  width: 200px;
  position: fixed;
  top: 40%;
  left: 50%;
  z-index: 99999999;
  transform: translate(-50%, -50%);
  background: transparent;
  border-bottom: 2px solid rgba(41, 137, 255, 1);

  &.full {
    width: 100%;
    height: 100%;
  }

  .alarmDetail-modal-header {
    height: 26px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid rgba(41, 137, 255, 1);
    background-image: url('/resource/v1/ue5-sn-migrate/assets/images/modal-title.png');
    background-size: 100%95%;
    background-repeat: no-repeat;

    .header-title {
      font-size: 14px;
      font-weight: 400;
      width: 100px;
      color: #FFFFFF;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

    }

    .header-operate {
      display: flex;
      font-size: 13px;

      .header-close {
        width: 24px;
        height: 24px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
    }
  }

  .alarmDetail-modal-content {
    max-height: 91px;
    width: 100%;
    padding: 0 16px;
    padding-bottom: 20px;
    overflow: hidden;
    background: rgba(1, 11, 23, 0.78);
    margin-top: 2px;

    .conent-body {
      min-height: 91px;
      font-size: 12px;
      color: #FFFFFF;
      line-height: 30px;

      :deep(.box .content) {
        margin-top: 15%;
      }

      .details {
        color: #2989FF;
        cursor: pointer;
      }
    }
  }
}
</style>

