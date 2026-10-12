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
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, LineChart]);
const powerFactorRef = ref();
const props = defineProps({
  data: {
    type: Number,
    required: true,
  },
  pointerColor: {
    type: String,
    default: '#FFEF4B',
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
  try {
    if (!myChart) myChart = echarts.init(container as HTMLElement);
    myChart.setOption(setOption());
  } catch (error) {
    
  }
};

watch(
  () => props.data,
  (newVal) => {
    initChart(powerFactorRef.value);
  }
);
function setOption() {
  let option = {
    backgroundColor: 'transparent',
    series: [{
            name: "刻度",
            type: "gauge",
            center: ["50%", "70%"],
            radius: '90%',
            min: 0, //最小刻度
            max: 100, //最大刻度
            splitNumber: 10, //刻度数量
            startAngle: 180,
            endAngle: 0,
            axisLine: {
                show: true,
                lineStyle: {
                    width: 1,
                    color:  [
                    [
                            1, new echarts.graphic.LinearGradient(
                                0, 0, 1, 0, [{
                                        offset: 0,
                                        color: '#2AE8BD',
                                    },
                                    {
                                        offset: 0.5,
                                        color: '#C3F87A',
                                    }, {
                                        offset: 0.7,
                                        color: '#FCFE7E',
                                    }, {
                                        offset: 1,
                                        color: '#FA6A36',
                                    },
                                ]
                            )
                        ],
                    ],
                },
            }, //仪表盘轴线
            axisLabel: {
                show: false,
                color: "#fff",
                fontSize: 12,
                distance: -50,
                formatter: function(v) {
                    return v;
                },
            }, //刻度标签。
            axisTick: {
                show: true,
                splitNumber: 1,
                lineStyle: {
                    color: "#263b35",
                    width: 1,
                    // length:10
                },
                length: -10,
            }, //刻度样式
            splitLine: {
                show: true,
                length: -10,
                lineStyle: {
                    color: "#4aca96",
                    width: 2
                },
            }, //分隔线样式
        },
        {
            type: "gauge",
            radius: '120%',
            center: ["50%", "70%"],
            splitNumber: 0, //刻度数量
            startAngle: 180,
            endAngle: 0,
            axisLine: {
                show: true,
                lineStyle: {
                    width: 10,
                    color: [
                        [
                            1, new echarts.graphic.LinearGradient(
                                0, 0, 1, 0, [{
                                        offset: 0,
                                        color: '#2AE8BD',
                                    },
                                    {
                                        offset: 0.5,
                                        color: '#C3F87A',
                                    }, {
                                        offset: 0.7,
                                        color: '#FCFE7E',
                                    }, {
                                        offset: 1,
                                        color: '#FA6A36',
                                    },
                                ]
                            )
                        ],
                    ],
                },
            },
            //分隔线样式。
            splitLine: {
                show: false,
            },
            axisLabel: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            pointer: {
                show: true,
                length: "80%",
                width: "6%",
                itemStyle:{
                    color: props.pointerColor
                }
            },
            detail: {
                show: false,
                offsetCenter: [0, "-40%"],
                color: "#ffffff",
                textStyle: {
                    fontSize: 60,
                    color: "#4aca96"
                },
            },
            data: [{
                value: props.data,
            }, ],
        }
    ],
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
