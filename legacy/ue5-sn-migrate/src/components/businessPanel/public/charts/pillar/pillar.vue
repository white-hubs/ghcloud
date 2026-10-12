<template>
    <div class="power-factor" ref="powerFactorRef"></div>
</template>
 
<script lang="ts" setup>
// 1. 引入
import { watch, onMounted, ref } from 'vue';
import * as echarts from 'echarts/core'
import { LegendComponent, TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import type { textConfig, legend, lineStyle, axisLine } from './char'
import { BarChart } from 'echarts/charts';
echarts.use([
    BarChart,
    LegendComponent,
    TooltipComponent,
    TitleComponent,
    GridComponent
])
const powerFactorRef = ref()

interface Props {
    xData: string[],
    yData: number[],
    barColor?: string,
    blgColor?: string,
    title?: textConfig,//标题
    legend?: legend,//图例
    lineStyle?: lineStyle,//Y轴背景线
    axisLineX?: axisLine,//X轴样式
    axisLineY?: axisLine,//Y轴样式
}
const props = withDefaults(defineProps<Props>(), {
    xData: () => [],
    yData: () => [],
    barColor: '#2981EA',
    blgColor: 'rgba(33, 94, 167, 0.20)',
    title: () => {
        return {
            text: ' ',
            textStyle: {
                color: '',
            },
            padding: [0, 0, 0, 0]
        }
    },
    legend: () => {
        return { data: [] }
    },
    lineStyle: () => {
        return {
            color: ['#FFFFFF'],
            width: 1,
            type: 'dashed',
        }
    },
    axisLineX: () => {
        return {
            lineStyle: {
                color: '#fff',
                width: 1
            }
        }
    },
    axisLineY: () => {
        return {
            lineStyle: {
                color: '#fff',
                width: 1
            }
        }
    },

})
let myChart: echarts.ECharts | null = null;
const initChart = (container?: HTMLElement) => {
    if (!myChart) myChart = echarts.init(container as HTMLElement);
    myChart.setOption(setOption());
};

watch(
    () => [...props.yData],
    newVal => {
        initChart(powerFactorRef.value);
    },
);
// 4.配置项
function setOption() {
    return {
        title: props.title,
        grid: { // 让图表占满容器
            top: "25px",
            left: "30px",
            right: "20px",
            bottom: "20px"
        },
        legend: props.legend,
        xAxis: {
            type: 'category',
            data: props.xData,
            axisLine: props.axisLineX
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: true,
                lineStyle: props.lineStyle,
            },
            axisLine: props.axisLineY
        },
        series: [
            {
                data: props.yData,
                type: 'bar',
                showBackground: true,
                barWidth: '20%',
                backgroundStyle: {
                    color: props.blgColor
                },
                itemStyle: {
                    color: props.barColor
                }
            }
        ]
    };
}
onMounted(() => {
    initChart(powerFactorRef.value);
})
</script>
<style lang="less" scoped>
#load-chart,
.power-factor {
    width: 100%;
    height: 170px;
}
</style>