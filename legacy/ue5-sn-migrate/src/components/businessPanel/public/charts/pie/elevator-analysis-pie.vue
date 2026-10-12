<template>
  <div :class="['pie-box', props.class]">
    <div :class="['power-factor', props.pieClass]" ref="powerFactorRef"></div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>
  
<script lang="ts" setup>
import { watch, onMounted, ref, onBeforeUnmount } from "vue";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { GaugeChart } from 'echarts/charts';
import {
    LegendComponent,
    TitleComponent,
    TooltipComponent,
} from "echarts/components";
import "echarts-liquidfill";
echarts.use([PieChart, LegendComponent, TooltipComponent, TitleComponent, GaugeChart]);
const powerFactorRef = ref();
interface Props {
  pieData: {
    name:string,
    value:number,
    color:string
  }[];
  class: string;
  pieClass: string;
  radius?: string;
}
const props = withDefaults(defineProps<Props>(), {
    pieData: ()=>[{name:'',value:0,color:''}],
    class: '',
    pieClass: '',
    radius: '',
})

const emit = defineEmits(["clickbar"]);

let myChart: echarts.ECharts | null = null;
const initChart = (container?: HTMLElement) => {
    if (myChart){
      myChart.dispose()
    }
    myChart = echarts.init(container as HTMLElement);
    myChart.off('click')
    myChart.on("click", function (params) {
      emit("clickbar", params);
    });
    myChart.setOption(option());
};

watch(
    () => [...props.pieData],
    () => {
      initChart(powerFactorRef.value);
  },{deep:true}
);

const resize = ()=>{
  setTimeout(() => {
    initChart(powerFactorRef.value);
  }, 1500);
}
onMounted(() => {
  initChart(powerFactorRef.value);
  window.addEventListener("resize", resize);
});
onBeforeUnmount(()=>{
  window.removeEventListener('resize',resize)
})

// 4.配置项

const option = () => {
    let option = {
        series: [
            {
                type: 'pie',
                radius: ['85%', '100%'],
                silent: true,
                clockwise: true,
                startAngle: 90,
                z: 0,
                zlevel: 0,
                label: {
                    normal: {
                        position: "center",

                    }
                },
                data: [
                    {
                        value: 88,
                        itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
                    },
                    {
                        value: 5,
                        //这里的5是按照总值/50计算出来的，背景色为透明
                        itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
                    },
                    {
                        value: 88,
                        itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
                    },
                    {
                        value: 5,
                        //这里的5是按照总值/50计算出来的，背景色为透明
                        itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
                    },
                    {
                        value: 88,
                        itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
                    },
                    {
                        value: 5,
                        //这里的5是按照总值/50计算出来的，背景色为透明
                        itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
                    },
                    {
                        value: 88,
                        itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
                    },
                    {
                        value: 5,
                        //这里的5是按照总值/50计算出来的，背景色为透明
                        itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
                    },
                    {
                        value: 88,
                        itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
                    },
                    {
                        value: 5,
                        //这里的5是按照总值/50计算出来的，背景色为透明
                        itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
                    },
                    {
                        value: 88,
                        itemStyle: { normal: { color: 'rgba(255,255,255,0.1)' } },
                    },
                    {
                        value: 5,
                        //这里的5是按照总值/50计算出来的，背景色为透明
                        itemStyle: { normal: { color: 'rgba(0,0,0,0)' } },
                    },

                ]
            },
            /*仪表盘图，做中间刻度线*/
            {
                type: 'gauge',
                name: '业务指标',
                radius:props.radius?props.radius:`${180-(5/128*window.innerWidth)}%`,
                startAngle: '0',
                endAngle: '-359.99',
                splitNumber: '50',
                pointer: {
                    show: false
                },
                title: {
                    show: false
                },
                detail: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        width: 20,
                        opacity: 0
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: true,
                    length: 5,
                    lineStyle: {
                        color: 'rgba(255,255,255,0.5)',
                        width: 2,
                        type: 'solid',
                    },
                },
                axisLabel: {
                    show: false
                }
            },
            // 		内容
            {
                name: 'Access From',
                type: 'pie',
                radius: ['70%', '80%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                data: props.pieData.map(item =>{
                    return {
                        value:item.value,
                        name:item.name,
                        itemStyle:{
                            color:item.color
                        },
                        originData:item
                    }
                })
            }
        ]
    };
    return option;
};
</script>
<style lang="less" scoped>
#load-chart,
.power-factor {
  width: 100%;
  height: 100%;
  position: absolute;
}

.pie-box {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
}

.content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%)
}
</style>
  