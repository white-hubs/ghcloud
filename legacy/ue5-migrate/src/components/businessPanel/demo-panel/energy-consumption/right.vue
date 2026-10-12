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
      <div class="stateList">
        <div class="stateBox flex-between" v-for="item in deviceStatus" :key="item.name">
          <img :src="getAssetsImage('overView5.png')" alt="">
          <div class="state-name">{{ item.name }}：<span>{{ item.devicNum }}</span> </div>
          <div class="stateContent">离线：<span>{{ item.offlineNum }}</span> </div>
          <div class="Proportion flex-between"><span style="font-size: 12px;">离线率：</span> <span> {{ item.Proportion
          }}</span></div>
        </div>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import { EnergyCarbon, DeviceStatus } from '@/mock/energy-consumption'
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getAssetsImage } from '@/utils/getImage';
import { getXDataByTime } from '@/utils/common'
const workOrderTime = ref<ModelValueItf>();
const consumption = ref<ModelValueItf>();
const state = ref('0')
const devceStateList = ref([
  {
    label: '电能',
    value: '0'
  },
  {
    label: '用水',
    value: '1'
  },
  {
    label: '燃气',
    value: '2'
  },
  {
    label: '蒸汽',
    value: '3'
  },
])
const deviceStatus = ref([
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
  receptionTrendsChartData.yData[0].data = EnergyCarbon(workOrderTime.value.timeType)
  receptionTrendsChartData.xData = getXDataByTime(workOrderTime.value.timeType)
};
const changeHandleConsumptionTime = () => {
  alarmType.yData = DeviceStatus(consumption.value.timeType)
};
const alarmType = reactive({
  xData: ['检验科', '药房', '理疗科', '手术部', '放射科', '急诊', '门诊', '住院部'],
  yData: [5, 8, 10, 15, 20, 19, 24, 21, 30]
})
const receptionTrendsChartData = reactive({
  xData: ['4', '8', '12', '16', '20', '24h'],
  yData: [
    { data: [], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
  ],
  yUnits: 'kw·h'
})
const changeEvent = () => {
  if (state.value === '0') {
    receptionTrendsChartData.yUnits = 'kw·h'
    receptionTrendsChartData.yData[0].data = [54, 21, 64, 80, 60, 154, 230, 70, 60, 40, 60]
  } else if (state.value === '1') {
    receptionTrendsChartData.yUnits = 't'
    receptionTrendsChartData.yData[0].data = [154, 21, 64, 80, 160, 154, 230, 70, 60, 140, 60]
  } else if (state.value === '2') {
    receptionTrendsChartData.yUnits = 'm³'
    receptionTrendsChartData.yData[0].data = [54, 21, 64, 180, 60, 14, 20, 70, 160, 40, 60]
  } else if (state.value === '3') {
    receptionTrendsChartData.yUnits = 'kg CO₂e'
    receptionTrendsChartData.yData[0].data = [54, 21, 164, 80, 160, 254, 230, 170, 60, 40, 60]
  }
}
onMounted(() => {
  const { code } = JSON.parse(sessionStorage.getItem('GH-NowEnterprise'))
  if (code === 48055979|| code === 81860362) {
    alarmType.xData = ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼', '6号楼', '7号楼'].reverse()
  }
})

</script>
<style scoped lang="less">
.chart {
  height: 260px;
}

.stateBox {
  color: #fff;
  background-color: rgba(171,177,189,.12);
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
      
      background: rgba(216,216,216,.1)!important;
      border: 1px solid rgba(96, 112, 128, 0.6) !important;
      border-radius: 2px;
      color: #fff;
  }

  :deep(.ant-radio-button-wrapper-checked) {
      background: rgba(216,216,216,.1)!important;
      border: 1px solid rgba(96, 112, 128, 0.6) !important;
      border-radius: 2px;
      color: #fff;
  }
}
:deep(.ant-radio-button-wrapper:not(:first-child)::before){
    display: none;
}
</style>