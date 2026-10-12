<template>
    <div class="panel">
        <SubPanelTemplate title="电梯统计" class="supply-merchant">
            <displayPanel :bg-img="'overView16.png'" :content-list="contentList"></displayPanel>
        </SubPanelTemplate>
        <SubPanelTemplate title="运行分析">
            <template #extra>
                <DateInlineForm :timeList="timeList" v-model:modelValue="operationsAnalysis.operationsAnalysisTime"
                    @search="changeHandleOperationsAnalysis">
                </DateInlineForm>
            </template>
            <div class="chart">
                <overviewChartBar :title="'次'" :xData="barData.xData" :yData="barData.yData" :x-font-size="10.5"></overviewChartBar>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="故障检修趋势">
            <template #extra>
                <DateInlineForm v-model:modelValue="faultTime" @search="changeHandleFaultTime">
                </DateInlineForm>
            </template>
            <div class="chart">
                <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
                    :color="['#2989FF', '#FF6E23']"></stackedLine>
            </div>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import { ModelValueItf } from "../public/types";
import stackedLine from "../public/charts/stackedLine/stackedLine.vue";
import displayPanel from "../public/display-panel.vue"
import overviewChartBar from "../hospital/overview-chartBar.vue"
import { getXaxleData } from '@/utils/common'
import { Troubleshooting, OperationsAnalysis } from '@/mock/elevator-monitoring'
const contentList = ref([
    {
        name: '客用电梯',
        value: 12
    },
    {
        name: '货用电梯',
        value: 3
    },
    {
        name: '专用电梯',
        value: 6
    },
])
const operationsAnalysis = reactive<{ operationsAnalysisTime: ModelValueItf; operationsAnalysisXdata: string[]; operationsAnalysisYdata: any }>({
    operationsAnalysisTime: {
        timeType: 'THIS_YEAR',
        dateRange: ['']
    },
    operationsAnalysisXdata: ['4:00', '8:00', '12:00', '16:00', '20:00', '24:00'],
    operationsAnalysisYdata: [
        {
            data: [10, 20, 30, 40],
            name: '',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ],
});
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
const timeList = [
    { label: "本周", value: "THIS_WEEK" },
    { label: "本月", value: "THIS_MONTH" },
    { label: "今年", value: "THIS_YEAR" }
]
const lineData = reactive({
    title: "次",
    xData: ['4', '8', '12', '16', '20', '24'],
    yData: [
        {
            data: [1, 2, 4, 5, 6, 8, 7],
            name: "维修次数",
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
const faultTime = ref<ModelValueItf>()
const changeHandleOperationsAnalysis = () => {
    operationsAnalysis.operationsAnalysisXdata = getXaxleData(operationsAnalysis.operationsAnalysisTime.timeType)
    operationsAnalysis.operationsAnalysisYdata = OperationsAnalysis(operationsAnalysis.operationsAnalysisTime.timeType)

    barData.xData = getXaxleData(operationsAnalysis.operationsAnalysisTime.timeType)
    barData.yData[0].data = OperationsAnalysis(operationsAnalysis.operationsAnalysisTime.timeType)
};
const changeHandleFaultTime = () => {
    lineData.xData = getXaxleData(faultTime.value.timeType)
    lineData.yData[0].data = Troubleshooting(faultTime.value.timeType)[0]
    lineData.yData[1].data = Troubleshooting(faultTime.value.timeType)[1]
};
let timer = null
const fakeData = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']

let fakeIndex = 1
onMounted(() => {
        faultTime.value.timeType = fakeData[fakeIndex]
        changeHandleOperationsAnalysis()
        changeHandleFaultTime()
        fakeIndex++
        if (fakeIndex > fakeData.length - 1) {
            fakeIndex = 0
            clearInterval(timer)
        }
})

</script>
<style scoped lang="less">
.chart {
    height: 260px;
}
</style>