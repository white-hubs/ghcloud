<template>
  <div >
    <SubPanelTemplate title="设备总览">
      <div class="chart">
        <monitorPie @clickBar="clickBar" :yData="detectionData">
          <div style="color: #fff;text-align: center;font-size: 18px;">{{ alarmTotal }}</div>
          <div style="color: #fff;text-align: center;font-size: 16px;">设备总数</div>
        </monitorPie>
      </div>
      <monitor-list :monitorData="detectionData"></monitor-list>
    </SubPanelTemplate>
  </div>
  <modal-equipmentAll-table :show-modal="deviceAllModalShow" @close="deviceAllModalShow = false"
  :parameter="deviceAllParameter"></modal-equipmentAll-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import monitorPie from "@/components/businessPanel/public/charts/pie/monitor-pie.vue"
import monitorList from "@/components/businessPanel/public/monitor-list.vue"
import useCommon from "@/components/hooks/useCommon";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore()
const { getEquipmentNumber } = useCommon();
const alarmTotal = ref(370)
let deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
const deviceAllModalShow = ref<boolean>(false);
const deviceAllParameter = reactive({
  areaId:globalState.business.currentAreaId,
  tagCodes:[`custom.app::visual.${globalState.business.currentMenu}`],
  filterAreaIds:[],
  deviceState:undefined,
  dateRange:[],
})
const colorList = ['#2AE8BD','#FFC700','#3590FF']
const detectionData = ref([
  {
    name: '正常',
    color: '#2AE8BD',
    value: 317
  }, {
    name: '故障',
    color: '#FFC700',
    value: 23
  }, {
    name: '关闭',
    color: '#3590FF',
    value: 30
  },
])
let timer = null
const fakeData = [
  [23, 10, 2],
  [50, 30, 10],
  [90, 80, 70],
]
let fakeIndex = 1
onMounted(() => {
  deviceDataInfo()
  timer = setInterval(() => {
    // detectionData.value[0].value = fakeData[fakeIndex][0]
    // detectionData.value[1].value = fakeData[fakeIndex][1]
    // detectionData.value[2].value = fakeData[fakeIndex][2]
    // alarmTotal.value = detectionData.value.map(e => e.value).reduce(function (total, value) {
    //   return total + value;
    // }, 0);
    fakeIndex++
    if (fakeIndex > fakeData.length - 1) {
      fakeIndex = 0
      clearInterval(timer)
    }
  }, (window as any).config.pageLoopRequestTime)
})
const clickBar = (value)=>{
  deviceAllModalShow.value = true
}
// 设备实时数据
const deviceDataInfo = async () => {
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  detectionData.value.length = 0;
  alarmTotal.value = 0;
  res.deviceStatusNums.forEach((item, index) => {
    alarmTotal.value += item.num;
    let obj = {
      name: deviceStatusType[item.name],
      color: colorList[index],
      value: item.num,
    };
    detectionData.value.push(obj);
  });
};
onUnmounted(() => {
  clearInterval(timer)
})
</script>
<style scoped lang="less">
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}

.chart {
  flex: 1;
  height: 200px;
  margin-top: 20px;
}
</style>