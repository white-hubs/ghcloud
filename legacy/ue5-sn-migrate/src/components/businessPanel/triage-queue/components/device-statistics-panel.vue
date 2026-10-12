<template>
  <SubPanelTemplate title="设备统计" class="device-statistics">
    <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="business-icon/triage-queue/6.png" :statistic="deviceStatisticsData"></DeviceStatistics>
    <div class="device-statistics-table" >
      <div class="table-header">
        <span>设备类型</span>
        <span>设备总数</span>
        <span>离线数</span>
      </div>
      <div class="table-body" v-show="deviceStatisticsData.list.length > 0">
        <vue3-seamless-scroll :list="deviceStatisticsData.list" :step="step" hover :singleHeight="36"
          :waitTime="waitTime">
          <div class="item" v-for="(item, index) in deviceStatisticsData.list" :key="index"
            :style="{ backgroundColor: index % 2 === 0 ? 'rgba(171,177,189,0.12)' : '' }">
            <span>{{ item.typeName }}</span>
            <span>{{ item.total }}</span>
            <span>{{ item.offlineNum }}</span>
          </div>
        </vue3-seamless-scroll>
      </div>
      <noData v-show="!deviceStatisticsData.list.length"></noData>
    </div>
  </SubPanelTemplate>
  <modal-equipmentAll-table :show-modal="deviceAllModalShow" @close="deviceAllModalShow = false"
  :parameter="deviceAllParameter"></modal-equipmentAll-table>
</template>
<script setup lang="ts">
import DeviceStatistics from './device-statistics.vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import noData from "./noData.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
import scrollParmas from "@/components/businessPanel/public/rollTable/scrollParmas";
import useCommon from '@/components/hooks/useCommon'
import {classification} from '@/api/device'
import { storeMenu } from "@/piniaStore/menu";
import { storeArea } from "@/piniaStore/area";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const { step, waitTime } = scrollParmas()
const deviceAllModalShow = ref<boolean>(false);
const deviceAllParameter = reactive({
  areaId:piniaStoreArea.currentAreaId,
  tagCodes:[`custom.app::visual.${piniaStoreMenu.currentMenu}`],
  filterAreaIds:[],
  deviceState:undefined,
  dateRange:[],
})
  /**
 * 设备统计
 */
const deviceStatisticsData = reactive({
  title: "设备总数",
  total: 0,
  itemize: [
    {
      label: "离线",
      value: 0,
      key: "OFFLINE",
    }
  ],
  list: []
});

let timer = null

const { getEquipmentNumber } = useCommon()
const getEquipmentInfo = async () => {
    let res:any = await getEquipmentNumber()
    if (!res.deviceNum) {
        return
    }
    deviceStatisticsData.total=res.deviceNum
    res.deviceStatusNums.forEach((item) => {
      if(item.name === "OFFLINE" && res.deviceNum !== 0){
        deviceStatisticsData.itemize[0].value=item.num;
      }
  });
}
const getdevice=async()=>{
  deviceStatisticsData.list=[]
let params = {
  sceneType: piniaStoreMenu.currentMenu,
  areaId: piniaStoreArea.currentAreaId
}
let data=await  classification(params)
  data.forEach((item) => {
    deviceStatisticsData.list.push({
      typeName: item.type || '分诊屏',
      total:item.num,
      offlineNum:item.offLineNum
    })
  })
}
const handelClickItemize = ()=>{
  deviceAllModalShow.value = true
}
onMounted(() => {
  getEquipmentInfo()
  getdevice()
})

onUnmounted(() => {
  clearInterval(timer)
})



</script>
<style scoped lang="less">
.device-statistics {
  .device-statistics-table {
    .table-header {
      width: 100%;
      height: 36px;
      background: rgba(86, 142, 255, 0.2);
      border-radius: 0px 0px 0px 0px;
      opacity: 1;
      border: 1px solid rgba(86, 142, 255, 0.302);
      display: flex;
      align-items: center;
      justify-content: space-between;
      span {
        width: 25%;
        text-align: center;
        line-height: 36px;
        font-weight: 400;
        color: #FFFFFF;
        font-size: 14px;
      }
    }

    .table-body {
      overflow: hidden;
      height: 144px;

      .item {
        height: 36px;
        font-size: 12px;
        font-weight: 400;
        color: #D9E7FF;
        line-height: 36px;
        display: flex;
        justify-content: space-between;
        span {
          width: 25%;
          text-align: center;

          &:last-child {
            color: #FFC700
          }

          img {
            max-width: 100%;
            max-height: 100%;
          }
        }
      }
    }
  }
}
</style>