<template>
    <div >
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
        <SubPanelTemplate title="碳排流向">
            <template #extra>
                <DateInlineForm v-model:modelValue="flowDirection" @search="changeHandleFlowDirectionTime">
                </DateInlineForm>
            </template>
            <div style="height: 250px;">
                <eSankey ref="esankey" :nodes="energydirectionNode" :links="energydirectionLinks" />
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="综合能耗分布">
            <template #extra>
                <DateInlineForm v-model:modelValue="appointmentTime" @search="changeAppointmentTime"></DateInlineForm>
            </template>
            <div class="flex-between">
                <PlanPie :pieData="monitorSituationPieData">
                    <div class="content">
                        <div class="total-num">{{ total }}</div>
                        <div>综合能耗</div>
                    </div>
                </PlanPie>
                <PieList :roundPieData="monitorSituationPieData"></PieList>
            </div>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import VisitingDataPic from "@/components/businessPanel/triage-queue/components/visiting-data-pic.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import eSankey from "@/components/businessPanel/public/charts/eSankey.vue"
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import { getAssetsImage } from '@/utils/getImage';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { OverviewSituation, consumptionDistribution } from '@/mock/energy-consumption'
import { getXDataByTime } from "@/utils/common"
const workOrderTime = ref<ModelValueItf>();
const energyConsumption = ref<ModelValueItf>();
const flowDirection = ref<ModelValueItf>();
const appointmentTime = ref<ModelValueItf>();
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
const energydirectionNode = ref([
    {
        "name": "二氧化碳", itemStyle: {
            color: 'rgba(112,134,243,0.5)'
        }
    },
    {
        "name": "电力排放", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "燃气排放", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "水利用排放", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "门诊", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "住院部", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "急诊", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "放射科", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "办公室", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "后勤", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
    {
        "name": "公共区域", itemStyle: {
            color: 'rgba(115,174,247,0.5)'
        }
    },
])
const energydirectionLinks = ref<any>([
    { "source": "二氧化碳", "target": "电力排放", "value": 6000 ,},
    { "source": "二氧化碳", "target": "燃气排放", "value": 2500 },
    { "source": "二氧化碳", "target": "水利用排放", "value": 500 },
    { "source": "电力排放", "target": "门诊", "value": 1500 },
    { "source": "电力排放", "target": "住院部", "value": 1400 },
    { "source": "燃气排放", "target": "公共区域", "value": 900 },
    { "source": "燃气排放", "target": "急诊", "value": 400 },
    { "source": "燃气排放", "target": "放射科", "value": 200 },
    { "source": "水利用排放", "target": "办公室", "value": 200 },
    { "source": "水利用排放", "target": "后勤", "value": 200 },
])
const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>(
    [
        { label: "电能", value: 30000, color: "#FFAB10" },
        { label: "水能", value: 2000, color: "#2F8DFF" },
        { label: "燃气", value: 748, color: "#F14545" },
        { label: "蒸汽", value: 6000, color: "#19F8F7" },
    ]
);
const total = ref(0)
const changeAppointmentTime = (): void => {
    // TODO (张正) 接口调用
    const { timeType } = appointmentTime.value
    monitorSituationPieData.value = consumptionDistribution(timeType)
    const appointmentTotalNum = monitorSituationPieData.value?.reduce(function (total, value) {
        return total + value.value;
    }, 0);
    total.value = 0
    monitorSituationPieData.value = monitorSituationPieData.value?.map(e => {
        total.value += e.value
        return {
            ...e,
            label: e.label + `（${(e.value / appointmentTotalNum * 100).toFixed(2)}%）`
        }
    })
}
const changeHandleworkOrderTime = () => {
    const data = OverviewSituation(workOrderTime.value.timeType)
    visitingData.value[0].value = data[0]
    visitingData.value[1].value = data[1]
};
const changeHandleEnergyConsumptionTime = () => {
    const { timeType } = energyConsumption.value
    receptionTrendsChartData.xData = getXDataByTime(energyConsumption.value.timeType)
    if (timeType === 'TODAY') {
        receptionTrendsChartData.yData[0].data = [0, 50, 20, 200, 150, 20]
    } else if (timeType === 'THIS_WEEK') {
        receptionTrendsChartData.yData[0].data = [0, 150, 220, 400, 350, 20, 10]
    } else if (timeType === 'THIS_MONTH') {
        receptionTrendsChartData.yData[0].data = [10, 350, 520, 700, 450, 80]
    } else if (timeType === 'THIS_YEAR') {
        receptionTrendsChartData.yData[0].data = [110, 1350, 1520, 1700, 550, 280]
    }
};
const changeHandleFlowDirectionTime = () => {

};
onMounted(() => {
    const { code } = JSON.parse(sessionStorage.getItem('GH-NowEnterprise'))
    if (code === 48055979 || code === 81860362) {
       energydirectionNode.value = [
            {
            "name": "二氧化碳", itemStyle: {
                color: 'rgba(112,134,243,0.5)'
            }
            },
            {
                "name": "电力排放", itemStyle: {
                    color: 'rgba(115,174,247,0.5)'
                }
            },
            {
                "name": "燃气排放", itemStyle: {
                    color: 'rgba(115,174,247,0.5)'
                }
            },
            {
                "name": "水利用排放", itemStyle: {
                    color: 'rgba(115,174,247,0.5)'
                }
            },
            {
                "name": "一号楼", itemStyle: {
                    color: 'rgba(115,174,247,0.5)'
                }
            },
            {
                "name": "二号楼", itemStyle: {
                    color: 'rgba(115,174,247,0.5)'
                }
            },
            {
                "name": "三号楼", itemStyle: {
                    color: 'rgba(115,174,247,0.5)'
                }
            },
            {
                "name": "四号楼", itemStyle: {
                    color: 'rgba(115,174,247,0.5)'
                }
            },
            {
                "name": "五号楼", itemStyle: {
                    color: 'rgba(115,174,247,0.5)'
                }
            },
            {
                "name": "六号楼", itemStyle: {
                    color: 'rgba(115,174,247,0.5)'
                }
            }
       ]
       energydirectionLinks.value = [
            { "source": "二氧化碳", "target": "电力排放", "value": 6000 ,},
            { "source": "二氧化碳", "target": "燃气排放", "value": 2500 },
            { "source": "二氧化碳", "target": "水利用排放", "value": 500 },
            { "source": "电力排放", "target": "一号楼", "value": 1500 },
            { "source": "电力排放", "target": "二号楼", "value": 1400 },
            { "source": "燃气排放", "target": "三号楼", "value": 900 },
            { "source": "燃气排放", "target": "四号楼", "value": 400 },
            { "source": "燃气排放", "target": "五号楼", "value": 200 },
            { "source": "水利用排放", "target": "六号楼", "value": 200 },
        ]
    }
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
</style>