<template>
    <div >
        <SubPanelTemplate title="报警总览">
            <template #extra>
                <DateInlineForm :timeList="timeList" v-model:modelValue="equipmentAlarmTime"
                    @search="changeHandleEquipmentAlarmTime">
                </DateInlineForm>
            </template>
            <div class="monitorPanel">
                <div class="monitorPanel-left">
                    <div class="bg">
                        <img :src="getAssetsImage('overView4.png')" alt="" />
                        <img class="rotate aniamtion-electric-fan" :src="getAssetsImage('overView21.png')" alt="" />
                    </div>
                </div>
                <div class="monitorPanel-right">
                    <div class="monitorPanel_title"> 报警总量</div>
                    <div class="count">
                        <count-to :startVal="0" :endVal="equipmentAlarmData.alarmNum" separator=""></count-to>
                    </div>
                    <div class="ringRatio">
                        <span>环比</span>
                        <!-- uptriangle 向上三角根据Prop改变 -->
                        <div :class="['downtriangle', equipmentAlarmData.alarmRatio > 0 && 'uptriangle']"></div>
                        <div :class="[equipmentAlarmData.alarmRatio > 0 ? 'up' : 'down']">{{ equipmentAlarmData.alarmRatio +
                            "%" }}</div>
                    </div>
                </div>
            </div>
            <div class="char" style="height: 155px;">
                <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData"
                    :showLegend="false" gridTop="15" :unit="{ x: '', y: '次数' }" />
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="报警级别">
            <template #extra>
                <DateInlineForm :timeList="timeList" v-model:modelValue="alarmLevelTime"
                    @search="changeHandleAlarmLevelTime">
                </DateInlineForm>
            </template>
            <div style="padding: 10px 0;">
                <GridContainer :data="deviceStatistic"></GridContainer>
                <div class="elevator-analysis">
                    <elevator-analysis-pie class="char" style="width: 140px;" :pieData="pieData" :radius="'75'">
                        <div style="color: #fff;text-align: center;font-size: 16px;">{{ alarmTotal }}</div>
                        <div style="color: #fff;text-align: center;font-size: 14px;">总量</div>
                    </elevator-analysis-pie>
                    <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px;"></elevatorAnalysisList>
                </div>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="报警处理">
            <template #extra>
                <DateInlineForm :timeList="timeList" v-model:modelValue="alarmProcessingTime"
                    @search="changeHandleAlarmProcessingTime">
                </DateInlineForm>
            </template>
            <div style="padding: 10px 0;">
                <GridContainer :data="deviceHandle"></GridContainer>
                <div style="height: 200px;">
                    <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
                </div>
            </div>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onBeforeUnmount } from 'vue'
import { statisticsLevel, getstatus, luzhouEquipmentAlarm } from "@/api/alarm";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import { getAssetsImage } from '@/utils/getImage';
import CountTo from "../public/count-to/count-to.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import GridContainer from '../public/gridContainer.vue';
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import overviewChartBar from "../hospital/overview-chartBar.vue"
import { ModelValueItf } from "../public/types";
const timer: any = ref(null);
const receptionTrendsChartData = reactive({
    xData: ['4', '8', '12', '16', '20', '24h'],
    yData: [
        { name:'报警次数', data: [10, 50, 30, 40, 66, 24, 21, 36, 41, 22], showSymbol: true, smooth: false, linearGradientColor: ['rgba(86, 142, 255, 1)', 'rgba(86, 142, 255, 0.1)'], lineColor: 'rgba(86, 142, 255, 1)' },
    ]
})
const timeList = [
    { label: "本周", value: "THIS_WEEK" },
    { label: "本月", value: "THIS_MONTH" },
    { label: "今年", value: "THIS_YEAR" }
]
let colorList = ['#EF424A', '#FF8C00', '#FFC700', '#3590FF',]
const deviceStatistic = ref([])
const deviceHandle = ref([])
let alarmTotal = ref<number>(334)
const barData = reactive({
    xData: ['安防报警', '消防报警', '电气报警', '入侵报警'],
    yData: [
        {
            name: '',
            data: [10, 20, 30, 40],
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ]
})
const pieData = ref([
    {
        name: '正常',
        value: 300,
        color: '#2AE8BD',
    },
    {
        name: '离线',
        value: 14,
        color: '#2989FF',
    },
    {
        name: '故障',
        value: 10,
        color: '#FFC700',
    },
    {
        name: '告警',
        value: 10,
        color: '#F14545',
    },
])
const equipmentAlarmData = reactive({
    alarmNum: 1,
    alarmRatio: 0,
})
const equipmentAlarmTime = ref<ModelValueItf>({
    timeType: 'THIS_WEEK',
        dateRange: ['']
})
const alarmLevelTime = ref<ModelValueItf>({
    timeType: 'THIS_WEEK',
        dateRange: ['']
})
const alarmProcessingTime = ref<ModelValueItf>({
    timeType: 'THIS_WEEK',
        dateRange: ['']
})
// 报警级别
const alarmLevelEvent = async () => {
    let params = {
        period: alarmLevelTime.value.dateRange.join(","),
        type: alarmLevelTime.value.timeType,
    };
    let res = await statisticsLevel(params)
    alarmTotal.value = 0
    deviceStatistic.value = res.map((item, index) => {
        alarmTotal.value += item.alarmNum
        return {
            alarmStatusName: item.name + '报警',
            alarmNum: item.alarmNum,
            color: colorList[index]
        }
    });
    pieData.value = res.map((item, index) => {
        return {
            name: item.name + '报警',
            value: item.alarmNum,
            color: colorList[index]
        }
    });
}
// 报警处理
const getOrderStatistic = () => {
    getstatus({
        period: alarmProcessingTime.value.dateRange.join(","),
        type: alarmProcessingTime.value.timeType,
    }).then(res => {
        barData.xData.length = 0
        barData.yData[0].data.length = 0
        let colorData = ['#29C2FF','#FFC700','#19F8F7','#00F27B']
        deviceHandle.value = res.alarmStatusStatistics.map((item, index) => {
            barData.xData.push(item.alarmStatusName)
            barData.yData[0].data.push(item.alarmNum)
            return {
                alarmStatusName: item.alarmStatusName,
                alarmNum: item.alarmNum,
                color: colorData[index]
            }
        });
    })
};
// 设备报警
const getDeviceAlarmInfo = async () => {
    let res = await luzhouEquipmentAlarm({
        period: equipmentAlarmTime.value.dateRange.join(","),
        type: equipmentAlarmTime.value.timeType
    })
    
    equipmentAlarmData.alarmNum = res.alarmTargetStatistics.alarmNum
    equipmentAlarmData.alarmRatio = res.alarmTargetStatistics.chainRatio
    receptionTrendsChartData.xData.length = 0
    receptionTrendsChartData.yData[0].data.length = 0
    let unit=''
    if (equipmentAlarmTime.value.timeType==="TODAY") {
        unit='时'
    }else if (equipmentAlarmTime.value.timeType==="THIS_WEEK") {
        unit='日'
    }else if (equipmentAlarmTime.value.timeType==="THIS_MONTH") {
        unit='日'
    }else if (equipmentAlarmTime.value.timeType==="THIS_YEAR") {
        unit='月'
    }
    res.alarmTargetTrend.forEach(item => {
        receptionTrendsChartData.xData.push(item.period+unit)
        receptionTrendsChartData.yData[0].data.push(item.alarmNum)
    })
}
const changeHandleEquipmentAlarmTime = () => {
    getDeviceAlarmInfo()
}
const changeHandleAlarmLevelTime = () => {
    alarmLevelEvent();
}
const changeHandleAlarmProcessingTime = () => {
    getOrderStatistic()
}
onMounted(() => {
    equipmentAlarmTime.value.timeType = 'THIS_WEEK'
    alarmProcessingTime.value.timeType = 'THIS_WEEK'
    alarmLevelTime.value.timeType = 'THIS_WEEK'
    // timer.value = setInterval(() => {
    //     init();
    // }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
    clearInterval(timer.value);
});
</script>
<style scoped lang="less">
.monitorPanel {
    display: flex;
    align-items: center;

    .monitorPanel-left {
        .bg {
            position: relative;
            width: 100px;
            height: 80px;
            perspective: 200;

            img {
                width: 100%;
                height: 100%;
            }

            .rotate {
                position: absolute;
                width: 35px;
                height: 35px;
                left: 35px;
                top: 8px;
                transform: rotateY(45deg);
            }
        }
    }

    .monitorPanel-right {
        width: 100%;
        height: 48px;
        background-image: url("/resource/v1/ue5-migrate/assets/images/overView6.png");
        background-repeat: no-repeat;
        background-size: 100% 100%;
        color: #d0deee;
        display: flex;
        align-items: center;
        padding: 0 10px;

        .monitorPanel_title {
            font-size: 12px;
            font-family: Source Han Sans CN-Medium, Source Han Sans CN;
            font-weight: 500;
            color: #FFFFFF;
            margin-right: 5px;
        }

        .count {
            font-size: 22px;
            color: #EFF7FF;
            font-weight: bold;
        }
    }
}

.ringRatio {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    margin-left: 6px;

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

.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    align-items: center;
}

.char {
    height: 157px;
}
</style>