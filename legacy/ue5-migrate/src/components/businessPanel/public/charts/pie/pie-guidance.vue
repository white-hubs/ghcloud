<template>
    <div class="power-factor" ref="powerFactorRef"></div>
</template>
  
<script lang="ts" setup>
// 1. 引入
import { nextTick, watch, onMounted, ref, reactive } from "vue";
import * as echarts from "echarts/core";
import { LineChart } from 'echarts/charts';
import { BarChart, PieChart } from 'echarts/charts';
import { PictorialBarChart } from 'echarts/charts';
import {
    LegendComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
} from "echarts/components";
import "echarts-liquidfill";
import { calcFontSize } from "@/utils/common";
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, LineChart, PictorialBarChart, BarChart, PieChart]);
const powerFactorRef = ref();
const props = defineProps({
    yData: {
        type: [] as any,
        required: true,
    },
    position: {
        type: String,
        default: 'outside'
    },
    radius:{
        type:Array,
        default:['40%', '60%']
    },
   height:{
        type:String,
        default: '100%'
    },
    orient:{
        type: String,
        default: 'horizontal'
    },
    legendPosition:{
        type:Object,
        default:()=>{return {left:'center',bottom:'0px'}}
    },
    width: {
        type: String,
        default: '100%'
    },
    chartPosition:{
        type: String,
        default: 'center'
    },
    showLegend:{
        type: Boolean,
        default: true
    },
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
    let option = {
        title: {
            text: '',
            left: 'center',
            textStyle: {
                color: '#999',
                fontWeight: 'normal',
                fontSize: 14
            }
        },
        legend: {
            show:props.showLegend,
            bottom: props.legendPosition.bottom, // 修改legend距离底部的距离为10px
            left: props.legendPosition.left,
            textStyle: {
                color: '#fff',  // 图例文字颜色
                fontSize: calcFontSize(12),  // 图例文字大小
            },
            orient:props.orient
        },
        grid: {//网格
            left: '0%',//组件离容器左侧的距离
            right: '0%',//组件离容器右侧的距离
            bottom: '0%',//组件离容器下侧的距离
            top: '0%',
        },
        series: {
            type: 'pie',
            radius:props.radius,
            top: '1%',
            height: props.height,
            left: props.chartPosition,
            width: props.width,
            label: {
                alignTo: 'edge',
                formatter: '{name|{b}}\n{time|{d} %}',
                minMargin: 5,
                edgeDistance: 10,
                lineHeight: 15,
                color: '#fff',
                position:props.position,
                rich: {
                    time: {
                        fontSize: calcFontSize(10),
                        color: '#fff'
                    }
                }
            },
            labelLine:{
              lineStyle:{
                color:'#fff'
              }
            },
            data: props.yData,
        }
    }
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
    min-height: 180px;
}
</style>
  