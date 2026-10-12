<template>
    <div class="panel">
    <SubPanelTemplate title="设备状态总览">
      <OperateDays title="设备总数" :value="deviceTotal">
      </OperateDays>
      <GridContainer :data="deviceStatistic" class="body-bum"></GridContainer>
      <div class="chart">
        <pieGuidance :chartPosition="'0'" :height="'180px'" :y-data="yData"></pieGuidance>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警明细"  style="maxHeight: 250px;" class="product-table">
      <template #extra>
        <div class="dataTitle">
          <div class="dataTitle-right" style="color: #5EA6FF;" @click="handleAll">查看更多>></div>
        </div>
      </template>
      <RollTable :column="alarmColumn" :data="alarmListData" :showLength="4">
        <template #alarmStatus="{ record }">
          <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待接收</span>
          <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警Top5" class="alarm-event">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="handleTime"
        @search="areaAlarmStatistic"
        ></DateInlineForm>
      </template>
      <div class="body" style="min-height: 200px" v-show="areaAlarmRank.length > 0">
        <EventAlarmItem
          v-for="(item, index) in areaAlarmRank"
          :sort="index+1"
          :name="item.name"
          :linkRatio="item.chainRatio"
          :count="item.alarmNum"
          :ratio="item.ratio + '%'"
        />
      </div>
      <div class="body" style="min-height: 200px" v-show="areaAlarmRank.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    </div>
    <modal-alarm-table :show-modal="deviceModal" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
</template>

<script setup lang="ts">
import useCommon from '@/components/hooks/useCommon'
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import GridContainer from "../public/gridContainer.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import noData from "../public/noData.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import pieGuidance from "../public/charts/pie/pie-guidance.vue"
import OperateDays from "../public/operateDays.vue";
import RollTable from "../public/rollTable/index.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import { ModelValueItf } from '../public/types'
import { AlarmAreaTop } from '@/api/models/alarm'
import { alarmStatisticsList, statisticsDeviceTop } from '@/api/alarm'
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";

const deviceTotal = ref(0);
const deviceStatistic = ref([]);
const deviceModal = ref<boolean>(false);
const areaAlarmRank = ref<AlarmAreaTop[]>([]);
const handleTime = ref<ModelValueItf>();
const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const colorList = [
  "#2F8DFF",
  "#19F8F7",
  "#7786a3",
  "#FFAB10",
]
const alarmParameter = ref<Record<string, any>>({});
const yData = ref([
    { name: '正常', value: 0, itemStyle: { color: "#2F8DFF" } },
    { name: '离线', value: 0, itemStyle: { color: "#2AE8BD" } },
    { name: '故障', value: 0, itemStyle: { color:  "#7786a3" } },
    { name: '告警', value: 0, itemStyle: { color: "#f7c741" } },
])
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const alarmListData = ref([])
const alarmColumn = [
  {
    title: "设备名称",
    dataIndex: "alarmTargetName",
    width: 120,
  },
  {
    title: "所属区域",
    dataIndex: "areaName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
  },
  {
    title: "当前状态",
    dataIndex: "status",
    width: 140,
    slots: {
      customRender: "alarmStatus",
    },
  }
];
const { getEquipmentNumber } = useCommon()
const getEquipmentInfo = async () => {
    yData.value.length = 0
    let res:any = await getEquipmentNumber()
    if (!res.deviceNum) {
        return
    }
    deviceTotal.value=res.deviceNum
    deviceStatistic.value.length = 0
    res.deviceStatusNums.forEach((item, index) => {
        yData.value.push({
            name: deviceStatusType[item.name],
            value: item.num,
            itemStyle:{color:colorList[index]} 
        })
        deviceStatistic.value.push({
            alarmStatusName: deviceStatusType[item.name],
            color: colorList[index],
            alarmNum: item.num,
        })

    })
}
const areaAlarmStatistic = async () => {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: handleTime.value.dateRange.join(","),
    type: handleTime.value.timeType,
  };
  const res = await statisticsDeviceTop(params);
  areaAlarmRank.value = res;
};
// 获取报警列表
async function getAlarmTakeNotes() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    pageSize: 50,
    pageNumber: 1,
  };
  let res: any = await alarmStatisticsList(params);
  alarmListData.value = res.records.map((item) => {
    return {
      ...item
    };
  });
}
const handleAll = () => {
  deviceModal.value = true
}
const closeModal = () => {
    deviceModal.value = false;
};
onMounted(()=>{
  getEquipmentInfo()
  getAlarmTakeNotes()
})
</script>
<style lang="less" scoped>
.chart{
  height: 260px;
}
.dataTitle {
  color: #ABB8CB;
  font-size: 14px;
  text-align: right;

  .dataTitle-right {
    cursor: pointer;
  }
}
</style>