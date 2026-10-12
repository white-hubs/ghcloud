<template>
    <div class="power-factor" ref="powerFactorRef"></div>
</template>
  
<script lang="ts" setup>
// 1. 引入
import { nextTick, watch, onMounted, ref, reactive } from "vue";
import * as echarts from "echarts/core";
import { LineChart } from 'echarts/charts';
import { BarChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from "echarts/renderers";
import { PictorialBarChart } from 'echarts/charts';
import {
    LegendComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
} from "echarts/components";
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, LineChart, PictorialBarChart, BarChart, PieChart, CanvasRenderer]);
const powerFactorRef = ref();
interface Props {
    yData: any[];
    xData: any[];
    showLegend?: boolean,
    legendY?:string
}
const props = withDefaults(defineProps<Props>(), {
    yData: () => [],
    xData: () => [],
    showLegend: true,
    legendY:'bottom'
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
    () => [...props.yData],
    (newVal) => {
        initChart(powerFactorRef.value);
    }, { deep: true }
);
function setOption() {
    let series = props.yData.map(x => {
        return {
            name: x.name,
            type: 'bar',
            stack: 'total',//数据堆叠
            label: {//图形上的文本标签
                show: false//是否显示标签
            },
            itemStyle: {
                color: x.color,
            },
            emphasis: {//高亮的图形样式和标签样式
                focus: 'series'//聚焦当前高亮的数据所在的系列的所有图形
            },
            data: x.data
        }
    })
    let option = {
        tooltip: {//提示框
            trigger: 'axis',//坐标轴触发
            axisPointer: {//坐标轴指示器配置项
                // Use axis to trigger tooltip
                type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow',阴影类型
            }
        },
        legend: {
            itemWidth: 15,//图例标记的图形宽度
            itemHeighe: 2,//图例标记的图形高度
            show: props.showLegend,
            textStyle: {
                color: '#fff'
            },
            y: props.legendY
        },//图例
        grid: {//网格
            left: '3%',//组件离容器左侧的距离
            right: '8%',//组件离容器右侧的距离
            bottom: props.showLegend ? '15%' : '5%',//组件离容器下侧的距离
            top: '5%',
            containLabel: true// 区域是否包含坐标轴的刻度标签
        },
        xAxis: {
            type: 'value',//坐标轴类型：数值轴
            splitLine: {
            show: true,
            lineStyle: {
            type: "dashed",//虚线
            color: ["rgba(255,255,255,0.3)"],
            width: 1,
            },
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: "#fff",
                    width: 0,
                    type: "solid"
                }
            },
        },
        yAxis: {
            type: 'category',//坐标轴类型：类目轴
            data: props.xData,
            axisLabel: {
                formatter: val => {
                return val.substring(0, 4) + '...'
                }
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: "#fff",
                    width: 0,
                    type: "solid"
                }
            },
        },
        series
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
    height: 100%;
}
</style>
  