<template>
  <div >
    <SubPanelTemplate title="应急人员统计">
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData1" :eventNum="devicesNum">
        </RoundPie>
        <pieList :roundPieData="roundPieData1"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="应急设备统计">
      <div class="equipmentAlarm">
        <PlanPie :pieData="roundPieData">
          <div class="content">
            <div class="total-num">{{ deviceTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
      <div class="footer">
          <RollTable
            :column="column"
            :data="listData"
          >
          </RollTable>
        </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="应急设施使用率" class="alarm-event">
      <div class="equipmentInfo">
        <waterPolo
          title=""
          :value="alarmRateData.proportion"
          unit="%"
          bgColor="#2989FF"
          color="#2989FF"
        >
        </waterPolo>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import pieList from "../public/pieList.vue";
import RollTable from "../public/rollTable/index.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import deviceModule from "../public/deviceModule.vue";
import { AlarmRateList, ModelValueItf } from '../public/types'
import { emergencyDevicePage, emergencyDeviceStat, emergencyFacilityStat, emergencyUserStats } from '@/api/emergency' 

const roundPieData = ref([
  {
    value:0,
    label:'已使用',
    color:"rgba(3, 182, 21, 1)"
  },
  {
    value:0,
    label:'未使用',
    color:"rgba(245, 154, 35, 1)"
  }
]);
const roundPieData1 = ref([])
const devicesNum = ref(0);
const deviceTotal = ref(0);
const column = reactive([
  {
    title: "设备名称",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "已使用",
    dataIndex: "deviceUsedNum",
  },
  {
    title: "未使用",
    dataIndex: "notUsedValue",
  },
]);
const listData = ref([
  {
    alarmTime:'111',
    alarmLevelName:'222',
    alarmEventName:'333',
  },
  {
    alarmTime:'111',
    alarmLevelName:'222',
    alarmEventName:'333',
  },
  {
    alarmTime:'111',
    alarmLevelName:'222',
    alarmEventName:'333',
  },
]);
const alarmRateData = reactive({
  proportion: 0,
  deviceTotal: "",
  alarmNum: "",
  chainRatio: "",
});
const dataList = reactive<AlarmRateList[]>([
  {
    title: "总数",
    value: 0,
    ringRatio: false,
  },
  {
    title: "已使用",
    value: 0,
    ringRatio: false,
    label: 0,
  },
]);
const colorList = [
  "#2F8DFF",
  "#D0DEEE",
  "#FFAB10",
  "#F14545",
]
const getAlarmLevel = async ()=> {
 const res = await emergencyUserStats()
 roundPieData1.value = res.map((item,index)=>{
  return {
    value:item.value,
    label:item.name,
    color:colorList[index]
  }
 })
}

const emergencyFacilityEvent = async ()=> {
  const res = await emergencyDeviceStat()
  const data = await emergencyDevicePage()
  roundPieData.value[0].value = res.usedValue
  roundPieData.value[1].value = res.notUsedValue
  deviceTotal.value = res.total
  listData.value = data.records.map(item=>{
    return {
     ...item,
     notUsedValue:item.deviceNum - item.deviceUsedNum
    }
  })
}
const emergencyFacilities = async () => {
 const res = await emergencyFacilityStat()
 dataList[0].value = res.total
 dataList[1].value = res.usedValue
 alarmRateData.proportion = res.total?(res.usedValue /res.total)*100:0

}
onMounted(() => {
  emergencyFacilityEvent()
  emergencyFacilities()
  getAlarmLevel()
})
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 16px;
    text-align: center;
    color: #fff;
  }
  .policeList{
    height: auto;
  }
}
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
}
</style>