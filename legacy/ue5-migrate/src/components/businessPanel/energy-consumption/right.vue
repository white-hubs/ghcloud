<template>
  <div >
    <SubPanelTemplate title="能碳概览" class="visiting-data">
      <template #extra>
        <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
      </template>
      <div class="radioBar">
        <a-radio-group @change="changeEvent" v-model:value="state">
          <a-radio-button v-for="item in devceStateList" :key="item.value" :value="item.value">{{ item.label
            }}</a-radio-button>
        </a-radio-group>
      </div>
      <div class="chart">
        <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
          gridTop="15" :unit="{ x: '', y: receptionTrendsChartData.yUnits }" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="用电分区排名">
      <template #extra>
        <DateInlineForm v-model:modelValue="consumption" @search="changeHandleConsumptionTime"></DateInlineForm>
      </template>
      <div class="chart">
        <barChart :title="'kw.h'" :x-data="alarmType.xData"
          :data="[{ color: '#1890FF', name: '', data: alarmType.yData }]" class="columnBox" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备状态">
      <div class="stateList" v-show="deviceStatus.length">
        <div class="stateBox flex-between" v-for="item in deviceStatus" :key="item.name">
          <img :src="getAssetsImage('overView5.png')" alt="">
          <div class="state-name">{{ item.type }}：<span>{{ item.num }}</span> </div>
          <div class="stateContent">离线：<span>{{ item.offLineNum }}</span> </div>
          <div class="Proportion flex-between"><span style="font-size: 12px;">离线率：</span> <span> {{
              (item.proportion*100)+'%'
              }}</span></div>
        </div>
      </div>
      <div class="stateList" v-show="!deviceStatus.length">
        <noData></noData>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import noData from "../public/noData.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import barChart from "../public/charts/bar/barChart.vue";
import { ModelValueItf } from "../public/types";
import { getAssetsImage } from '@/utils/getImage';
import { getClassification, getEnenergyEreaType, getEnenergyTrendType } from '@/api/energy'
import { useStateStore } from '@/pages/state/use-state-store';
const workOrderTime = ref<ModelValueItf>();
const consumption = ref<ModelValueItf>();
const { globalState } = useStateStore();

const state = ref('electricity_meter')
const overview= async()=>{
  let trend = {
    timeFlag:changeTime(workOrderTime.value.timeType),
    instrumentType:state.value,
    sceneType: globalState.business.currentMenu,
    areaId:globalState.business.currentAreaId,
  }
 const data =await getEnenergyTrendType(trend)
 receptionTrendsChartData.yData[0].data = data.map(res=>res.value)
 receptionTrendsChartData.xData = data.map(item=>{
    if (trend.timeFlag === 'Day') {
             item.timeFlag += '时'
        } else if (trend.timeFlag === 'Year') {
             item.timeFlag += '月'
        }else if (trend.timeFlag === 'Month'||trend.timeFlag === 'Week') {
             item.timeFlag += '日'
        } else {
             item
        }
        return item.timeFlag
  })
}
const changeTime = (time)=>{
    if (time==='TODAY') {
        return 'Day'
    }else if (time==='THIS_WEEK') {
        return 'Week'
    }else if (time==='THIS_MONTH') {
        return 'Month'
    }else if (time==='THIS_YEAR') {
        return 'Year'
    }
}
const arearank=async()=>{
let params={
    timeFlag:changeTime(consumption.value.timeType),
    instrumentType:'electricity_meter',
    sceneType: globalState.business.currentMenu,
    areaId:globalState.business.currentAreaId,
}
const data =await getEnenergyEreaType(params)
alarmType.yData=data.list.map(res=>parseFloat(res.value))
alarmType.xData=data.list.map(res=>res.areaName)
alarmType.yData.length?'':alarmType.yData.push(0)
}
const getoffline=async ()=>{
  const params={
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  }
  deviceStatus.value =await getClassification(params)
}

const devceStateList = ref([
  {
    label: '电能',
    value: 'electricity_meter'
  },
  {
    label: '水能',
    value: 'water_meter'
  },
  // {
  //   label: '燃气',
  //   value: 'gas_meter'
  // },
  // {
  //   label: '蒸汽',
  //   value: '3'
  // },
])
const deviceStatus = ref<any>([
  {
    name: '智能电表',
    offlineNum: 5,
    devicNum: 105,
    Proportion: '2%'
  },
  {
    name: '智能水表',
    offlineNum: 8,
    devicNum: 231,
    Proportion: '8%'
  },
  {
    name: '智能空调',
    offlineNum: 10,
    devicNum: 248,
    Proportion: '2%'
  },
  {
    name: '变配电箱',
    offlineNum: 8,
    devicNum: 18,
    Proportion: '2%'
  },
])
const changeHandleworkOrderTime = () => {
  overview()
};
const changeHandleConsumptionTime = () => {
  arearank()
};
const alarmType = reactive({
  xData: [],
  yData: []
})
const receptionTrendsChartData = reactive({
  xData: ['4', '8', '12', '16', '20', '24h'],
  yData: [
    { data: [], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
  ],
  yUnits: 'kw·h'
})
const changeEvent = () => {
overview()
  if (state.value === 'electricity_meter') {
    receptionTrendsChartData.yUnits = 'kw·h'
  } else if (state.value === 'water_meter') {
    receptionTrendsChartData.yUnits = 't'
  } else if (state.value === 'gas_meter') {
    receptionTrendsChartData.yUnits = 'm³'
  } else if (state.value === '3') {
    receptionTrendsChartData.yUnits = 'kg CO₂e'
  }
}

let timer = null
const init=()=>{
  getoffline()
  overview()
  arearank()
}
watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer.value);
    init();
    timer.value = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
  }
);
onMounted(() => {
  init()
  timer = setInterval(() => {
    getoffline()
    overview()
    arearank()
  }, (window as any).config.pageLoopRequestTime)


})
onUnmounted(() => {
  clearInterval(timer)
})
</script>
<style scoped lang="less">
.chart {
  height: 260px;
}

.stateBox {
  color: #fff;
  background-color: rgba(108, 128, 151, 0.3);
  margin-top: 10px;
  padding: 0 10px;
  font-size: 12px;

  .state-name {
    display: flex;
    align-items: center;

    span {
      font-size: 18px;
      color: #30a55b;
    }
  }

  .stateContent {
    display: flex;
    align-items: center;

    span {
      font-size: 18px;
      color: #e7131e;
    }
  }

  .Proportion {
    font-size: 18px;
  }
}

.radioBar {
  text-align: right;
  margin: 6px 0;

  :deep(.ant-radio-button-wrapper) {
    height: 28px;
    line-height: 28px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px 2px 2px 2px;
    font-size: 12px;
    color: #ABB8CB;
    margin-left: 6px;
  }

  :deep(.ant-radio-button-wrapper-checked) {
    color: #fff;
    background: rgba(41, 137, 255, 0.302);
  }
}

.stateList {
  height: 200px;
  overflow-y: scroll;
}
</style>