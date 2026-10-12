<template>
  <div class="panel">
    <SubPanelTemplate title="设备数据" class="device_panel">
      <div class="search flex-between">
        <a-select placeholder="设备状态" ref="select" v-model:value="deviceQuery.status" style="width: 40%"
          @change="getData">
          <a-select-option value="ONLINE">在线</a-select-option>
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
            <div class="table-tr flex-between" @click="($event)=>clickTableRow($event,tr)">
              <div class="table-td" v-for="(td, j) in column" :key="index + '_' + j" :style="styleItem(td)">
                <template v-if="td.dataIndex === 'status'">
                  <span v-show="tr[td.dataIndex] === 'NORMAL'" style="color: #58FAB6;">在线</span>
                  <span v-show="tr[td.dataIndex] === 'OFFLINE'" style="color: #D9E7FF;">离线</span>
                </template>
                <div style="color: #2989FF;" v-else-if="td.dataIndex === 'operate'" class="flex-between">
                  <div @click.stop="positioning(tr)">
                    <environment-outlined />
                    <span>定位</span>
                  </div>
                  <div @click.stop="detailsRow(tr)">
                    <profile-outlined />
                    <span>详情</span>
                  </div>
                </div>
                <div v-else-if="td.dataIndex === 'name'" class="flex-between">
                  <a-checkbox @change.stop="changeCheck(tr)" v-model:checked="tr.checked" style="color: #fff;"
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
        v-model:pageSize="deviceQuery.pageSize" :total="deviceQuery.total" show-less-items :showSizeChanger="false"/>
    </SubPanelTemplate>
    <MonitorGridsModal v-model:visible="visible" :cameraList="cameraList"/>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, computed,watch, onBeforeUnmount} from 'vue'
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import { getDeviceListBuyScene } from '@/api/device'
import { storeArea } from '@/piniaStore/area'
import { storeMenu } from '@/piniaStore/menu'
import {UeClient} from "@ghcloud/cube-visual-sdk";
import MonitorGridsModal from "@/components/monitor-grids-modal/monitor-grids-modal.vue";
import {
  EnvironmentOutlined,
  ProfileOutlined,
  CloseOutlined,
  RollbackOutlined
} from '@ant-design/icons-vue';
import bus from '@/utils/bus'
import { cubeDeviceCenterService } from '@/api/service'
import { storeMarket } from '@/piniaStore/other'
import { mediaConfig } from '@/api/mdata'
import { message } from 'ant-design-vue'
const ueClient = UeClient.getInstance();

const piniaStoreArea = storeArea();
const piniaStoreMenu = storeMenu();
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
const piniaStoreMarket = storeMarket();
const modal = reactive({
  visible:false,
  name:'设备名称',
  status:'NORMAL',
  code:'',
  areaName:''
})
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
  {
    title:'操作',
    dataIndex:'operate',
    width:110,
  },
]
const columnNum = computed(() => {
  return 100 / column.length;
});
const tableData = ref([])
const details = (data)=>{
  const obj={
    alarmTargetCode:data.code,
    alarmTargetKey:data.id,
    viewLocation:true,
    modalType:'EquipmentDetailPanel'
  }
  bus.emit("openDevicePopup", obj)
  modal.visible = false
}
const positioning = async (data)=>{
  const obj={
    alarmTargetCode:data.code,
    alarmTargetKey:data.id,
    viewLocation:true,
    modalType:'EquipmentAbbreviationsPanel'
  }
  await ueClient.saveNowViewPoint();
  ueClient.send("focusActor", { id: data.code });
  bus.emit("openDevicePopup", obj)
}
const backModal = () => {
  modal.visible = false;
}
watch(()=>piniaStoreMarket.selectDevice,()=>{
  getData()
})
const getData = async () => {
	let deviceList = []
    let query = {
        sceneType:piniaStoreMenu.currentMenu,
        areaId:piniaStoreArea.currentAreaId,
        pageNumber:deviceQuery.pageNumber,
        pageSize:deviceQuery.pageSize,
        status:deviceQuery.status,
        keyword:deviceQuery.keyword,
    }
const DEVICE = await getDeviceListBuyScene(query)
 const mediaConfigData = await mediaConfig()
 tableData.value = DEVICE.records
 tableData.value.forEach(e=>{
  e.status = e.status.onlineState?'NORMAL':'OFFLINE'
  if(piniaStoreMarket.selectDevice.id === e.id){
    e.checked = true
  }else{
    e.checked = false
  }

  if (e?.prodCategory?.name?.includes('摄像')) {
    e.isCheck = true
  }else{
    e.isCheck = false
  }
 })
 tableData.value.forEach((async e=>{
    if (e.isCheck) {
     const data =await cubeDeviceCenterService.getDeviceInstanceDetail({deviceId:e.id})
     e.token = data.baseArchivesInfo.thirdPartyId
     e.steamMediaIpAddress = mediaConfigData.ipAddress
     e.steamMediaIntranetAddress = mediaConfigData.ipAddress
    }
  }))
  changeCheck()
 deviceQuery.total = DEVICE.total
}
const detailsRow = (tr)=>{
  modal.visible=false
  const obj={
    alarmTargetCode:tr.code,
    alarmTargetKey:tr.id,
    viewLocation:true
  }
  ueClient.saveNowViewPoint();
  ueClient.send('removeActorPoi', {targetActorId: tr.code});
  bus.emit("openDevicePopup", obj)
}
const allChangeCheck = ()=>{
  let isChecked = 0
    tableData.value.forEach(e=>{
      if (e.isCheck && allChecked.value && isChecked<9) {
        e.checked = true
        isChecked++
      }else if(e.isCheck && !allChecked.value){
        e.checked = false
      }
    })
  changeCheck()
}
const changeCheck = (tr?)=>{
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
    tr.checked = false
    message.warning('最多选择9个设备')
    return
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
const clickTableRow = async (event,data)=>{
  bus.emit("closeDevicePanel")
  if(event.target.className === 'ant-checkbox-input')return
  //保存当前视角
  await ueClient.saveNowViewPoint();
  Object.assign(modal,data)
  // bus.emit("equipmentPositionEvent", {alarmTargetCode:data.code})
  modal.visible=true
}
onMounted(()=>{
  getData()
})
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
    bottom: 0px;
    right: 0;
  }
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
