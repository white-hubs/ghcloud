<template>
    <div class="power-factor" ref="powerFactorRef"></div>
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
interface yData {
    data: number[];
    name: string;
    color: string[]
}
interface Props {
    xData: string[];
    yData: yData[];
	xFontSize?: number;
	title?: string;
}
const props = withDefaults(defineProps<Props>(), {
	xFontSize: 12
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
    () => {
        initChart(powerFactorRef.value);
    }, { deep: true }
);
function setOption() {
    let series = props.yData.map(x => {
        return {
            name: x.name,
            data: x.data,
            type: 'bar',
            barWidth: 12,
            itemStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: x.color[0] // 0% 处的颜色
                    }, {
                        offset: 1,
                        color: x.color[1] // 100% 处的颜色
                    }], false),
                    shadowColor: 'rgba(0,160,221,1)',
                }
            },
            // label: {
            //     color: '#fff',
            //     show: true,
            //     position: 'top',
            //     formatter: '{c}'
            // }
        }
    })
    let option = {
		title: {
			text: props.title,
			textStyle: {
                lineHeight: 12,
				fontSize: 12,
				color: '#fff'
			}
		},
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: "10%",
            // right: '10%',
            top: '15%',
            // bottom: '10%'
			right: "3%",
			bottom: "10%",
        },
        xAxis: {
            type: 'category',
            data: props.xData,
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
            type: 'value',
            splitLine: {//分割线配置
                show: true,
                lineStyle: {
                    type: "dashed", //虚线
                    color: ["rgba(255,255,255,0.3)"],
                    width: 1,
                }
            },
            axisLabel: {
                show: true,
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 300,
            },
        },
        legend: {
            itemHeight: 5,
            itemWidth: 10,
            textStyle: {
                color: '#fff'
            }
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
  