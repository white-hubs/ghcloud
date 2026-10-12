<template>
  <div >
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
            <span>
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
                <div :title="tr[td.dataIndex]" v-else-if="td.dataIndex === 'name'" class="flex-between device_name">
                  {{tr[td.dataIndex].length > 15 ? tr[td.dataIndex].substring(0, 12) + '...' : tr[td.dataIndex]}}
                </div>
                <span v-else>{{tr[td.dataIndex] || '--' }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <a-pagination class="pagination" @change="getData" v-model:current="deviceQuery.pageNumber"
        v-model:pageSize="deviceQuery.pageSize" :total="deviceQuery.total" show-less-items :showSizeChanger="false" />
    </SubPanelTemplate>
    <MonitorGridsModal v-model:visible="visible" :cameraList="cameraList" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, computed,watch} from 'vue'
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import { getDeviceListBuyScene } from '@/api/device'
import {UeClient} from "@ghcloud/cube-visual-sdk";
import MonitorGridsModal from "@/components/monitor-grids-modal/monitor-grids-modal.vue";
import {
  EnvironmentOutlined,
  ProfileOutlined,
} from '@ant-design/icons-vue';
import bus from '@/utils/bus'
import { storeMarket } from '@/piniaStore/other'
import { setSpecialCamera } from "@/views/index";
import { useStateStore } from '@/pages/state/use-state-store';
import { getNorthDeviceDetail } from '@/api/iot';
const ueClient = UeClient.getInstance();
const { globalState } = useStateStore();
const deviceQuery = reactive({
  status:null,
  keyword:'',
  pageSize: 20,
  pageNumber: 1,
  total: 0,
})
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
  let style = {}
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
    width:200,
  },
  {
    title:'状态',
    dataIndex:'status',
    width:100,
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

const positioning = async (data)=>{
  const obj={
    alarmTargetCode:data.code,
    alarmTargetKey:data.id,
    viewLocation:true,
    prodCategory:data.prodCategory.name,
    modalType:'EquipmentAbbreviationsPanel'
  }
  setSpecialCamera(data.prodCategory.name,data.code)
  bus.emit("openDevicePopup", obj)
}
watch(()=>piniaStoreMarket.selectDevice,()=>{
  getData()
})
const getData = async () => {
    let query = {
        sceneType:globalState.business.currentMenu,
        areaId:globalState.business.currentAreaId,
        pageNumber:deviceQuery.pageNumber,
        pageSize:deviceQuery.pageSize,
        status:deviceQuery.status,
        keyword:deviceQuery.keyword,
    }
const DEVICE = await getDeviceListBuyScene(query)
 tableData.value = DEVICE.records
 tableData.value.forEach(e=>{
  e.status = e.status.onlineState?'NORMAL':'OFFLINE'
 })
 
 deviceQuery.total = DEVICE.total
 handleLampStatus()
}
// 集体处理灯状态
const handleLampStatus = ()=>{
  if (tableData.value.length) {
    let deviceInfoData = [];
    for (let i = 0; i < tableData.value.length; i++) {
      deviceInfoData.push(
        new Promise(async (resolve, reject) => {
          try {
            const params = { deviceId: tableData.value[i].id,withPropertySpec:true,withSnapShot:true }
            const result = await getNorthDeviceDetail(params)
            result.productPropVoList.forEach((e) => {
              result.snapshots.forEach((item) => {
                if (e.propCode === item.key && e.propCode === "status") {
                  result.preValue = item.preValue
                }
              })
            })
            resolve(result)
          } catch (error) {
            
          }
        })
      )
    }
    Promise.all(deviceInfoData).then((res) => {
      const colorType = {
        '0':{color:4,flash:true},
        '1':{color:1,flash:false},
        '2':{color:2,flash:false},
        '3':{color:4,flash:true},
        '4':{color:4,flash:true},
      }
      const turnOnTheLight = res.map(e=>{
          return {id: e.deviceNumber, on: true,color:colorType[e.preValue].color,flash:colorType[e.preValue].flash}
      })
      ueClient.send('switchLight', turnOnTheLight.filter(e=>e));
    })
  }
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

const clickTableRow = async (event,data)=>{
  bus.emit("closeDevicePanel")
  if(event.target.className === 'ant-checkbox-input')return
  //保存当前视角
  await ueClient.saveNowViewPoint();
  Object.assign(modal,data)
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
  text-align: center;
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

.device_name {
  width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
