<template>
  <div class="panel">
    <SubPanelTemplate title="设备分类">
      <pieGuidance :y-data="monitorSituationPieData" position="inside" :radius="['50%','90%']" height="80%">
      </pieGuidance>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备异常统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="receptionTrendsTime" @search="getAbnormalStatistics"></DateInlineForm>
      </template>
      <div class="alarmInfo">
        <deviceModule :data-list="alarmStatusData"></deviceModule>
      </div>
      <RollTable :column="alarmColumn" :data="listData">
        <template #situation="{ record }">
          <span v-if="record.situation === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
          <span v-else-if="record.situation === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.situation === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警率" class="alarm-event">
      <div class="alarmInfo">
        <deviceModule :data-list="dataList"></deviceModule>
        <waterPolo title="" :value="faultRate" unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
      </div>
    </SubPanelTemplate>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { abnormalStatistics } from '@/api/alarm'
import { AlarmRateList, ModelValueItf } from '../public/types'
import { storeMenu } from "@/piniaStore/menu";
import { storeArea } from "@/piniaStore/area";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import deviceModule from "../public/deviceModule.vue";
import useCommon from '@/components/hooks/useCommon'
import pieGuidance from "../public/charts/pie/pie-guidance.vue"
import RollTable from "../public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
//设备分类==============================================================
const colorList = [
  "#2F8DFF",
  "#19F8F7",
  "#7786a3",
  "#FFAB10",
]
const monitorSituationPieData = ref<{ name: string; value: number; color: string }[]>(
    [
        { name: "血液冷藏", value: 18, color: "#FFAB10" },
        { name: "冰箱冷藏", value: 25, color: "#2F8DFF" },
        { name: "低温保存箱", value: 34, color: "#F14545" },
        { name: "低温储存箱", value: 56, color: "#19F8F7" },
        { name: "液氧箱", value: 56, color: "#19F8F7" },
    ]
);
//设备异常统计==============================================================
const alarmStatusData = reactive<AlarmRateList[]>([
  {
    title: "异常设备数量",
    value: 0,
    ringRatio: false,
  },
  {
    title: "报警次数",
    value: 0,
    ringRatio: false,
    label: 0,
    unit: "%",
  },
]);
const alarmColumn = [
  {
    title: "日期",
    dataIndex: "timeFlag",
    width: 120,
  },
  {
    title: "异常设备数量",
    dataIndex: "equipmentNum",
  },
  {
    title: "报警次数",
    dataIndex: "alarmNum",
    width: 140,
  }
];
const listData = ref([])
const receptionTrendsTime = ref<ModelValueItf>();

//设备报警率========================================================================================
const faultRate = ref<number>(0);
const dataList = reactive<AlarmRateList[]>([
  {
    title: "报警设备数量",
    value: 0,
    ringRatio: false,
  },
  {
    title: "设备总量",
    value: 0,
    ringRatio: false,
    label: 0,
    unit: "%",
  },
]);

//获取数据=======================================================================================
//设备分类数据
const { getEquipmentNumber } = useCommon()
const getEquipmentInfo = async () => {
    monitorSituationPieData.value.length = 0
    let res:any = await getEquipmentNumber()
    if (!res.deviceNum) {
        return
    }
    res.deviceGenreNums.forEach((item, index) => {
        monitorSituationPieData.value.push({
            name: item.genreName,
            value: item.num,
            color:colorList[index]
        })
    })
    res.deviceStatusNums.forEach((item) => {
    if (item.name === "TROUBLE" && res.deviceNum !== 0) {
      faultRate.value = Math.round((item.num / res.deviceNum) * 10000 / 100.0);
      dataList[1].value = res.deviceNum;
      dataList[0].value = item.num;
      dataList[0].label = faultRate.value;
    }
  });
}
const getAbnormalStatistics=async()=>{
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: receptionTrendsTime.value.dateRange.join(","),
    type: receptionTrendsTime.value.timeType,
  };
  const res=await abnormalStatistics(param)
  alarmStatusData[0].value=res.equipmentDeviceTotal
  alarmStatusData[1].value=res.equipmentTotal
  listData.value=res.equipmentList
  if(receptionTrendsTime.value.timeType==='THIS_YEAR'){
    listData.value.forEach(x=>{
      x.timeFlag=x.timeFlag+'月'
    })
  }
  if(receptionTrendsTime.value.timeType==='TODAY'){
    res.equipmentList?.forEach(x=>{
      x.timeFlag=x.timeFlag+'时'
    })
  }
}
onMounted(()=>{
  getEquipmentInfo()
  getAbnormalStatistics()
})
</script>
<style lang="less" scoped>
.alarmInfo {
  padding: 10px 16px 0 20px;
  display: flex;
  padding: 0.05208rem 0.08333rem 0 0.10417rem;
  flex-direction: column;
  align-items: center;
  :deep(.deviceList) {
    display: flex;
    margin-bottom: 20px;
  }

  :deep(.titleBox) {
    text-align: center;
  }

  :deep(.ringRatio) {
    display: block !important;
    // align-items: center !important;
    text-align: center;
  }
}
</style>