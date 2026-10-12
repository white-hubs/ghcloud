<template>
    <div class="panel">
        <SubPanelTemplate title="用能概览" class="visiting-data">
            <template #extra>
                <div class="title">
                    {{ RegionInfo.build }}{{ RegionInfo.floor }}
                </div>
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
                <DateInlineForm v-model:modelValue="workOrderTime" @search="changeReceptionTrendsTime"></DateInlineForm>
            </template>
            <div class="chart">
                <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData"
                    :showLegend="false" gridTop="15" :unit="{ x: '', y: '能耗' }" />
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="电消耗趋势">
            <template #extra>
                <DateInlineForm v-model:modelValue="workOrderTime" @search="changeReceptionTrendsTime"></DateInlineForm>
            </template>
            <div class="chart">
                <StackedBar :xData="alarmStatisticsData.chartData.xData" :yData="alarmStatisticsData.chartData.yData" />
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="燃气消耗趋势">
            <template #extra>
                <DateInlineForm v-model:modelValue="gasConsumption" @search="changeGasConsumption"></DateInlineForm>
            </template>
            <div class="chart">
                <LineChart :x-data="gasChartData.xData" :series="gasChartData.yData" :showLegend="false" gridTop="15"
                    :unit="{ x: '', y: '能耗' }" />
            </div>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import VisitingDataPic from "@/components/businessPanel/triage-queue/components/visiting-data-pic.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import StackedBar from '../public/charts/stacked-bar/stacked-bar.vue';
import { ModelValueItf } from "../public/types";
import { getXaxleData, getCurrentAreaInfo } from "@/utils/common"
import { getGasConsumptionData, EnergyConsumptionTrends } from '@/mock/energy-consumption'
import { getAssetsImage } from '@/utils/getImage';
const workOrderTime = ref<ModelValueItf>({
    timeType: '',
    dateRange: ['']
});
const gasConsumption = ref<ModelValueItf>({
    timeType: '',
    dateRange: ['']
});
const visitingData = ref([
    { title: "电耗 kw·h", value: 33299.00, img: getAssetsImage('overView43.png'), ratio: 10 },
    { title: "水消耗 t", value: 252001.8, img: getAssetsImage('overView12.png'), ratio: 8 },
    { title: "燃气消耗 m³", value: 1421.80, img: getAssetsImage('overView12.png'), ratio: 8 },
])
const receptionTrendsChartData = reactive({
    xData: ['4', '8', '12', '16', '20', '24h'],
    yData: [
        { data: [110, 1350, 1520, 1700, 550, 280], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
    ]
})
const gasChartData = reactive({
    xData: ['4', '8', '12', '16', '20', '24h'],
    yData: [
        { data: [0, 50, 20, 200, 150, 20], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
    ]
})
const alarmStatisticsData = reactive({
    chartData: {
        xData: ['1', '2', '3', '4', '5', '6', '7天'],
        yData: [
            { name: '平时用电量', value: [10, 10, 8, 6, 16, 10, 12], color: "#F14545" },
            { name: '峰时用电量', value: [10, 10, 8, 6, 16, 10, 12], color: "#FFC700" },
            { name: '谷时用电量', value: [10, 10, 8, 6, 16, 10, 12], color: "#2989FF" }
        ]
    }
})
const changeReceptionTrendsTime = (): void => {
    receptionTrendsChartData.yData[0].data = EnergyConsumptionTrends(workOrderTime.value.timeType)
    receptionTrendsChartData.xData = getXaxleData(workOrderTime.value.timeType)
}
const changeGasConsumption = () => {
    gasChartData.xData = getXaxleData(gasConsumption.value.timeType)
    gasChartData.yData[0].data = getGasConsumptionData(gasConsumption.value.timeType)
}
let RegionInfo = reactive<{ build: string; floor: string }>({
    build: '',
    floor: ''
})
let timer = null
let fakeData = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let fakeIndex = 1
onMounted(() => {
    let res = getCurrentAreaInfo()
    RegionInfo = res
    timer = setInterval(() => {
        workOrderTime.value.timeType = fakeData[fakeIndex]
        changeReceptionTrendsTime()
        changeGasConsumption()
        fakeIndex++;
        if (fakeIndex > fakeData.length - 1) {
            fakeIndex = 0
            clearInterval(timer)
        }
    }, (window as any).config.pageLoopRequestTime)
})
onUnmounted(() => {
    clearInterval(timer)
})
</script>
<style scoped lang="less">
.visiting-data {
    .title {
        color: #fff;
        font-size: 12px;
    }

    :deep(.sub-panel-content) {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        .item {
            width: 50%;
            height: 60px;
            margin-top: 30px;
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
</style>