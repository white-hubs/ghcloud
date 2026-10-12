<template>
    <div >
        <SubPanelTemplate title="报警分析">
            <template #extra>
                <DateInlineForm :timeList="timeList" v-model:modelValue="alarmAnalysisTime"
                    @search="changeHandleAlarmAnalysisTime">
                </DateInlineForm>
            </template>
            <div class="elevator-analysis">
                <div class="chart">
                    <elevator-analysis-pie :pieData="pieData">
                        <div style="color: #fff;text-align: center;font-size: 14px;">{{ alarmTotal }}</div>
                        <div style="color: #fff;text-align: center;font-size: 14px;">报警总数</div>
                    </elevator-analysis-pie>
                </div>
                <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px;"></elevatorAnalysisList>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="故障类型TOP5">
            <template #extra>
                <DateInlineForm :timeList="timeList" v-model:modelValue="faultTypeTime" @search="changeHandlefaultTypeTime">
                </DateInlineForm>
            </template>
            <div class="chart">
                <barChart :colorLsit="['rgba(255, 199, 0, 0)', 'rgba(255, 199, 0, 1)']" :x-data="alarmType.xData"
                    :data="[{ color: '#FFC700', name: '', data: alarmType.yData }]" class="columnBox" />
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="电梯状态监测">
            <div class="chart" style="padding: 20px;">
                <monitorPie :yData="detectionData">
                    <div style="color: #fff;text-align: center;font-size: 18px;">{{ detectionTotal }}</div>
                    <div style="color: #fff;text-align: center;font-size: 16px;">设备总量</div>
                </monitorPie>
            </div>
            <monitor-list :monitorData="detectionData"></monitor-list>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import barChart from "../public/charts/bar/barChart.vue";
import monitorPie from "../public/charts/pie/monitor-pie.vue"
import monitorList from "../public/monitor-list.vue"
import { ModelValueItf } from "../public/types";
import { alarmAnalysis, AlarmTypeTop } from '@/mock/elevator-monitoring'
const timeList = [
    { label: "本周", value: "THIS_WEEK" },
    { label: "本月", value: "THIS_MONTH" },
    { label: "今年", value: "THIS_YEAR" }
]
const colors = ['#306CCA', '#3590FF', '#19F8F7', '#2AE8BD', '#FFC700', '#FF6E23']
const pieData = ref([
    {
        name: '安全回路不通',
        value: 0,
        color: '#306CCA',
        ratio: '0%'
    },
    {
        name: '启动允许错误',
        value: 0,
        color: '#3590FF',
        ratio: '0%'
    },
    {
        name: '关门到位丢失',
        value: 0,
        color: '#19F8F7',
        ratio: '0%'
    },
    {
        name: 'AC供电故障',
        value: 0,
        color: '#2AE8BD',
        ratio: '0%'
    },
    {
        name: '多次关门失败',
        value: 0,
        color: '#FFC700',
        ratio: '0%'
    },
    {
        name: 'DRB板故障',
        value: 0,
        color: '#FF6E23',
        ratio: '0%'
    },
])
const alarmTotal = ref(0)
const detectionTotal = ref(35)
const alarmType = reactive({
    xData: ['多次关门失败', 'DRB板故障', '安全回路不通', '启动允许错误', '关门到位丢失'],
    yData: [5, 8, 10, 15, 20]
})
const detectionColors = ['#2AE8BD', '#FFC700', '#3590FF']
const detectionData = ref([
    {
        name: '正常',
        color: '#2AE8BD',
        value: 23
    }, {
        name: '故障',
        color: '#FFC700',
        value: 10
    }, {
        name: '关闭',
        color: '#3590FF',
        value: 2
    },
])
const alarmAnalysisTime = ref<ModelValueItf>();
const faultTypeTime = ref<ModelValueItf>();
const changeHandleAlarmAnalysisTime = () => {
    let res = alarmAnalysis(alarmAnalysisTime.value.timeType)
    alarmTotal.value = 0
    res.forEach(item => {
        alarmTotal.value += item.value;
    })
    pieData.value = res.map(item => {
        return {
            name: item.name,
            value: item.value,
            color: item.color,
            ratio: (item.value / alarmTotal.value * 100).toFixed(1) + "%"
        }
    })
};
const changeHandlefaultTypeTime = () => {
    alarmType.yData = AlarmTypeTop(faultTypeTime.value.timeType)
};
let timer = null
let fakeIndex = 1
const fakeData = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']

const detection = [
    [12, 3, 2],
    [20, 6, 5],
    [32, 1, 5],
    [40, 4, 6],
    [18, 1, 4],
]
onMounted(() => {
    timer = setInterval(() => {
        alarmAnalysisTime.value.timeType = fakeData[fakeIndex]
        faultTypeTime.value.timeType = fakeData[fakeIndex]
        changeHandleAlarmAnalysisTime()
        changeHandlefaultTypeTime()
        detectionTotal.value = 0
        detection[fakeIndex].forEach(item => detectionTotal.value += item)
        detectionData.value[0].value = detection[fakeIndex][0]
        detectionData.value[1].value = detection[fakeIndex][1]
        detectionData.value[2].value = detection[fakeIndex][2]
        fakeIndex++
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
.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
}

.chart {
    width:300px;
    height: 220px;
}
</style>