<template>
  <div class="device-details-box">
    <a-spin :spinning="spinning">
    <SubPanelTemplate title="设备信息">
      <template #extra>
        <a-button type="primary" @click="goBack">返回
          <template #icon>
            <RollbackOutlined />
          </template>
        </a-button>
      </template>
      <div class="basic-info">
        <div class="basic-info-name">{{dataInfo.baseArchivesInfo.name}}</div>
        <div class="basic-info-operate">
          <div class="basic-info-details" @click="positioning">定位</div>
          <div class="basic-info-details" @click="showMore">详情</div>
        </div>
      </div>
      <div class="basic-info-box">
        <div class="info-img">
          <a-image v-if="dataInfo.productInfo.path" width="100%" height="100%" :src="dataInfo.productInfo.path"></a-image>
          <a-image v-else width="100%" height="100%" :src="getAssetsImage('overView45.png')"></a-image>
        </div>
        <div class="basic-info-list">
          <div class="basic-info-item">
            <div class="basic-info-item-label">设备状态</div>
            <div class="basic-info-item-value" v-if="dataInfo.baseArchivesInfo.status.onlineState"
              style="color: #5ccd4d">在线
            </div>
            <div class="basic-info-item-value" v-else style="color: #fba33f">离线</div>
          </div>
          <div class="basic-info-item">
            <div class="basic-info-item-label">设备编码</div>
            <div class="basic-info-item-value">{{ dataInfo.baseArchivesInfo.code || '暂无' }}</div>
          </div>
          <div class="basic-info-item">
            <div class="basic-info-item-label">产品名称</div>
            <div class="basic-info-item-value">{{ dataInfo.productInfo.name || '暂无' }}</div>
          </div>
        </div>
      </div>

      <div class="device-grid" v-if="dataInfo?.slaveDeviceList?.length">
        <div class="device-item device-type">{{ deviceRelationship.type }}</div>
        <div class="device-item" v-for="item in dataInfo.slaveDeviceList" :key="item.id" @click="changeDeviceRelationship(item)">{{ item.name }}</div>
      </div>

      <template v-if="readData.length && !dataInfo.productInfo.productCategory.code.includes('A003')">
        <div class="title-bar">
          <div class="title-bar-left">实时数据</div>
          <img class="title-bar-right" :src="getAssetsImage('overView122.png')" alt="">
        </div>
        <div class="real-time-data">
          <div class="real-time-data-item" v-for="item in readData" :key="item.attributeCode">
            <div class="real-time-data-item-label">{{ item.attributeName }}</div>
            <div class="real-time-data-item-value">
              <template v-if="item.attributeKeyValueVos.length && item.attributeKeyValueVos[0].value">
                {{
                item.attributeKeyValueVos.find(e=>e.value===attributeValueRead[item.attributeCode])?.keyName ||
                item.attributeKeyValueVos.find(e=>e.value===attributeValueRead[item.attributeCode])?.label ||
                '--' }}
              </template>
              <template v-else>
                {{ attributeValueRead[item.attributeCode] || '--'}}{{
                attributeValueRead[item.attributeCode]?item.unitName:'' }}
              </template>
            </div>
          </div>
        </div>
      </template>
      <div class="real-time-monitoring">
        <template
          v-if="(dataInfo.productInfo.name === '监控' || deviceType <= 3 || type<=3) && dataInfo.baseArchivesInfo.thirdPartyId">
          <div class="title-bar">
            <div class="title-bar-left">实时监控</div>
            <img class="title-bar-right" :src="getAssetsImage('overView122.png')" alt="">
          </div>
          <div class="video-box" @click="()=> clickCamera(dataInfo.baseArchivesInfo)">
            <H5Video :cameraItem="{deviceId:dataInfo.baseArchivesInfo.id}"></H5Video>
          </div>
        </template>
      </div>
      <div class="real-time-monitoring">
        <div class="title-bar">
          <div class="title-bar-left">异常记录</div>
          <img class="title-bar-right" :src="getAssetsImage('overView122.png')" alt="">
        </div>
        <div class="alarm-table">
          <div class="status-bar">
            <div class="status-bar-item">
              <span><alert-outlined style="color:#F14545;font-size: 16px;margin-right: 5px;" />告警总次数: </span>
              <div>{{ total }}</div>
            </div>
            <div class="status-bar-item status-bar-right">
              <span><warning-outlined style="color:#FFA100;font-size: 16px;margin-right: 5px;" />处理中: </span>
              <div>{{ handlingNum }}</div>
            </div>
          </div>
          <RollTable :column="columns" :data="dataSource" :showLength="8"> </RollTable>
        </div>
      </div>
    </SubPanelTemplate>
    </a-spin>
  </div>

</template>

<script setup lang="ts">
import { ref,onMounted, watch, computed} from 'vue'
import {RollbackOutlined} from '@ant-design/icons-vue';
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { storeMarket } from '@/piniaStore/other'
import { cubeDeviceCenterService, cubeFileService } from "@/api/service";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import { AlarmTakeNotesList } from '@/api/models/alarm';
import { alarmStatisticsList, getstatus } from '@/api/alarm';
import RollTable from "../public/rollTable/index.vue";
import dayjs from 'dayjs';
import { iotSocketStore } from "@/piniaStore/iotSocketStore";
import { DeviceTypeIcon } from '@/utils/enumeratie'
import { getAssetsImage } from "@/utils/getImage";
import { useStateStore } from '@/pages/state/use-state-store';
import { eventInstance } from '@/pages/event/event';
import { openDeviceModal } from '@/pages/widget/modal/device-modal/device-modal';
import bus from "@/utils/bus";
import { VideoType } from "@/api/models/vmonitor";

const { globalState } = useStateStore()
const piniaStoreMarket = storeMarket();
const deviceType = ref()
const type = ref()
const spinning = ref(false)
const dataInfo = ref<any>({ 
  baseArchivesInfo:{
      picture:'',
      thirdPartyId:'',
      code:'',
      area:{
          name:''
      },
      manager:{
          name:''
      },
      department:{
          name:''
      },
      status:{
          onlineState:false
      }
  },
  productInfo:{
      name:'',
      productCategory:{
          name:'',
          code:""
      },
      modelName:''
  },
  expandInfo:{
      factoryInfo:{
          usefulLife:''
      }
  }
})
const piniaIot = iotSocketStore()
const dataSource = ref<AlarmTakeNotesList[]>([])
const pagination = ref({
  pageSize: 5,
  pageNumber: 1,
  total: 0
})
const total = ref(0)
const handlingNum = ref(0)
const readData = ref<any>([]);
const attributeValueRead = ref();
const attributeValue = ref({});
const readAndWritData = ref<any>([
  {
    attributeName:'',
    attributeKeyValueVos:[],
    attributeCode:''
  }
]);
const columns = [
  {
    title: '异常类型',
    dataIndex: 'alarmTypeName',
  },
  {
    title: '上报时间',
    dataIndex: 'alarmTime',
  },
  {
    title: '异常详情',
    dataIndex: 'alarmEventName',
  },
  {
    title: '当前状态',
    dataIndex: 'alarmStatusName',
  }
]
const deviceRelationship = ref({
  type:'子设备',
  name:''
})

const positioning = async ()=>{
  eventInstance.emitEvent('locateToDevice', {
    deviceCode:dataInfo.value.baseArchivesInfo.code,
    prodCategory:dataInfo.value.productInfo.name
  })
}
const getDeviceInstanceDetail = async (id)=>{
    spinning.value = true
    dataInfo.value = await cubeDeviceCenterService.getDeviceInstanceDetail({deviceId:id})
    deviceType.value = DeviceTypeIcon[dataInfo.value.productInfo.name as keyof typeof DeviceTypeIcon];
    type.value  = DeviceTypeIcon[dataInfo.value.productInfo.productCategory.name as keyof typeof DeviceTypeIcon];
    spinning.value = false
    
    if (id !== panelCurrentDeviceId.value) {
     dataInfo.value.slaveDeviceList = [
      {
        id:panelCurrentDeviceId.value,
        name:deviceRelationship.value.name
      }
     ]
    }else{
      deviceRelationship.value.name = dataInfo.value.baseArchivesInfo.name
    }
    if (dataInfo.value.productInfo.picture) {
      cubeFileService.getFileInfo(dataInfo.value.productInfo.picture).then((res) => {
        dataInfo.value.productInfo.path = res.path;
      })
    }
}
const getTableData = () => {
  alarmStatisticsList({ alarmTargetCode: panelCurrentDeviceId.value,pageSize:pagination.value.pageSize,pageNumber:pagination.value.pageNumber }).then(res => {
    dataSource.value = res.records.map(item=>{
      return {
        ...item,
        alarmTime:dayjs(item.alarmTime).format('YYYY-MM-DD HH:mm:ss')
      }
    })
    total.value = res.total
    pagination.value.total=res.total
  })
  getstatus({alarmTargetCode:panelCurrentDeviceId.value}).then(res=>{
    handlingNum.value = res.alarmStatusStatistics[1].alarmNum
  })
}
const getDeviceIotData = async ()=>{
  const {dataArr} = await piniaIot.iotSocket.deviceDetail({
    deviceId: panelCurrentDeviceId.value,
    withSnapShot:true,
    withPropertySpec:true
  })
  readData.value = dataArr.filter((item) => item.permission === "READ");
  readAndWritData.value = dataArr.filter((item) => item.permission === "READ_WRITE");
  attributeValueRead.value = Object.fromEntries(
    readData.value.map((item: any) => [item.attributeCode, item.value])
  );
  attributeValue.value = Object.fromEntries(
    readAndWritData.value.map((item: any) => [item.attributeCode, item.value])
  );
}
const showMore = ()=>{
  openDeviceModal({
    title:dataInfo.value.baseArchivesInfo.name,
    deviceId:dataInfo.value.baseArchivesInfo.id,
  })
}
const changeDeviceRelationship = (data)=>{
  deviceRelationship.value.type = deviceRelationship.value.type === '父设备'?'子设备':'父设备'
  getDeviceInstanceDetail(data.id)
}

const goBack = ()=>{
  // const emergencyDeviceBack = globalState.business.emergencyDeviceBack
  // if (emergencyDeviceBack) {
  //   globalState.panel.visible = false
  //   globalState.panel.leftPanelName = 'floorEquipment'
  //   globalState.panel.rightPanelName = 'emergency-drill'
  //   globalState.panel.universalPanelVo.left = { items: '' }
  //   globalState.panel.universalPanelVo.right = { items: '' }
  //   setTimeout(() => {
  //     globalState.panel.visible = true
  //   }, 500);
  //   return
  // }
  piniaStoreMarket.panelCurrentDeviceId = ''
  globalState.business.panelCurrentDeviceId = ''
  // bus.emit("exitPatrol");
  eventInstance.emitEvent('verifyModelStatus')
  eventInstance.emitEvent('switchBusinessPanel')
}
const panelCurrentDeviceId = computed(()=>{
  return piniaStoreMarket.panelCurrentDeviceId || globalState.business.panelCurrentDeviceId
})
watch(() => panelCurrentDeviceId.value, async (val: any) => {
  if (val) {
   await getDeviceInstanceDetail(panelCurrentDeviceId.value)
   await getTableData()
   await getDeviceIotData()
  }
}, { immediate: true })
onMounted(()=>{
  document.querySelector('.device-details-box').removeAttribute("title");
  // getDeviceInstanceDetail()
  // getDeviceIotData()
  // getTableData()
})

const clickCamera = (item: VideoType) => {
  bus.emit("switchCamera", item);
};
</script>
<style lang="less" scoped>
.device-details-box {
  padding: 4px;

}

.real-time-data {
  display: flex;
  align-items: center;
  margin: 16px 0;

  .real-time-data-item {
    width: 167px;
    height: 32px;
    background: rgba(12, 23, 43, 0.30);
    border: 1px dashed rgba(46, 104, 220, 0.20);
    font-size: 13px;
    color: #d0deee;
    display: flex;
    align-items: center;

    .real-time-data-item-label,
    .real-time-data-item-value {
      width: 90px;
      height: 32px;
      background: rgba(86, 142, 255, 0.15);
      text-align: center;
      line-height: 32px;
    }

    .real-time-data-item-value {
      background: rgba(86, 142, 255, 0.05);
    }
  }
}

.alarm-table {
  height: 300px;

  .status-bar {
    font-size: 16px;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .status-bar-item {
      flex: 1;
      height: 46px;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(85deg, rgba(241, 69, 69, 0.3) 0%, rgba(241, 69, 69, 0.1) 100%);

      div {
        font-weight: bold
      }
    }

    .status-bar-right {
      margin-left: 10px;
      background: linear-gradient(270deg, rgba(255, 161, 0, 0.3) 0%, rgba(255, 161, 0, 0.1) 100%);
    }
  }
}


.more {
  color: #5EA6FF;
  font-size: 16px;
  cursor: pointer;
}

.real-time-monitoring {
  margin: 6px 0;
}

.video-box {
  height: 160px;
}

.basic-info {
  width: 344px;
  height: 40px;
  background: rgba(21, 120, 255, 0.12);
  border: 1px solid rgba(86, 142, 255, 0.30);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;

  .basic-info-name {
    font-size: 16px;
    color: #ffffff;
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .basic-info-operate {
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .basic-info-positioning,
    .basic-info-details {
      cursor: pointer;
      width: 50px;
      height: 22px;
      border-radius: 2px;
      text-align: center;
      line-height: 22px;
      font-weight: bold;
    }

    .basic-info-positioning {
      background: rgba(21, 120, 255, 0.20);
      border: 1px solid rgba(21, 120, 255, 0.50);
      color: rgb(21, 120, 255)
    }

    .basic-info-details {
      background: rgba(21, 120, 255, 0.30);
      border: 1px solid rgba(168, 207, 255, 0.50);
      color: #fff;
      margin-left: 10px;
    }
  }
}

.basic-info-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 110px;
  margin: 16px 0;

  .info-img {
    width: 110px;
    height: 110px;
  }

  .basic-info-list {
    .basic-info-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 220px;
      height: 30px;
      background: rgba(21, 120, 255, 0.12);
      border: 1px solid rgba(86, 142, 255, 0.20);
      font-size: 14px;
      color: #d0deee;
      margin-bottom: 10px;
      padding: 0 8px;

      .basic-info-item-label {
        display: flex;
        align-items: center;
      }

      .basic-info-item-label::before {
        content: '';
        width: 8px;
        height: 8px;
        display: block;
        margin-right: 6px;
        background: #d0deee;
        transform: rotate(45deg);
      }

      .basic-info-item-value {
        font-weight: bold;

      }
    }
  }
}

// 变量定义
@primary-color: #0066cc;
@background-color: rgba(0, 20, 40, 0.8);
@text-color: white;
@border-color: rgba(255, 255, 255, 0.2);
@hover-bg: rgba(255, 255, 255, 0.1);
@font-family: Arial, sans-serif;
@title-font-size: 18px;

// 混合宏
.transition(@property: all, @duration: 0.2s, @timing: ease) {
  transition: @property @duration @timing;
}

// 网格容器
.device-grid {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 15px;
  color: @text-color;
  position: relative;
  overflow: hidden;
  padding: 4px;
}

.device-item {
  margin: 0 4px 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100px;
  height: 24px;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  line-height: 24px;
  padding: 2px;
  background: rgba(6,17,32,0.20);
}

.device-type {
  display: flex;
  align-items: center;
  cursor: auto;
}

.device-type::before {
  content: '';
  width: 8px;
  height: 8px;
  display: block;
  margin-right: 6px;
  background: #d0deee;
  transform: rotate(45deg);
}


.title-bar {
  width: 344px;
  height: 28px;
  background: linear-gradient(to right, rgba(21, 120, 255, 0.6), rgba(21, 120, 255, 0.04));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  margin: 6px 0;
  .title-bar-left {
    font-size: 14px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .title-bar-left::before {
    content: '';
    width: 8px;
    height: 8px;
    display: block;
    margin-right: 6px;
    background: #d0deee;
    transform: rotate(45deg);
  }

  .title-bar-right {
    width: 30px;
    height: 9px;
  }
}
</style>