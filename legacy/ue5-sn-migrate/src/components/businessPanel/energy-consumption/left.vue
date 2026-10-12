<template>
    <div class="panel">
        <SubPanelTemplate title="能碳概览" class="visiting-data">
            <template #extra>
                <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
            </template>
            <div class="item" v-for="item in visitingData" :key="item.title">
                <VisitingDataPic :img="item.img" />
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
        </SubPanelTemplate>
        <SubPanelTemplate title="综合能耗趋势">
            <template #extra>
                <DateInlineForm v-model:modelValue="energyConsumption" @search="changeHandleEnergyConsumptionTime">
                </DateInlineForm>
            </template>
            <div class="chart">
                <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData"
                    :showLegend="false" gridTop="15" :unit="{ x: '', y: '能耗' }" />
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
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import VisitingDataPic from "@/components/businessPanel/triage-queue/components/visiting-data-pic.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { getAssetsImage } from '@/utils/getImage';
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import { ModelValueItf } from "../public/types";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { energyTrend , energyProject , comprehensiveEnergy} from "@/api/energy";
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const workOrderTime = ref<ModelValueItf>();
const energyConsumption = ref<ModelValueItf>();
const energyUsageTime = ref<ModelValueItf>();
let timer = null
// 群控组实时数据
const visitingData = ref([
    { title: "综合能耗tce", value: 450, img: getAssetsImage('overView43.png'), ratio: 0.5 },
    { title: "碳排量kg CO₂e", value: 607, img: getAssetsImage('overView12.png'), ratio: 0.5 },
])
const receptionTrendsChartData = reactive({
    xData: ['4', '8', '12', '16', '20', '24h'],
    yData: [
        { data: [], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
    ]
})
const total = ref(0)
const colorList = ["#FFAB10","#2F8DFF","#F14545","#19F8F7"]
const energyAnalysis = ref([
    {
        data: [],
        title: '电力'
    },
    {
        data: [],
        title: '水'
    }
])
// 用能分析
const changeAppointmentTime = async(): Promise<void> => {
    const params={
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    timeFlag:changeTime(energyUsageTime.value.timeType)
  }
  // 电表
 let electricity:any = await energyProject(Object.assign(params, {instrumentType:'electricity_meter'}))
 energyAnalysis.value[0].data = electricity.list.map((item:any,index)=>{
  return {
    label:item.projectName,
    value:item.value,
    color:colorList[index]
  }
 })
 // 水表
  let water:any = await energyProject(Object.assign(params, {instrumentType:'water_meter'}))
  energyAnalysis.value[1].data = water.list.map((item:any,index)=>{
  return {
    label:item.projectName,
    value:item.value,
    color:colorList[index]
  }
 })
}
// 能碳概览
const changeHandleworkOrderTime = async() => {
 const params={
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    timeFlag:changeTime(workOrderTime.value.timeType)
  }
  let res = await comprehensiveEnergy(params)
   visitingData.value[0].value=res.energyCoal
   visitingData.value[0].ratio=res.energyCoalRatio
   visitingData.value[1].value=res.energyCarbon
   visitingData.value[1].ratio=res.energyCarbonRatio
};
// 综合能耗趋势
const changeHandleEnergyConsumptionTime =async () => {
    const { timeType } = energyConsumption.value
    const params={
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    timeFlag:changeTime(timeType)
    }
  let res= await energyTrend(params)
  receptionTrendsChartData.xData = res.map(item=>{
    if (changeTime(timeType) === 'Day') {
             item.timeFlag += '时'
        } else if (changeTime(timeType) === 'Year') {
             item.timeFlag += '月'
        }else if (changeTime(timeType) === 'Month'||changeTime(timeType) === 'Week') {
             item.timeFlag += '日'
        } else {
             item
        }
        return item.timeFlag
  })
  receptionTrendsChartData.yData[0].data = res.map(item=>{
        return item.value
  })

};
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
const init = ()=>{
    changeHandleworkOrderTime()
    changeHandleEnergyConsumptionTime()
    changeAppointmentTime()
}
watch(
  () => piniaStoreArea.currentAreaId,
  () => {
    clearInterval(timer.value);
    init();
    timer.value = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
  }
);

onMounted(() => {
    timer = setInterval(() => {
        init()
    }, (window as any).config.pageLoopRequestTime)
})
onUnmounted(() => {
    clearInterval(timer)
})
</script>
<style scoped lang="less">
.visiting-data {
    :deep(.sub-panel-content) {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        .item {
            width: 50%;
            height: 60px;
            margin: 30px 0;
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

.chart {
    width: 100%;
    height: 220px;
}

.content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
        font-size: 16px;
    }
}

.analysis {
    margin-top: 20px;
}
</style>