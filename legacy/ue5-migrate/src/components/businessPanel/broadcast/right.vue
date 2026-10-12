<template>
  <div >
    <SubPanelTemplate title="广播记录排名">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="alarmTime"
          @search="changeAlarmTime"
        ></DateInlineForm>
      </template>
      <OperateDays title="播放数" :value="alarmCon.num" class="body-bum">
        <div class="extra flex-start">
            <div class="mode">环比</div>
            <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
            <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
        </div>
      </OperateDays>
      <div class="title">广播记录类型排名top5</div>
      <div class="body" style="min-height: 250px" v-show="areaAlarmRank.length > 0">
        <EventAlarmItem
          v-for="(item, index) in areaAlarmRank"
          :sort="index+1"
          :name="item.name"
          :count="item.num"
          :ratio="item.ratio + '%'"
        />
      </div>
      <div class="body" style="min-height: 250px" v-show="areaAlarmRank.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="广播记录趋势">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="alarmTypeTime"
          @search="areaAlarmStatistic"
        ></DateInlineForm>
      </template>
      <div class="chart">
      <LineChart :x-data="deviceFailureTrendCharData.xData" :series="deviceFailureTrendCharData.yData" :showLegend="false"
        gridTop="15" :unit="{ x: '', y: '次' }" />
    </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="最新记录明细">
      <div class="footer">
         <RollTable :column="column" :data="listData" :showLength="5">
         </RollTable>
       </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import OperateDays from "../public/operateDays.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import noData from "../public/noData.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import RollTable from "../public/rollTable/index.vue";
import { playRecordTop,recordTotal,recordTrend,statisticsRecord } from "@/api/broadcast";
import { ModelValueItf } from "../public/types";
import dayjs from "dayjs";
import { useStateStore } from '@/pages/state/use-state-store';

const alarmTypeTime = ref<ModelValueItf>();
const alarmTime = ref<ModelValueItf>();
const { globalState } = useStateStore()
const alarmCon = ref({
  count: 10,
  ratio: 10,
})
const deviceFailureTrendCharData = reactive({
  xData: [1,2,3,4,5,6],
  yData: [
    { data:  [150, 40, 10, 50,10,10,10,0] , linearGradientColor: ['rgba(86, 142, 255, 1)', 'rgba(86, 142, 255, 0.1)'], lineColor: 'rgba(86, 142, 255, 1)' },
  ]
})
const column = [
  {
    title: "广播时间",
    dataIndex: "broadcastTime",
    width: 120,
  },
  {
    title: "内容",
    dataIndex: "broadcastPlayContent",
    width: 160,
  },
  {
    title: "操作人",
    dataIndex: "operatorByName",
  }
];
const listData = ref<{ label?: string; value?: number; color?: string;alarmTime:string;alarmLevelName:string;alarmEventName:string }[]>([
  {
    alarmTime:'111',
    alarmLevelName:'222',
    alarmEventName:'333'
  },
  {
    alarmTime:'xxx',
    alarmLevelName:'222',
    alarmEventName:'333'
  },
  {
    alarmTime:'aaa',
    alarmLevelName:'222',
    alarmEventName:'333'
  },
])
const areaAlarmRank = ref([])
const areaAlarmStatistic = async()=>{
  const params = {
    type:alarmTypeTime.value.timeType,
    period:alarmTypeTime.value.dateRange.join(","),
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  }
  const res = await recordTrend(params)
  deviceFailureTrendCharData.xData.length = 0
  deviceFailureTrendCharData.yData[0].data.length = 0
  res.forEach(item=>{
    deviceFailureTrendCharData.xData.push(item.timeFlag)
    deviceFailureTrendCharData.yData[0].data.push(item.num)
  })
}
const changeAlarmTime = async()=>{
  const params = {
    type:alarmTime.value.timeType,
    period:alarmTime.value.dateRange.join(","),
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  }
 areaAlarmRank.value = await playRecordTop(params)
 alarmCon.value = await recordTotal(params)
}
const getPlaybackRecord = async () => {
  const params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId
  }
  listData.value = await statisticsRecord(params)
  listData.value.forEach(item=>{
    item.broadcastTime = dayjs(item.broadcastTime).format("YYYY-MM-DD HH:mm:ss")
  })
}
onMounted(()=>{
  getPlaybackRecord()
})
</script>
<style lang="less" scoped>
  .title{
    margin-top:10px;
    color:#fff;
    font-size:16px;
    font-family: sourceMedium;
  }
  .chart{
    height:220px;
  }
</style>