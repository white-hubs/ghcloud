<!-- 停车管理 -->
<template>
    <div class="panel">
        <SubPanelTemplate title="车位总览">
            <OperateDays :value="parkingLotTotal.total" title="车位总数" :unit="'个'">
            </OperateDays>
            <div class="parkingLot">
                <circlePie :percent="circlePieData.percent" :selectedColor="circlePieData.selectedColor"
                    :blgColor="circlePieData.blgColor">
                    <div class="backgroundBox">
                        <img :src="getAssetsImage('vehicle.png')">
                    </div>
                </circlePie>
                <deviceModule :data-list="dataList"></deviceModule>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="车位总览">
            <!-- <template #bar>
                <div class="right-bar">查看更多》</div>
            </template> -->
            <DateInlineForm v-model:modelValue="timeType" @search="trafficFlowTrendData"></DateInlineForm>
            <div class="trafficBox">
                <traffic v-for="item in trafficList" :key="item.color" :trafficInfo="item"></traffic>
            </div>
            <stackedLine :smooth="0.5" :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData">
            </stackedLine>
        </SubPanelTemplate>
        <SubPanelTemplate title="停车时长分布">
            <DateInlineForm v-model:modelValue="timeType" @search="vehicleAnalysisInfo"></DateInlineForm>
            <pillar :x-data="barData.xData" :y-data="barData.yData" :blg-color="'rgba(33, 94, 167, 0.20)'"
                :bar-color="'#2981EA'"></pillar>
        </SubPanelTemplate>
    </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../../equipmentPanel/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from '@/components/businessPanel/public/dateInlineForm.vue'
import OperateDays from "../public/operateDays.vue";
import changeBar from "../public/changeBar.vue"
import traffic from '../public/traffic.vue'
import stackedLine from '../public/charts/stackedLine/stackedLine.vue'
import circlePie from "../public/charts/circlePie/circlePie.vue"
import deviceModule from '../public/deviceModule.vue'
import pillar from '../public/charts/pillar/pillar.vue'
import { getAssetsImage } from "../../../utils/getImage";
import { GetParkingOverview } from '@/api/models/park-management'
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { parkingData, trafficFlowTrend, parkingDuration } from '@/utils/requestData/parkingSpaceManage'
import { storeArea } from "@/piniaStore/area"
const piniaStoreArea = storeArea();
watch(() => piniaStoreArea.currentAreaId, () => {
    clearInterval(timer)
    timer = setInterval(() => {
        init()
    }, (window as any).config.pageLoopRequestTime)
    init()
})
let parkingLotTotal = reactive<GetParkingOverview>({
    empty: 0,
    total: 0,
    used: 0
})
let dataList = reactive([])
let timeType = ref()
let duration = ref()
let timer: any = reactive(null)

const trafficList = reactive([
    {
        color: '#2989FF',
        label: '驶入',
        value: 0
    },
    {
        color: '#FF6E23',
        label: '驶出',
        value: 0
    },
])
const lineData = reactive({
    title: '辆',
    xData: ['2月', '4月', '6月', '8月', '10月', '12月'],
    yData: [
        {
            data: [120, 132, 101, 134, 90, 230, 210],
            colors: [
                {
                    offset: 0,
                    color: 'rgba(255, 222, 165, 1)'
                },
                {
                    offset: 1,
                    color: 'rgba(255, 162, 0, 1)'
                }
            ]
        },
        {
            data: [220, 182, 191, 234, 290, 330, 310],
            colors: [
                {
                    offset: 0,
                    color: 'rgba(25, 248, 247, 1)'
                },
                {
                    offset: 1,
                    color: 'rgba(25, 248, 247, 0)'
                }
            ]
        },
    ]
})
const barData = reactive({
    xData: ['1月', '2月', '3月', '4月', '5月', '6月'],
    yData: [120, 200, 150, 80, 70, 110]
})
const circlePieData = reactive({
    percent: 50,
    selectedColor: '#2989FF',
    blgColor: '#19F8F7'
})

// 获取车位信息
const parkingLotInfo = async () => {
    let res = await parkingData()
    parkingLotTotal = res.parkingLotTotal
    circlePieData.percent = res.circlePieData
    dataList = res.dataList
}
// 获取车流趋势信息
const trafficFlowTrendData = async () => {
    let res = await trafficFlowTrend({ dimension: timeType.value.timeType  })
    lineData.xData = res.xdata
    trafficList[0].value = res.series[0].total
    trafficList[1].value = res.series[1].total
    lineData.yData[0].data = res.series[0].value
    lineData.yData[1].data = res.series[1].value
}
// 停车时长分布
const vehicleAnalysisInfo = async () => {
    let res = await parkingDuration({ dimension: duration.value.timeType  })
    barData.xData = res.xdata
    barData.yData = res.series[0].value
}
const init = () => {
    parkingLotInfo()
    trafficFlowTrendData()
    vehicleAnalysisInfo()
}

onMounted(() => {
    trafficFlowTrendData()
    vehicleAnalysisInfo()
    timer = setInterval(() => {
        init()
    }, (window as any).config.pageLoopRequestTime)
})
onBeforeUnmount(() => {
    clearInterval(timer)
})
</script>
<style lang="less" scoped>
.trafficBox {
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin-top: 12px;
}

.parkingLot {
    display: flex;
    justify-content: space-around;
    margin-top: 30px;
}

.backgroundBox {
    width: 86px;
    height: 86px;
    background: rgba(41, 137, 255, 0.302);
    box-shadow: inset 0px 0px 10px 0px rgba(41, 137, 255, 0.6), inset 0px 0px 6px 0px rgba(41, 137, 255, 0.8);
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    transform: translate(-50%, -50%);

    img {
        width: 36px;
        height: 28px;
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>