<template>
    <div>
        <div class="text">
            <div>今日量<span>{{ dayData }}</span><span class="unit-box">( {{ unit }} )</span> </div>
            <div>设计量<span>{{ totalData }}</span> </div>
        </div>
        <div class="power-factor" ref="powerFactorRef"></div>
    </div>
</template>
  
<script lang="ts" setup>
// 1. 引入
import { nextTick, watch, onMounted, ref, reactive } from "vue";
import * as echarts from "echarts/core";
import { LineChart } from 'echarts/charts';
import { BarChart } from 'echarts/charts';
import { PictorialBarChart } from 'echarts/charts';
import {
    LegendComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
} from "echarts/components";
import "echarts-liquidfill";
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, LineChart, PictorialBarChart, BarChart]);
const powerFactorRef = ref();
interface Props {
    dayData: number;
    totalData: number;
    unit: string;
}
const props = withDefaults(defineProps<Props>(), {
    dayData: 0,
    totalData: 0,
    unit: '人次'
});

nextTick(() => {
    // 2. 容器
    const container = powerFactorRef.value as HTMLElement;
    if (container) initChart(container);
});
// 3. 初始化 echarts 实例, 将配置添加给 echarts 实例
let myChart: echarts.ECharts | null = null;
const initChart = (container?: HTMLElement) => {
    if (!myChart) myChart = echarts.init(container as HTMLElement);
    myChart.setOption(setOption());
};

watch(
    () => props.dayData,
    () => {
        initChart(powerFactorRef.value);
    }
);
function setOption() {
    let option = {
        "grid": {
            "left": "0%",
            right: '0%',
            "top": 10,
            "bottom": 10
        },
        tooltip: {
            show: false
        },
        "xAxis": {
            "max": 100,
            "splitLine": {
                "show": false
            },
            "axisLine": {
                "show": false
            },
            "axisLabel": {
                "show": false
            },
            "axisTick": {
                "show": false
            }
        },
        "yAxis": [{
            "type": "category",
            "inverse": false,
            "data": ['a2'],
            "axisLine": {
                "show": false
            },
            "axisTick": {
                "show": false
            },
            "axisLabel": {
                show: false,
            }
        },

        ],
        "series": [{ //内
            type: 'bar',
            barWidth: 60,
            legendHoverLink: false,
            silent: true,
            itemStyle: {
                color: '#2989FF', //底色

            },
            data: [(props.dayData / props.totalData * 100).toFixed(1)],
            z: 100
        },
        { //外
            type: 'bar',
            barWidth: 61,
            barGap: '-100%',
            label: {
                normal: {
                    show: false,
                }
            },
            legendHoverLink: false,
            silent: true,
            data: [100],
            itemStyle: {
                color: '#29D9B1',
                borderWidth: 1
            },
            z: 98
        },
        { //分隔
            "type": "pictorialBar",
            "animationDuration": 0,
            itemStyle: {
                color: "rgba(0,0,0,0.4)"
            },
            "symbolRepeat": "fixed",
            "symbolMargin": "2",
            symbol: 'rect',
            "symbolClip": true,
            "symbolSize": [2, 20],
            "symbolPosition": "start",
            "symbolOffset": [
                0, 0
            ],
            // "symbolBoundingData": 5000,
            "data": [100],
            z: 101
        }
        ]
    };
    return option;
}
onMounted(() => {
    initChart(powerFactorRef.value);
});
</script>
<style lang="less" scoped>
#load-chart,
.power-factor {
    width: 100%;
    height: 40px;
}

.text {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #fff;

    span {
        font-size: 16px;
        margin-left: 5px;
        font-weight: bold;
    }

    .unit-box {
        font-size: 12px;
    }
}
</style>
  