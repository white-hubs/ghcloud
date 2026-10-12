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
  splitLine?:boolean;
  simple?:boolean;
}
const props = withDefaults(defineProps<Props>(), {
    pieData: ()=>[{name:'',value:0,color:''}],
    class: '',
    pieClass: '',
    radius: '',
    splitLine:true,
    simple:false
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
            //内容
            {
                name: 'Access From',
                type: 'pie',
                radius: ['65%', '80%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                padAngle:10,
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
}

.content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%)
}
</style>
  