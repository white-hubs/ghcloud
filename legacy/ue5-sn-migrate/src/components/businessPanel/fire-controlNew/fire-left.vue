<template>
  <div class="panel">
    <SubPanelTemplate title="报警情况统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmtimeType" @search="changeDate"></DateInlineForm>
      </template>
      <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false"></displayPanel>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警事件统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime"></DateInlineForm>
      </template>
      <div class="chart">
        <overviewChartBar @clickbar="alarmClickBar" :xData="barData.xData" :yData="barData.yData"
          v-if="barData.xData.length"></overviewChartBar> 
        <noData v-else></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="trend" @search="getAlarmTrend"></DateInlineForm>
      </template>
      <LineChart :x-data="xData.arr" :series="series" v-if="!series[0].data.every(value => value === 0)"></LineChart>
      <div class="body" style="min-height: 150px;" v-else>
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import overviewChartBar from "../hospital/overview-chartBar.vue"
import LineChart from "../public/lineChart.vue";
import { ModelValueItf } from '../public/types'
import { alarmTrend } from '@/utils/requestData/alarm'
import useCommon from '@/components/hooks/useCommon'
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { alarmEventTypeStatisticsc, statisticsSituation } from '@/api/alarm'
import noData from '../public/noData.vue';

const {
  piniaStoreArea,
  piniaStoreMenu,
} = useCommon();
let eventDataList=[]
const alarmModalShow = ref<boolean>(false);
const parameter = reactive({
  alarmEventTypeId:'',
  dateRange:[],
})
let alarmtimeType = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const contentList = ref([
  {
    name: "消防报警占比",
    field:"ratio",
    value: 0,
  },
  {
    name: "报警处理率",
    field:"handlerRatio",
    value: 0,
  },
  {
    name: "报警正确率",
    field:"actualRatio",
    value: 0,
  },
  {
    name: "报警超时率",
    field:"timeoutRatio",
    value: 0,
  },
]);
let trend = reactive<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const barData = reactive({
  xData: ['安防报警', '消防报警', '电气报警', '入侵报警'],
  yData: [
    {
      data: [10, 20, 30, 40],
      name: '',
      color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
    }
  ]
})
const xData = reactive({ arr: [] });
const series = reactive([
  {
    data: [],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
const alarmClickBar = (value)=>{
  const {name}=value
  const findItem =  eventDataList.find(item=>item.name===name)
  if(findItem){
    parameter.alarmEventTypeId=findItem.id
    parameter.dateRange = overviewTime.value.dateRange
    alarmModalShow.value=true
  }
  
//    const obj = {
//     '一级':'one_level',
//     '二级':'two_level',
//     '三级':'three_level',
//     '四级':'four_level',
//    }
//    if (value.name) {
//     alarmLevelCode.value = obj[value.name.substring(0, 2)]
//    }else{
//     alarmLevelCode.value = obj[value.data.name.substring(0, 2)]
//    }
//  alarmModalShow.value = true;
}
const closeModal=()=>{
  alarmModalShow.value=false;
}
const overviewTime = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
}
)
const changeDate = async () => {
  getAlarmSituation()
}
// 获取报警情况统计
const getAlarmSituation=async ()=>{
  let params = {
      sceneType: piniaStoreMenu.currentMenu,
      areaId: piniaStoreArea.currentAreaId,
      period: alarmtimeType.value.dateRange.join(","),
      type: alarmtimeType.value.timeType,
    };
  let res = await statisticsSituation(params);
  contentList.value = contentList.value.map(item=>{
    return {
      ...item,
      value: +res[item.field]
    }
  })
}
// onMounted(()=>{
//   getAlarmSituation()
// })
const changeHandleOverviewTime = async () => {
  getAlarmEvent()
}
const getAlarmEvent = async ()=>{
  let params = {
      sceneType: piniaStoreMenu.currentMenu,
      areaId: piniaStoreArea.currentAreaId,
      period: overviewTime.value.dateRange.join(","),
      type:overviewTime.value.timeType
    };
  const result =  await alarmEventTypeStatisticsc(params)
  barData.xData= result.map(item=>item.name)
  barData.yData[0].data = result.map(item=>item.totalNum)
  eventDataList=result
}
// 设备报警趋势
const getAlarmTrend = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: trend.dateRange.join(","),
    type: trend.timeType,
  };
  let data: any = await alarmTrend(param);
  xData.arr = data.xdata;
  series[0].data = data.ydata;
};
</script>
<style lang="less" scoped>
.chart {
  height: 220px;
}
</style>
