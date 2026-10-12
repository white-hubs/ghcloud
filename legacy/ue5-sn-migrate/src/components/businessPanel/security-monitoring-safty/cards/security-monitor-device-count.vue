<template>
  <div class="panel">
    <SubPanelTemplate :title="props.title" class="alarm-event">
      <DeviceStatistics @handelClickItemize="deviceClickItemize" imgPath="business-icon/triage-queue/6.png"
        :statistic="deviceStatisticsData"></DeviceStatistics>
      <div class="chart">
        <elevator-analysis-pie @clickbar="alarmOpen" style="width: 50%;height: 100%;" :pieData="pieData" :radius="'75'">
          <div style="color: #fff; text-align: center; font-size: 0.072rem">
            {{ getallNumber(pieData, "value") }}
          </div>
          <div style="color: #fff; text-align: center; font-size: 0.0625rem">设备总数</div>
        </elevator-analysis-pie>
        <elevatorAnalysisList @handlecurrent="alarmOpen" :showRatio="false" :contentList="pieData"
          style="width: 50%;"></elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <modal-equipment-table :show-modal="deviceModalShow" @close="deviceModalShow = false"
      :parameter="deviceParameter"></modal-equipment-table>
    <modal-equipment-all-table :show-modal="deviceAllModalShow" @close="deviceAllModalShow = false"
      :parameter="deviceAllParameter"></modal-equipment-all-table>
  </div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "../device-statistics.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import usrCommon from "@/components/hooks/useCommon";
import { getallNumber, setDeviceData } from "@/utils/common";
import { getDeviceBuyArea, getDeviceNumber } from '@/api/device'

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '监控设备统计'
})
const pieData = ref([]);
let timer: any = reactive(null);
const deviceModalShow = ref<boolean>(false);
const deviceAllModalShow = ref<boolean>(false);
const deviceParameter = reactive({
    areaId:'',
    tagCodes:[],
    deviceState:undefined,
  dateRange:[],
})
const deviceAllParameter = reactive({
  anyAreaId:'',
  areaId:undefined,
  tagCodes:[],
  filterAreaIds:[],
  deviceState:undefined,
  dateRange:[],
})
const {
  piniaStoreArea,
  piniaStoreMenu,
} = usrCommon();
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const changeEventTimeCount = async () => {
  const res = await getDeviceNumber({tagCodes:`custom.app::visual.${piniaStoreMenu.currentMenu}`})
  deviceStatisticsData.total = res.totalNumber
  deviceStatisticsData.itemize[0].offline = res.offlineNumber
  deviceStatisticsData.itemize[0].value = res.normalNumber
  let data = await getDeviceBuyArea({
    tagCodes: [`custom.app::visual.${piniaStoreMenu.currentMenu}`],
    areaLevel: piniaStoreArea.currentAreaLeave,
  })
   pieData.value = setDeviceData(data,colors)
};
const deviceClickItemize = (value)=>{
  if (value === '在线设备数') {
    deviceAllParameter.deviceState = true
  }else if(value === '离线设备数'){
    deviceAllParameter.deviceState = false
  }else{
    deviceAllParameter.deviceState = undefined
  }
  deviceAllParameter.tagCodes =  [`custom.app::visual.${piniaStoreMenu.currentMenu}`]
  deviceAllParameter.anyAreaId = undefined
  deviceAllModalShow.value = true;
}

const alarmOpen = (value)=>{
  if (value.name === '其他') {
    deviceAllParameter.anyAreaId = undefined
    deviceAllParameter.filterAreaIds = pieData.value.map(e=>e.areaId).filter(e=>e)
  }else{
    deviceAllParameter.anyAreaId = pieData.value.find(e=>e.name === value.name).areaId
    deviceAllParameter.filterAreaIds = []
    deviceAllParameter.deviceState = undefined
  }
  deviceAllParameter.tagCodes =  [`custom.app::visual.${piniaStoreMenu.currentMenu}`]
  deviceAllModalShow.value = true;
}
// 切换视频
watch(
  () => piniaStoreArea.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
const deviceStatisticsData = reactive({
  title: "监控设备总数",
  total: 48,
  itemize: [
    {
      name: "离线设备数",
      label: "在线设备数",
      value: 23,
      offline: 15,
      key: "OFFLINE",
    },
  ],
});

function init() {
  changeEventTimeCount();
}
onMounted(() => {
  init();
});
onBeforeUnmount(() => {
  timer&&clearInterval(timer);
});
</script>
<style lang="less" scoped>
.panel {
  padding: 0 8px;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 160px;
  display: flex;
  align-items: center;
}

.body {
  // :deep(.ant-image){
  //    width: 120px;
  //    height: 120px;
  //    .ant-image-img{
  //       width: 100%;
  //       height: 100%;
  //    }
  // }
}

.monitor {
  .body {
    margin-top: 0;
  }

  .title {
    color: #fff;
    font-size: 16px;
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .camera {
      margin: 0 6px;
      width: 160px;
      height: 90px;
      margin-top: 10px;
    }
  }
}

.alarm-event {
  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.extra {
  font-family: Roboto-Regular, Roboto;
  font-weight: 400;
  margin-left: 8px;

  span {
    color: #e7f0ff;
    font-size: 12px;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin-right: 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .radio {
    font-size: 12px;
  }

  .up {
    color: #f14545;
  }

  .down {
    color: #2ae8bd;
  }
}

.right-bar {
  width: 56px;
  height: 24px;
  background: rgba(41, 137, 255, 0.102);
  border-radius: 2px;
  border: 1px solid #2989ff;
  color: #fff;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-around;

  img {
    width: 14px;
    height: 14px;
  }
}

.forbidden {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
</style>
