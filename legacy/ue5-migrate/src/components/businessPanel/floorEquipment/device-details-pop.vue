<template>
  <div class="alarmDetail-wrap" v-show="modal.visible">
    <div class="alarmDetail-modal">
      <div class="alarmDetail-modal-header">
        <div class="header-title">{{ modal.name }}</div>
        <div class="header-operate">
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
          <div class="details-box">
            <div class="details" v-if="isPaly" @click="playEvent()">播放</div>
            <div class="details" @click="positioning(modal)">定位</div>
            <div class="details" @click="details(modal)">详情</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <EquipmentDetailPanel :activeData="activeData" v-if="showDetailPanel" :id="modal.id" @close="deviceClose"></EquipmentDetailPanel>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import bus from '@/utils/bus'
import { cubeDeviceCenterService } from "@/api/service";
import {
  CloseOutlined
} from '@ant-design/icons-vue';
import {UeClient} from "@ghcloud/cube-visual-sdk";
import EquipmentDetailPanel from "@/components/equipmentdetails/index.vue";
import { setSpecialCamera } from "@/views/index";
import { storeMarket } from '@/piniaStore/other'
import { getSecurityDevicePage } from '@/api/securitymanagement'

const piniaStoreMarket = storeMarket();
const ueClient = UeClient.getInstance();
const props = defineProps({
  id: {
    type: [String],
    default: "",
  },
});
const activeData = ref('基本信息')
const showDetailPanel = ref(false)
const modal = reactive({
  visible:false,
  name:'设备名称',
  status:'NORMAL',
  code:'',
  areaName:'',
  productInfo:'',
  id:''
})
const isPaly = ref(false)
const getSecurityDevicePagData = async()=>{
 const res = await getSecurityDevicePage('BROADCAST_CENTER',{
    pageNumber:1,
    pageSize:999
  })
  const ids = res.records.map(e=>e.deviceId)
  if (ids.includes(props.id)) {
    isPaly.value = true
  }
}
const playEvent = ()=>{
  activeData.value = '广播播放'
  showDetailPanel.value = true
}
const details = (data)=>{
  activeData.value = '基本信息'
  if (data.productInfo === '门禁') {
    bus.emit("setPanel", {
      rightPanelName:'',
      leftPanelName:'deviceDetailsPanel'
    });
    piniaStoreMarket.panelCurrentDeviceId = data.id
  }else{
    showDetailPanel.value = true
  }
  modal.visible = false
}
const closeModal = () => {
  modal.visible = false;
  ueClient.backViewPoint();
};
const deviceClose = ()=>{
  showDetailPanel.value = false
  // modal.visible = true
}
const positioning = async (data)=>{
  setSpecialCamera(data.productInfo,data.code)
}
const getData = async() => {
  const data = await cubeDeviceCenterService.getDeviceInstanceDetail({deviceId:props.id})
  modal.areaName = data.baseArchivesInfo.area?.name||'暂无'
  modal.name = data.baseArchivesInfo.name
  modal.code = data.baseArchivesInfo.code
  modal.id = data.baseArchivesInfo.id
  modal.productInfo = data.productInfo.productCategory.name
  modal.status = data.baseArchivesInfo.status.onlineState?'NORMAL':'OFFLINE'
  // modal.visible = true
  showDetailPanel.value = true
}
onMounted(()=>{
  getData()
  getSecurityDevicePagData()
})
</script>
<style lang="less" scoped>
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
  // top: 40%;
  // left: 50%;
  z-index: 99999999;
  transform: translate(-70%, 70%);
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
    background-image: url('/resource/v1/ue5-migrate/assets/images/modal-title.png');
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
    // max-height: 91px;
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
      .details-box{
        display: flex;   
        flex-direction: row-reverse;
        text-align: right;
        .details {
          color: #2989FF;
          cursor: pointer;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>