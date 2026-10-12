<template>
    <div class="panel">
        <SubPanelTemplate title="今日门诊情况">
            <DeviceStatistics imgPath="overView33.png" :statistic="deviceStatisticsData"></DeviceStatistics>
            <div class="chart">
                <barChart :title="'人次'" :unit="'人'" :x-data="alarmType.xData"
                    :data="[{ color: '#1890FF', name: '', data: alarmType.yData }]" class="columnBox" />
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="急诊接诊情况">
            <template #extra>
                <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
            </template>
            <div class="monitorPanelBox">
                <monitorPanel v-for="item in monitorPanelData" :key="item.name" :monitorPanelData="item"></monitorPanel>
            </div>
            <div class="chart">
                <overviewChartBar :title="'人次'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="病房床位情况">
            <div class="faultBox">
                <LightingRound class="LightingRoundBox" :data="roundData"></LightingRound>
                <div class="faultBox-right">
                    <faultBox :data="faultData"></faultBox>
                </div>
            </div>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import overviewChartBar from "../hospital/overview-chartBar.vue"
import monitorPanel from "../hospital/monitor-panel.vue"
import LightingRound from "@/components/businessPanel/intelligent-lighting/components/lighting-round.vue";
import faultBox from "../operation/faultBox.vue"
import DeviceStatistics from "@/components/businessPanel/triage-queue/components/device-statistics.vue"
import { OutpatientSituation, ReceptionStatus, BedSituation } from '@/mock/hospital'
import { getXaxleData } from "@/utils/common"
import { ModelValueItf } from '../../public/types'
const deviceStatisticsData = reactive({
    title: "挂号总数",
    total: 540,
    itemize: [
        {
            label: "就诊",
            value: 380,
            key: "OFFLINE",
            name: '就诊率',
        },
    ]
});
const workOrderTime = ref<ModelValueItf>();
const alarmType = reactive({
    xData: ['挂号', '签到', '候诊', '就诊'].reverse(),
    yData: [380, 80, 30, 540]
})
const monitorPanelData = ref([
    {
        imgPath: 'overView32.png',
        value: 885,
        name: '接诊总量'
    },
    {
        imgPath: 'overView31.png',
        value: 395,
        name: '日均接诊量'
    },
])
const roundData = reactive([
    {
        statistic: { title: '使用率', total: ' 67.44%' },
    }
])
const faultData = ref([
    {
        color: '#2989FF',
        name: '床位数',
        value: 900
    },
    {
        color: '#FFC700',
        name: '已使用',
        value: 607
    },
])
const barData = reactive({
    xData: ['5-29', '5-30', '5-31', '6-01', '6-02', '6-03', '6-04'],
    yData: [
        {
            data: [10, 20, 30, 40, 50, 60, 70],
            name: '人次',
            color: ['rgba(25, 248, 247, 0.80)', 'rgba(25, 248, 247, 0)']
        }
    ]
})
const changeHandleworkOrderTime = () => {
    // requestFlowNumberStatistic();
    barData.xData = getXaxleData(workOrderTime.value.timeType)
    barData.yData[0].data = ReceptionStatus(workOrderTime.value.timeType)
};
let timer = null
let fakeIndex = 1
let fakeData = ["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_YEAR"]
onMounted(() => {
    timer = setInterval(() => {
        const { yData, situation } = OutpatientSituation(fakeIndex)
        alarmType.yData = yData
        // deviceStatisticsData.total = situation.total
        // deviceStatisticsData.itemize[0].value = situation.offlineNum
        barData.yData[0].data = ReceptionStatus(fakeData[fakeIndex])
        faultData.value = BedSituation(fakeIndex)
        roundData[0].statistic.total = (faultData.value[1].value / faultData.value[0].value * 100).toFixed(2) + '%'
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
.chart {
    height: 220px;
}

.monitorPanelBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.faultBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;

    .LightingRoundBox {
        flex: 1
    }
}
</style>