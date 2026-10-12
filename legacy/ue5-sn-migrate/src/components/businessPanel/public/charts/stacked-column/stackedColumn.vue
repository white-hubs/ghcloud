<template>
  <div class="power-factor" ref="powerFactorRef"></div>
</template>

<script lang="ts" setup>
// 1. 引入
import { nextTick, watch, onMounted, ref, reactive } from "vue";
import * as echarts from "echarts/core";
import { LineChart,PictorialBarChart,BarChart } from 'echarts/charts';
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from "echarts/components";
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, PictorialBarChart,LineChart,BarChart]);
const powerFactorRef = ref();
const props = defineProps({
  // title: {
  //   type: String,
  //   required: true,
  // },
  xData: {
    type: [] as any,
    required: true,
  },
  yData: {
    type: [] as any,
    required: true,
  },
  unit: {
    type: String,
    default: "",
  },
  // smooth: {
  //   type: Number,
  // },
  // color: {
  //   type: Array,
  // },
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
  () => [...props.xData],
  (newVal) => {
    initChart(powerFactorRef.value);
  }
);
const setOption = ()=> {
  const series = props.yData.map(item=>{
    return {
      name: item.name,
      type: 'bar',
      data: item.data,
      stack: 'Ad',
      emphasis: {
        focus: 'series'
      },
      barMaxWidth: '40',
    }
  })
  const option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: function (params) {
    var relVal = params[0].name
    for (var i = 0, l = params.length; i < l; i++) {
      const value =  params[i].value ? params[i].value : '0'
      relVal += '<br/>' + params[i].marker  + params[i].seriesName + value + props.unit
    }
    return relVal
  }
  },
  legend: {
    textStyle:{
      color:'#fff'
    },
    bottom:'bottom'
  },
  grid: {
    top:'3%',
    left: '3%',
    right: '4%',
    bottom: '20%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: props.xData,
      splitLine: {
        color: ["rgba(255,255,255,0.3)"],
      },
      axisLabel: {
					show: true,
					color: "#ffffff",
					fontSize: 12,
					fontWeight: 300,
          formatter:function(value) {
            let val = ''
            if (value.length > 2) {
              val = value.slice(0, 2) + '...'
              return val
            } else {
              return value
            }
          }
				},
    }
  ],
  yAxis: [
    {
      type: 'value',
      axisLabel: {
					show: true,
					color: "#ffffff",
					fontSize: 12,
					fontWeight: 300,
				},
    }
  ],
  series
};
  return option
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
