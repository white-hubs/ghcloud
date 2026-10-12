<template>
    <div class="box">
        <div class="power-factor" ref="linePillar">

        </div>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>
 
<script lang="ts" setup>
// 1. 引入
import { nextTick, watch, onMounted, ref } from 'vue';
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts';
import { GaugeChart } from 'echarts/charts';
import { LineChart, BarChart } from "echarts/charts"
import { LegendComponent, TitleComponent, TitleComponentOption, TooltipComponent, GridComponent } from 'echarts/components'
echarts.use([
    PieChart,
    GaugeChart,
    BarChart,
    LineChart,
    LegendComponent,
    TooltipComponent,
    TitleComponent,
    GridComponent
])
const linePillar = ref()
interface props {
    percent: number,
    selectedColor: string,
    blgColor: string
}
const props = withDefaults(defineProps<props>(), {
    percent: 50,
    selectedColor: '#2989FF',
    blgColor: '#19F8F7'
})

nextTick(() => {
    // 2. 容器
    const container = linePillar.value as HTMLElement;
    if (container) initChart(container);
});
// 3. 初始化 echarts 实例, 将配置添加给 echarts 实例
let myChart: echarts.ECharts | null = null;
const initChart = (container?: HTMLElement) => {
    if (!myChart) myChart = echarts.init(container as HTMLElement);
    myChart.setOption(setOption());
};

watch(
    () => props.percent,
    newVal => {
        initChart(linePillar.value);
    },
);
onMounted(() => {
    initChart(linePillar.value);
})
// 4.配置项
const setOption = () => {
    const option = {
        backgroundColor: 'rgba(11, 21, 33, 0)',
        tooltip: {
            show: false,
            formatter: "{a} <br/>{b} : {c}%",
        },
        series: [
            {
                name: "最外部进度条",
                type: "pie",
                radius: ["95%", "95%"],
                avoidLabelOverlap: false,
                startAngle: 210,
                color: [
                    {
                        type: "linear",
                        x: 1,
                        y: 0,
                        x2: 0,
                        y2: 0,
                        colorStops: [
                            {
                                offset: 0,
                                color: props.selectedColor, // 0% 处的颜色
                            },
                            {
                                offset: 1,
                                color: props.selectedColor, // 100% 处的颜色
                            },
                        ],
                    },
                    "transparent",
                ],
                hoverAnimation: false, //是否开启 hover 在扇区上的放大动画效果。
                legendHoverLink: false, //是否启用图例 hover 时的联动高亮。
                label: {
                    normal: {
                        show: false,
                        position: "center",
                    },
                    emphasis: {
                        show: false,
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                    },
                },
                data: [
                    {
                        value: 66,
                        name: "1",
                        itemStyle: {
                            borderWidth: 3,
                            borderColor: "#4C7FDB",
                        },
                    },
                    {
                        value: 34,
                        name: "2",
                        itemStyle: {
                            borderWidth: 0,
                            borderColor: "transparent",
                        },
                    },
                ],
            },
            {
                name: "渐变数据环整个",
                type: "pie",
                radius: ["70%", "87%"],
                avoidLabelOverlap: false,
                startAngle: 210,
                color: [
                    {
                        type: "linear",
                        x: 1,
                        y: 0,
                        x2: 0,
                        y2: 0,
                        colorStops: [
                            {
                                offset: 0,
                                color: props.selectedColor, // 0% 处的颜色
                            },
                            {
                                offset: 1,
                                color: props.selectedColor, // 100% 处的颜色
                            },
                        ],
                    },
                    "transparent",
                ],
                hoverAnimation: false, //是否开启 hover 在扇区上的放大动画效果。
                legendHoverLink: false, //是否启用图例 hover 时的联动高亮。
                label: {
                    normal: {
                        show: false,
                        position: "center",
                    },
                    emphasis: {
                        show: false,
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                    },
                },
                data: [
                    {
                        value: 66,
                        name: "1",
                        itemStyle: {
                            borderWidth: 3,
                            borderColor: "#4C7FDB",
                        },
                    },
                    {
                        value: 34,
                        name: "2",
                        itemStyle: {
                            borderWidth: 0,
                            borderColor: "transparent",
                        },
                    },
                ],
            },
            {
                name: "环形百分比",
                type: "pie",
                radius: ["70%", "87%"],
                avoidLabelOverlap: false,
                startAngle: -30,
                color: [props.blgColor, "transparent", "transparent"],
                hoverAnimation: false,
                legendHoverLink: false,
                clockwise: false, //饼图的扇区是否是顺时针排布。
                itemStyle: {
                    show: false,
                    normal: {
                        borderColor: "transparent",
                        borderWidth: "20",
                    },
                    emphasis: {
                        borderColor: "transparent",
                        borderWidth: "20",
                    },
                },
                z: 10,
                label: {
                    normal: {
                        show: false,
                        position: "center",
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                    },
                },
                data: [
                    {
                        value: ((100 - props.percent) * 240) / 360,
                        name: "",
                    },
                    {
                        value: 1,
                        name: "",
                    },
                    {
                        value: 100 - ((100 - props.percent) * 270) / 360,
                        name: "",
                    },
                ],
            },
        ],
    };
    return option
}
</script>
<style lang="less" scoped>
.box {
    position: relative;
}

#load-chart,
.power-factor {
    width: 172px;
    height: 146px;
}
</style>