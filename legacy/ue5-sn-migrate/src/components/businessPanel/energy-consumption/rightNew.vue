<template>
  <div class="panel">
    <SubPanelTemplate title="能耗用能统计" class="visiting-data">
      <template #extra>
        <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
      </template>
      <div class="statistics-box">
          <div class="item" v-for="item in visitingData" :key="item.title">
            <a-statistic :title="item.title">
              <template #formatter>
                <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
                <div class="ringRatio">
                  <span>环比</span>
                  <!-- uptriangle 向上三角根据Prop改变 -->
                  <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
                  <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio + "%" }}</div>
                </div>
              </template>
            </a-statistic>
          </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="能耗用能趋势图" class="visiting-data">
      <template #extra>
        <DateInlineForm v-model:modelValue="energyCarbonTime" @search="changeEnergyCarbonTime"></DateInlineForm>
      </template>
      <div class="radioBar">
        <a-radio-group @change="changeEnergyCarbonTime" v-model:value="state">
          <a-radio-button v-for="item in deviceStateList" :key="item.value" :value="item.value">{{ item.label
            }}</a-radio-button>
        </a-radio-group>
      </div>
      <div class="chart">
        <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
          gridTop="4" :unit="{ x: '', y: '' }" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="用能分析">
      <template #extra>
        <DateInlineForm v-model:modelValue="energyUsageTime" @search="changeAppointmentTime"></DateInlineForm>
      </template>
      <div class="flex-between analysis" v-for="item in energyAnalysis" :key="item.title">
        <PlanPie :pieData="item.data">
          <div class="content">
            <div>{{ item.title }}</div>
          </div>
        </PlanPie>
        <PieList class="pieList" :roundPieData="item.data"></PieList>
      </div>
    </SubPanelTemplate> 
    <SubPanelTemplate title="设备状态分布">
      <div class="flex-between">
        <PlanPie :pieData="pieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div style="font-size: 12px;">设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="pieData" @handelClickItemize="handelClickItemize"></PieList>
      </div>
    </SubPanelTemplate>
    <modal-equipmentAll-table :show-modal="deviceModalShow" @close="deviceModalShow = false"
    :parameter="deviceParameter"></modal-equipmentAll-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { getAssetsImage } from '@/utils/getImage';
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { ModelValueItf } from '../public/types';
import { collectConfigList, dcStatTrend, energyProject, getEnenergyTrendType, projectStatCategory } from '@/api/energy';
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { equipmentTotal } from '@/api/equipment';
import {  statCategoryAll } from '@/api/energy';
import noData from "@/components/businessPanel/public/noData.vue";
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const pieData = ref([]);
const deviceParameter = reactive({
    areaId:piniaStoreArea.currentAreaId,
    tagCodes:[`custom.app::visual.${piniaStoreMenu.currentMenu}`],
    deviceState:true
})
const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const workOrderTime = ref<ModelValueItf>();
const energyUsageTime = ref<ModelValueItf>();
const energyCarbonTime = ref<ModelValueItf>();
const colorList = ["#FFAB10","#2F8DFF","#F14545","#19F8F7"]
const alarmTotal = ref(0)
const state = ref('electricity_meter')
const deviceStateList = ref([])
const deviceModalShow = ref<boolean>(false);
  const energyAnalysis = ref([
    {
        data: [],
        title: '电力'
    },
    {
        data: [],
        title: '水'
    },
    {
        data: [],
        title: '燃气'
    },
])
const visitingData = ref([])
const receptionTrendsChartData = reactive({
  xData: ['4', '8', '12', '16', '20', '24h'],
  yData: [
    { data: [], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
  ],
})
const changeHandleworkOrderTime = async () => {
  const params={
    period:workOrderTime.value.dateRange.join(","),
    type:workOrderTime.value.timeType
  }
  let res = await statCategoryAll(params)
  res = res.filter(item => item.instrumentType !== "zh" && item.instrumentType !== "carbon");
  visitingData.value = res.map(item=>{
    return {
      img: getAssetsImage('overView12.png'),
      ratio:item.qoqValueRate || 0,
      value:item.value,
      title:item.instrumentTypeName
    }
  })
};
const handelClickItemize = (value)=>{
  if (value.label === '正常') {
    deviceParameter.deviceState = true
  }else{
    deviceParameter.deviceState = false
  }
  deviceModalShow.value = true
}
const changeEnergyCarbonTime =async () => {
  const params = {
    type:energyCarbonTime.value.timeType,
    period:energyCarbonTime.value.dateRange.join(","),
    instrumentType:state.value
  }
 const res = await dcStatTrend(params)

 receptionTrendsChartData.xData = res.map(item=>item.time)
 receptionTrendsChartData.yData[0].data = res.map(item=>item.value) 
}
// 用能分析
const changeAppointmentTime = async(): Promise<void> => {
    const params={
      period:energyUsageTime.value.dateRange.join(","),
      type:energyUsageTime.value.timeType,
      projectCategory:'ITEM'
  }
//   // 电表
 let electricity:any = await projectStatCategory(Object.assign(params, {instrumentType:'electricity_meter'}))
 energyAnalysis.value[0].data = electricity.map((item:any,index)=>{
  return {
    label:item.name,
    value:item.value,
    color:colorList[index]
  }
 })
 // 水表
  let water:any = await projectStatCategory(Object.assign(params, {instrumentType:'water_meter'}))
  energyAnalysis.value[1].data = water.map((item:any,index)=>{
  return {
    label:item.name,
    value:item.value,
    color:colorList[index]
  }
 })
 // 水表
  let gas_meter:any = await projectStatCategory(Object.assign(params, {instrumentType:'gas_meter'}))
  energyAnalysis.value[2].data = gas_meter.map((item:any,index)=>{
  return {
    label:item.name,
    value:item.value,
    color:colorList[index]
  }
 })
}
// 能耗分类配置
const getCollectConfigList = async () => {
 const res = await collectConfigList()
 deviceStateList.value = res.map(e=>{
  return {
    label:e.categoryName,
    value:e.categoryCode
  }
 })
 state.value = deviceStateList.value[0].value
}
// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
  }
    let res: any = await equipmentTotal(params);
    if (!res.deviceNum) {
        return;
    }
    pieData.value.length = 0
    alarmTotal.value = 0;
    res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
            label: deviceStatusType[item.name],
            color: colorList[index],
            value: item.num,
        };
        pieData.value.push(obj);
    });
};
onMounted(()=>{
  deviceDataInfo()
  getCollectConfigList()
})
</script>
<style lang="less" scoped>
:deep(.power-factor) {
  width: 100px;
  height: 100px;
}

:deep(.pie-box) {
  width: 100px;
  height: 100px;
}

.policeList {
  height: auto;
}

.visiting-data {
  .title {
    color: #fff;
    font-size: 12px;
  }

  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .statistics-box {
      width: 100%;
      height: 100px;
      overflow-y: auto;
      .item {
        width: 50%;
        height: 50px;
        margin-top: 20px;
        display: inline-flex;
        align-items: center;
        box-sizing: border-box;
        padding-left: 20px;

        .ant-statistic {
          display: inline-flex;
          flex-flow: column-reverse;

          .ant-statistic-content {
            height: 29px;

            .ant-statistic-content-value {
              color: #fff;
              font-size: 22px;
              font-weight: 400;
              position: relative;
              top: -25px;
            }
          }

          .ant-statistic-title {
            color: #D0DEEE;
            font-size: 12px;
            margin: 0;
          }
        }

        .ringRatio {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }

        .downtriangle {
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 8px solid #d2fff3;
          margin: 0 3px;
          transform: rotate(180deg);
        }

        .uptriangle {
          border-bottom: 8px solid #ffcece;
          transform: rotate(0deg);
        }

        .down {
          color: #2ae8bd;
          font-family: Roboto-Regular, Roboto;
        }

        .up {
          color: #f14545;
          font-family: Roboto-Regular, Roboto;
        }
      }
    }
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

.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}

:deep(.ant-radio-group) {
  text-align: left;
}

.chart {
  height: 150px;
  min-height: 150px;
  width: 100%;
}

.analysis {
  .pieList {
    height: 80px;
  }
}
</style>