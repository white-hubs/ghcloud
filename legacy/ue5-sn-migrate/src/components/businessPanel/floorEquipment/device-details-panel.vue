<template>
  <div class="device-details-box" title="">
    <SubPanelTemplate title="基本信息">
      <template #extra>
        <a-button type="primary" @click="goBack">返回
          <template #icon>
            <RollbackOutlined />
          </template>
        </a-button>
      </template>
      <div class="device-info">
        <div class="device-info-item">设备名称:{{dataInfo.baseArchivesInfo.name}}</div>
        <div class="device-info-item">设备品牌:{{ dataInfo.brandName || '暂无' }}</div>
        <div class="device-info-item">设备型号:{{ dataInfo.productInfo.modelName || '暂无' }}</div>
        <div class="device-info-item">所在区域:{{ dataInfo.baseArchivesInfo.area?.pathName || '暂无' }}</div>
        <div class="device-info-item">设备编码:{{ dataInfo.baseArchivesInfo.code || '暂无' }}</div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="实时数据">
      <div class="real-time-data">
        <div class="real-time-data-box">
          <div class="real-time-data-item">
            在线状态:
            <span v-if="dataInfo.baseArchivesInfo.status.onlineState" style="color: #5ccd4d">
              在线
            </span>
            <span v-else style="color: #fba33f">
              离线
            </span>
          </div>
          <div class="real-time-data-item">
            <span>
              {{ readAndWritData[0].attributeName }}:
            </span>
            <a-radio-group button-style="solid" v-model:value="switchDoorValue" size="small" @change="changeValue">
              <a-radio-button v-for="item in  readAndWritData[0].attributeKeyValueVos" :key="item.attributeCode"
                :value="String(item.value)">
                {{ item.label }}
              </a-radio-button>
            </a-radio-group>
          </div>
        </div>
        <H5Video 
        v-if="dataInfo.productInfo.name === '监控' || deviceType <= 3 || type<=3 || dataInfo.baseArchivesInfo.thirdPartyId"
        :cameraItem="{deviceId:dataInfo.baseArchivesInfo.id}"></H5Video>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="异常记录">
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
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, watch} from 'vue'
import {RollbackOutlined} from '@ant-design/icons-vue';
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { storeMarket } from '@/piniaStore/other'
import { cubeDeviceCenterService, cubeFileService } from "@/api/service";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import { AlarmTakeNotesList } from '@/api/models/alarm';
import { alarmStatisticsList, getstatus } from '@/api/alarm';
import RollTable from "../public/rollTable/index.vue";
import dayjs from 'dayjs';
import bus from '@/utils/bus'
import { iotSocketStore } from "@/piniaStore/iotSocketStore";
import { useSubscribeStore } from "@/piniaStore/socketSubscribe";
import {UeClient} from "@ghcloud/cube-visual-sdk";
import { message } from "ant-design-vue";
import { DeviceTypeIcon } from '@/utils/enumeratie'

const piniaStoreMarket = storeMarket();
const piniaUseSubscribeStore = useSubscribeStore();
const ueClient = UeClient.getInstance();
const deviceType = ref()
const type = ref()
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
          name:''
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
const readAndWritData = ref<any>([
  {
    attributeName:'',
    attributeKeyValueVos:[],
    attributeCode:''
  }
]);
const switchDoorValue = ref()
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
watch(() => piniaUseSubscribeStore.subscribeData, (val: any) => {
  if (val.deviceId === piniaStoreMarket.doorDeviceId) {
    val.updates.forEach(item=>{
      if (item.key === 'switch_door') {
        switchDoorValue.value = item.value;
        changeValue(false)
      }
    })
  }
})
const getDeviceInstanceDetail = async ()=>{
  if (piniaStoreMarket.doorDeviceId) {
    dataInfo.value = await cubeDeviceCenterService.getDeviceInstanceDetail({deviceId:piniaStoreMarket.doorDeviceId})
    deviceType.value = DeviceTypeIcon[dataInfo.value.productInfo.name as keyof typeof DeviceTypeIcon];
    type.value  = DeviceTypeIcon[dataInfo.value.productInfo.productCategory.name as keyof typeof DeviceTypeIcon];
  }
}
const getTableData = () => {
  alarmStatisticsList({ alarmTargetCode: piniaStoreMarket.doorDeviceId,pageSize:pagination.value.pageSize,pageNumber:pagination.value.pageNumber }).then(res => {
    dataSource.value = res.records.map(item=>{
      return {
        ...item,
        alarmTime:dayjs(item.alarmTime).format('YYYY-MM-DD HH:mm:ss')
      }
    })
    total.value = res.total
    pagination.value.total=res.total
  })
  getstatus({alarmTargetCode:piniaStoreMarket.doorDeviceId}).then(res=>{
    handlingNum.value = res.alarmStatusStatistics[1].alarmNum
  })
}
const getDeviceIotData = async ()=>{
  const {dataArr,deviceInfo} = await piniaIot.iotSocket.deviceDetail({
    deviceId: piniaStoreMarket.doorDeviceId,
    withSnapShot:true,
    withPropertySpec:true
  })
  readAndWritData.value = dataArr.filter((item) => item.permission === "READ_WRITE");
}
const changeValue = async (flag=true)=>{
  const value = readAndWritData.value[0].attributeKeyValueVos.find(e=>e.value === switchDoorValue.value).label
    ueClient.send('switchEntrance', [
      {id: dataInfo.value.baseArchivesInfo.code, open: value==='开门' ? true : false},
    ]);
    let params = {
        deviceId: piniaStoreMarket.doorDeviceId,
        propWriteValues: [
          {
            code: readAndWritData.value[0].attributeCode,
            expectedValue: switchDoorValue.value
          }
        ]
    }
    if (flag) {
      await cubeDeviceCenterService.controlWithPermission(params)
      message.success("下发指令成功")
    }
}
const goBack = ()=>{
  piniaStoreMarket.doorDeviceId = ''
  bus.emit("exitPatrol");
}
onMounted(()=>{
  getDeviceInstanceDetail()
  getDeviceIotData()
  getTableData()
})
</script>
<style lang="less" scoped>
.device-details-box {
  padding: 4px;

  .device-info {
    color: #fff;
    // display: flex;
    // flex-wrap: wrap;
    font-size: 16px;

    .device-info-item {
      margin-bottom: 10px;
    }
  }
}

.real-time-data {
  max-height: 300px;

  .real-time-data-box {
    color: #fff;
    font-size: 16px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
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
</style>