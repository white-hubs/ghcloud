<template>
  <div class="panel">
    <SubPanelTemplate title="示教情况总览">
      <template #extra>
        <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel"></DateInlineForm>
      </template>
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData" :eventNum="devicesNum">
          <div class="content">
            <span>{{ devicesNum }}</span> <br />报警总数
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="示教直播场次">
      <template #extra>
        <DateInlineForm v-model:modelValue="eventInfo" @search="alarmEventTop"></DateInlineForm>
      </template>
      <div class="chart">
        <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="最受欢迎视频Top10" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleTime" @search="areaAlarmStatistic"></DateInlineForm>
      </template>
      <div class="body" v-show="areaAlarmRank.length" style="min-height: 250px">
        <EventAlarmItem :sn="false" v-for="(item, index) in areaAlarmRank" :sort="index + 1" :name="item.name"
         :count="item.num"/>
      </div>
      <div class="body" v-show="!areaAlarmRank.length" style="min-height: 250px">
        <noData></noData>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import pieList from "../public/pieList.vue";
import noData from "../public/noData.vue";
import overviewChartBar from "../hospital/overview-chartBar.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { ModelValueItf } from '../public/types'
import EventAlarmItem from "../public/eventAlarmItem.vue";
import { storeMenu } from "@/piniaStore/menu";
import { storeArea } from "@/piniaStore/area";
import { teachOverview,broadcastSessions,popularVideos } from "@/api/securitymanagement";
let timeFrame = ref<ModelValueItf>();
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const eventInfo = ref<ModelValueItf>();
const roundPieData = ref([]);
const devicesNum = ref(0);
const handleTime = ref<ModelValueItf>();
const areaAlarmRank = ref([]);
const barData = reactive({
  xData: [],
  yData: [
    {
      data: [],
      name: '',
      color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
    }
  ]
})
const getAlarmLevel =  async ()=> {
  let param = {
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
  };
  const res = await teachOverview(param)
  devicesNum.value = 0
  roundPieData.value = res.map(item=>{
  devicesNum.value +=item.num
    return {
      label: item.name,
      value: item.num
    }
  })
}
const alarmEventTop = async()=>{
  let param = {
    period: eventInfo.value.dateRange.join(","),
    type: eventInfo.value.timeType,
  };
  const res = await broadcastSessions(param)  
  barData.xData=res.xtitle.map(item => {
        if (eventInfo.value.timeType === 'TODAY') {
            return item += '时'
        } else if (eventInfo.value.timeType === 'THIS_YEAR') {
            return item += '月'
        } else {
            return item
        }
    });
  barData.yData[0].data = res.xtitle.map(xItem=>{
      return res.overviewVos.find(item=>item.timeFlag===xItem)?res.overviewVos.find(item=>item.timeFlag===xItem).num:0
    })
}
const areaAlarmStatistic = async ()=>{
  let param = {
    period: handleTime.value.dateRange.join(","),
    type: handleTime.value.timeType,
  };
  areaAlarmRank.value = await popularVideos(param)
}
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 12px;
  }

  .policeList {
    height: auto;
  }
}

.chart {
  height: 220px;
}
</style> 