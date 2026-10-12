<template>
    <div class="panel">
        <SubPanelTemplate title="示教情况总览" class="supply-merchant">
            <displayPanel :bg-img="'overView14.png'" :content-list="contentList"></displayPanel>
        </SubPanelTemplate>
        <SubPanelTemplate title="示教直播场次">
            <template #extra>
                <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
            </template>
            <div class="chart">
                <overviewChartBar :title="'场次'" :xData="barData.xData" :yData="barData.yData" :x-font-size="10.5"></overviewChartBar>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="示教视频总量">
            <div class="chart">
                <LineChart :titles="['视频量']" :x-data="receptionTrendsChartData.xData"
                    :series="receptionTrendsChartData.yData"></LineChart>
            </div>
        </SubPanelTemplate>
    </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import { ModelValueItf } from "../public/types";
import displayPanel from "../public/display-panel.vue"
import Bar3D from "@/components/businessPanel/public/charts/bar/bar3D.vue";
import LineChart from "../public/lineChart.vue";
import { LiveStreamingSessions } from '@/mock/surgical-demonstration'
import { getXaxleData } from '@/utils/common'
import overviewChartBar from "../hospital/overview-chartBar.vue"
const workOrderTime = ref<ModelValueItf>();
const contentList = ref([
    {
        name: '直播场次',
        value: 3223
    },
    {
        name: '示教视频',
        value: 32
    },
    {
        name: '录播场次',
        value: 33
    },
])
const waitingSituationChartData = reactive({
    xData: ['1', '2', '3', '4', '5', '6', '7', '8'],
    yData: [
        { name: '场次', data: [30, 60, 170, 180, 120, 75, 100, 65] },
    ]
})
const barData = reactive({
    xData: [],
    yData: [
        {
            data: [10, 20, 30, 40],
            name: '',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ]
})
const receptionTrendsChartData = reactive({
    xData: ['4', '8', '12', '16', '20', '24h'],
    yData: [
        { name: '视频量', data: [20, 40, 66, 10, 84, 36, 44, 53], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
    ]
})
const receptionTrendsTime = ref<ModelValueItf>({
    timeType: 'TODAY',
    dateRange: ['']
});
const changeReceptionTrendsTime = (): void => {
    // TODO (张正) 接口调用
    const { timeType } = receptionTrendsTime.value
    if (timeType === 'TODAY') {
        receptionTrendsChartData.yData[0].data = [0, 50, 20, 200, 150, 20]
    } else if (timeType === 'THIS_WEEK') {
        receptionTrendsChartData.yData[0].data = [0, 150, 220, 400, 350, 20]
    } else if (timeType === 'THIS_MONTH') {
        receptionTrendsChartData.yData[0].data = [10, 350, 520, 700, 450, 80]
    } else if (timeType === 'THIS_YEAR') {
        receptionTrendsChartData.yData[0].data = [110, 1350, 1520, 1700, 550, 280]
    }
}
const changeHandleworkOrderTime = () => {
    waitingSituationChartData.xData = getXaxleData('THIS_PERID')
    waitingSituationChartData.yData[0].data = LiveStreamingSessions(workOrderTime.value.timeType)

    barData.xData = getXaxleData('')
    barData.yData[0].data = LiveStreamingSessions(workOrderTime.value.timeType)
};
let timer = null
let fakeIndex = 1
const fakeData = [
    [3250, 50, 48],
    [3290, 65, 51],
    [3310, 88, 67],
    [3345, 102, 82],
]
let fakeDataTime = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
onMounted(() => {
    timer = setInterval(() => {
        contentList.value[0].value = fakeData[fakeIndex][0]
        contentList.value[1].value = fakeData[fakeIndex][1]
        contentList.value[2].value = fakeData[fakeIndex][2]
        receptionTrendsTime.value.timeType = fakeDataTime[fakeIndex]
        workOrderTime.value.timeType = fakeDataTime[fakeIndex]
        changeReceptionTrendsTime()
        fakeIndex++
        if (fakeIndex > fakeData.length - 1) {
            clearInterval(timer)
            fakeIndex = 0
        }
    }, (window as any).config.pageLoopRequestTime)
})
onUnmounted(() => {
    clearInterval(timer)
})
</script>
<style lang="less" scoped>
.panel {

    .product-table {
        height: 260px;
    }

    .chart {
        height: 280px !important;
    }

    .content {
        text-align: center;
        color: #fff;
        font-size: 14px;

        .total-num {
            font-size: 16px;
        }
    }
}
</style>
  