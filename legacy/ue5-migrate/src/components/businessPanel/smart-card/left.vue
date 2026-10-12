<template>
  <div >
    <SubPanelTemplate title="智能卡状态统计">
      <div class="equipmentAlarm">
        <PlanPie :pieData="roundPieData">
          <div class="content">
            <div class="total-num">{{ deviceTotal }}</div>
            <div>智能卡总数</div>
          </div>
        </PlanPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="来访人员趋势图">
      <template #extra>
        <DateInlineForm v-model:modelValue="takeNotes" @search="getPlayRecordTop"></DateInlineForm>
      </template>
      <div class="chart">
        <LineChart :x-data="periodTime.xData" :series="[{data:periodTime.yData}]" :showLegend="true"
          :showBackground="true" :titles="['']" gridTop="5" :unit="{ x: '', y: '' }" :axisPointer="true" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="门禁事件Top10">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleTime" @search="getPassengerFlowRegions"></DateInlineForm>
      </template>
      <div class="body" v-show="areaAlarmRank.length" style="min-height: 250px">
        <EventAlarmItem :sn="false" v-for="(item, index) in areaAlarmRank" :sort="index + 1" :name="item.name"
          :count="item.value" />
      </div>
      <div class="body" v-show="!areaAlarmRank.length" style="min-height: 250px">
        <noData></noData>
      </div>
    </SubPanelTemplate>
  </div>
</template> 

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import pieList from "../public/pieList.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import noData from "../public/noData.vue";
import { ModelValueItf } from '../public/types'
import { eventNameStat, trendStat, useStatusStat } from '@/api/door'

const roundPieData = ref([
  {
    value:10,
    label:'正常',
    color:"rgba(3, 182, 21, 1)"
  },
  {
    value:10,
    label:'挂失',
    color:"rgba(245, 154, 35, 1)"
  }
]);
const deviceTotal = ref(0);
const handleTime = ref<ModelValueItf>()
const takeNotes = ref<ModelValueItf>()
const areaAlarmRank = ref([]);
const periodTime = reactive<{xData:string[];yData:number[]}>({
    xData:[],
    yData:[],
})

const getUseStatusStat = async () => {
 const res = await useStatusStat()
 roundPieData.value[0].value = res.normalNum
 roundPieData.value[1].value = res.lossNum
 deviceTotal.value = res.normalNum + res.lossNum
}
const getPlayRecordTop = async () => {  
 const res = await trendStat({type:takeNotes.value.timeType,period:takeNotes.value.dateRange.join(",")})
 periodTime.xData = res.map(item=>{
  if (takeNotes.value.timeType === 'TODAY') {
    return item.name+'时'
  }else{
    return item.name
  }
 })
 periodTime.yData = res.map(item=>item.value)
}
const getPassengerFlowRegions=async ()=>{
  const res = await eventNameStat({period:handleTime.value.dateRange.join(",")})
  areaAlarmRank.value = res
}
onMounted(()=>{
  getUseStatusStat()
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

  .policeList {
    height: auto;
  }
}

.chart {
  height: 200px;
}
</style>