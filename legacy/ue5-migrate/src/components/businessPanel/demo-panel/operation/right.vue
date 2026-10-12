<template>
    <div >
        <SubPanelTemplate title="设备告警统计">
            <template #extra>
                <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
                </DateInlineForm>
            </template>
            <DeviceStatistics @handel-click-itemize="handelClickDeviceItemize" style="height: 60px;"
                imgPath="overView21.png" :statistic="deviceStatisticsData1">
            </DeviceStatistics>
            <div class="chart">
                <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="运维工单">
            <template #extra>
                <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
                </DateInlineForm>
            </template>
            <DeviceStatistics style="height: 50px;" imgPath="overView21.png" :statistic="deviceStatisticsData">
            </DeviceStatistics>
            <div class="stacked-bar-chart">
                <StackedBar :xData="alarmStatisticsData.chartData.xData" :yData="alarmStatisticsData.chartData.yData" />
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="设备异常趋势">
            <template #extra>
                <DateInlineForm v-model:modelValue="deviceAbnormality" @search="changeHandleDeviceAbnormality">
                </DateInlineForm>
            </template>
            <div class="monitorPanelBox">
                <monitorPanel v-for="item in monitorPanelData" :key="item.name" :monitorPanelData="item"></monitorPanel>
            </div>
            <div class="chart">
                <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
                    :color="['#2989FF', '#FF6E23']"></stackedLine>
            </div>
        </SubPanelTemplate>
    </div>
    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
</template>
  
<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DeviceStatistics from "@/components/businessPanel/triage-queue/components/device-statistics.vue"
import StackedBar from '@/components/businessPanel/public/charts/stacked-bar/stacked-bar.vue';
import stackedLine from "@/components/businessPanel/public/charts/stackedLine/stackedLine.vue";
import monitorPanel from "@/components/businessPanel/hospital/monitor-panel.vue"
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { AbnormalEquipment } from '@/mock/surgical-demonstration'
import { getXaxleData } from '@/utils/common'
const overviewTime = ref<ModelValueItf>()
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({});
const deviceAbnormality = ref<ModelValueItf>()
const overPanelData = reactive({
    panelData1: 300,
    panelImg1: 'overView25.png',
    panelRatio1: 0,
    panelName1: '碳排量',

    panelData2: 405,
    panelImg2: 'overView28.png',
    panelRatio2: 0,
    panelName2: '用水量',

    panelData3: 623,
    panelImg3: 'overView26.png',
    panelRatio3: 0,
    panelName3: '用电量',

    panelData4: 524,
    panelImg4: 'overView27.png',
    panelRatio4: -1,
    panelName4: '燃气用量(m²)',
})
const alarmStatisticsData = reactive({
    chartData: {
        xData: ['隐患', '故障', '巡检', '维保', '委外', '改造'],
        yData: [
            { name: '已处理', value: [10, 10, 8, 6, 16, 10, 12], color: "#2AE8BD" },
            { name: '处理中', value: [10, 10, 8, 6, 16, 10, 12], color: "#2989FF" },
        ]
    }
})
const alarmStatisticsTime = ref<ModelValueItf>({
    timeType: '',
    dateRange: ['']
});
const closeModal = () => {
    alarmModalShow.value = false;
};
const handelClickDeviceItemize = (item?: any) => {
    alarmModalShow.value = true;
}
const changeAlarmStatisticsTime = (): void => {
    // TODO (张正) 接口调用
    const { timeType } = alarmStatisticsTime.value
    if (timeType === 'TODAY') {
        alarmStatisticsData.chartData.yData[0].value = [10, 10, 8, 6, 16, 10, 12]
        alarmStatisticsData.chartData.yData[1].value = [30, 20, 4, 16, 36, 20, 42]
    } else if (timeType === 'THIS_WEEK') {
        alarmStatisticsData.chartData.yData[0].value = [20, 20, 16, 12, 32, 20, 22]
        alarmStatisticsData.chartData.yData[1].value = [60, 40, 8, 32, 72, 40, 82]
    } else if (timeType === 'THIS_MONTH') {
        alarmStatisticsData.chartData.yData[0].value = [40, 22, 26, 20, 37, 22, 24]
        alarmStatisticsData.chartData.yData[1].value = [70, 45, 18, 60, 76, 44, 82]
    } else if (timeType === 'THIS_YEAR') {
        alarmStatisticsData.chartData.yData[0].value = [40, 23, 26, 20, 37, 22, 40]
        alarmStatisticsData.chartData.yData[1].value = [70, 46, 18, 70, 76, 54, 82]
    }
}
let alarmTotal = ref<number>(0)
const changeHandleOverviewTime = () => {
};
const pieData = ref([
    {
        name: '正常',
        value: 0,
        color: '#2AE8BD',
    },
    {
        name: '离线',
        value: 0,
        color: '#2989FF',
    },
    {
        name: '故障',
        value: 0,
        color: '#FFC700',
    },
    {
        name: '告警',
        value: 0,
        color: '#F14545',
    },
])
const barData = reactive({
    xData: ['安防报警', '消防报警', '电气报警', '入侵报警'],
    yData: [
        {
            data: [10, 20, 30, 40],
            name: '已处理',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        },
        {
            data: [18, 25, 48, 52],
            name: '处理中',
            color: ['rgba(42, 232, 189, 0.80)', 'rgba(42, 232, 189, 0)']
        },
    ]
})
const monitorPanelData = ref([
    {
        imgPath: 'overView5.png',
        value: 65,
        name: '告警次数'
    },
    {
        imgPath: 'overView29.png',
        value: 98,
        name: '故障次数'
    },
])
const lineData = reactive({
    title: "次",
    xData: ['4', '8', '12', '16', '20', '24'],
    yData: [
        {
            data: [1, 2, 4, 5, 6, 8, 7],
            name: "故障次数",
            colors: [
                {
                    offset: 0,
                    color: "rgba(41, 137, 255, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(41, 137, 255, 0.20)",
                },
            ],
        },
        {
            data: [10, 12, 14, 5, 86, 8, 7],
            name: "告警次数",
            colors: [
                {
                    offset: 0,
                    color: "rgba(255, 110, 35, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(255, 110, 35, 0.02)",
                },
            ],
        },
    ],
});
/**
 * 设备统计
 */
const deviceStatisticsData = reactive({
    title: "工单总量",
    total: 284,
    itemize: [
        {
            name: '已结束',
            label: "完成率",
            value: 198,
            key: "OFFLINE",
        }
    ]
});
const deviceStatisticsData1 = reactive({
    title: "告警总量",
    total: 33,
    itemize: [
        {
            name: '处理占比',
            label: "已处理",
            value: 10,
            key: "OFFLINE",
        }
    ]
});
let timer = null
const fakeData = [
    { total: 3345, offlineNum: 234 },
    { total: 3345, offlineNum: 635 },
    { total: 3345, offlineNum: 1201 },
    { total: 3345, offlineNum: 1549 },
    { total: 3345, offlineNum: 2134 },
]
let fakeIndex = 1
let panelData = [
    [900, -3.8, 631, -0.9, 945, -1.5, 854, -0.8],
    [1244, -2, 854, -1.8, 1633, -2.5, 1054, -3.0],
    [1451, -4.8, 1380, -2.9, 1954, -5.5, 1354, -2.8],
    [2046, -8.8, 1465, -5.9, 2540, -8.5, 1853, -5.8],
    [2468, -10.8, 1845, -6.4, 2752, -12.0, 2054, -7],
]
let pieChartData = [
    [18, 2, 5, 3],
    [25, 3, 4, 1],
    [30, 7, 2, 3],
    [35, 2, 4, 7],
    [40, 5, 4, 7],
]
let barChanrtData = [
    [[18, 22, 37, 44], [20, 28, 37, 40]],
    [[25, 28, 45, 50], [28, 32, 45, 50]],
    [[28, 30, 48, 58], [31, 36, 49, 57]],
    [[35, 39, 45, 60], [38, 40, 45, 60]],
    [[50, 61, 47, 65], [35, 45, 66, 68]],
]
const yData = [
    [7, 20, 42, 20, 52, 10, 50],
    [18, 28, 38, 48, 58, 68, 20, 40, 33, 12, 14, 52, 12, 10, 20, 30, 40, 50],
    [20, 50, 82, 70, 60, 50, 43, 52, 62, 47, 81, 32],
    [10, 12, 13, 14, 18, 24, 11, 12, 23],
    [7, 20, 42, 20, 52, 10, 50],
]
const yData1 = [
    [7, 20, 31, 20, 52, 10, 20],
    [31, 25, 12, 32, 41, 25, 20, 55, 22, 44, 44, 33, 55, 44, 66, 77, 88, 99],
    [20, 50, 82, 70, 60, 50, 41, 12, 12, 14, 50],
    [10, 12, 13, 14, 18, 24, 70, 60, 50],
    [7, 20, 31, 20, 52, 10, 20],
]
const xData = [
    [1, 2, 3, 4, 5, 6, 7],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 12],
    [1, 2, 3, 4, 5, 6, 7],
]
const changeHandleDeviceAbnormality = () => {
    lineData.xData = getXaxleData(deviceAbnormality.value.timeType)
    lineData.yData[0].data = AbnormalEquipment(deviceAbnormality.value.timeType)[0]
    lineData.yData[1].data = AbnormalEquipment(deviceAbnormality.value.timeType)[1]
}
let fakeTimeData = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
onMounted(() => {
    timer = setInterval(() => {
        deviceStatisticsData.total = fakeData[fakeIndex].total
        deviceStatisticsData.itemize[0].value = fakeData[fakeIndex].offlineNum
        overPanelData.panelData1 = panelData[fakeIndex][0]
        overPanelData.panelRatio1 = panelData[fakeIndex][1]
        overPanelData.panelData2 = panelData[fakeIndex][2]
        overPanelData.panelRatio2 = panelData[fakeIndex][3]
        overPanelData.panelData3 = panelData[fakeIndex][4]
        overPanelData.panelRatio3 = panelData[fakeIndex][5]
        overPanelData.panelData4 = panelData[fakeIndex][6]
        overPanelData.panelRatio4 = panelData[fakeIndex][7]

        barData.yData[0].data = barChanrtData[fakeIndex][0]
        barData.yData[1].data = barChanrtData[fakeIndex][1]

        alarmTotal.value = 0
        pieChartData[fakeIndex].forEach(item => alarmTotal.value += item)
        pieData.value[0].value = pieChartData[fakeIndex][0]
        pieData.value[1].value = pieChartData[fakeIndex][1]
        pieData.value[2].value = pieChartData[fakeIndex][2]
        pieData.value[3].value = pieChartData[fakeIndex][3]

        alarmStatisticsTime.value.timeType = fakeTimeData[fakeIndex]
        deviceAbnormality.value.timeType = fakeTimeData[fakeIndex]
        changeHandleDeviceAbnormality()
        changeAlarmStatisticsTime()
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
<style scoped lang="less">
.monitorPanelBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
}

.chart {
    flex: 1;
    height: 180px;
}

.stacked-bar-chart {
    width: 100%;
    height: 220px;
}

.monitorPanelBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>
  