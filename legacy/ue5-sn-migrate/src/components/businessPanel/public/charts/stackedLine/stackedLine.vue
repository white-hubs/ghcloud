<template>
  <div class="power-factor" ref="powerFactorRef"></div>
</template>

<script lang="ts" setup>
// 1. 引入
import { nextTick, watch, onMounted, ref, reactive } from "vue";
import * as echarts from "echarts/core";
import { LineChart } from 'echarts/charts';
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from "echarts/components";
import "echarts-liquidfill";
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, LineChart]);
const powerFactorRef = ref();
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  xData: {
    type: [] as any,
    required: true,
  },
  yData: {
    type: [] as any,
    required: true,
  },
  smooth: {
    type: Number,
  },
  color: {
    type: Array,
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
  () => [...props.xData],
  (newVal) => {
    initChart(powerFactorRef.value);
  }
);
function setOption() {
  let max = [];
  let arr = props.yData.map((item) => {
    max.push(Math.max.apply(null, item.data));
    let data = {
      type: "line",
      symbol: "none",
      name: item.name,
      smooth: 0.2,
      emphasis: { 
        focus: "series",
      },
      areaStyle:{},
      lineStyle:{},
      data: item.data,
    };
    if (item.colors) {
      data.areaStyle={
        opacity: 0.8,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, item.colors),
      }
      data.lineStyle = {
        color: item.colors[0],
        width: 0,
      }
    }
    return data
  });
  let interval = 0;
  if (props.xData.length > 12 && props.xData.length <= 24) {
    interval = 2;
  } else if (props.xData.length > 12) {
    interval = 3;
  } else if (props.xData.length > 24) {
    interval = 4;
  }
  let option = {
    color: props.color,
    title: {
      text: props.title,
      top: -30,
      // left:10,
      textStyle: {
        color: "#fff",
        fontSize: 12,
      },
      padding: [30, 0, 0, 10],
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params) {
        let dom = ''
        params.forEach(item => {
          dom += `<div>
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>
            <span>${item.seriesName}:</span>
            <span>${item.value}</span>
            <span>${props.title}</span>
            </div>`
        }) 
        return `<div>${params[0].axisValue}</div>` +dom
      }
    },
    legend: {
      top:0,
      left: "center",
      itemHeight: 10,
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: 0,
      top: 20,
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: props.xData,
        axisLine: {
          lineStyle: {
            color: "#fff",
          },
        },
        axisLabel: {
          interval,
          show: true,
          textStyle: {
            fontSize: 10,
          },
          showMaxLabel: true,
        },
      },
    ],
    yAxis: [
      {
        minInterval : 1,
        type: "value",
        // max: Math.max.apply(null, max) + 1,
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",//虚线
						color: ["rgba(255,255,255,0.3)"],
						width: 1,
          },
        },
        axisLabel: {
          //y轴文字的配置
          textStyle: {
            color: "#fff",
          },
        },
      },
    ],
    series: arr
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
