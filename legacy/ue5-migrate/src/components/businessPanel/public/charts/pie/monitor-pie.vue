<template>
    <div :class="['pie-box']">
        <div :class="['power-factor']" ref="powerFactorRef"></div>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
// 1. 引入
import { nextTick, watch, onMounted, ref, reactive, onBeforeUnmount } from "vue";
import * as echarts from "echarts/core";
import { LineChart } from 'echarts/charts';
import { BarChart } from 'echarts/charts';
import { PictorialBarChart } from 'echarts/charts';
import { PieChart } from 'echarts/charts';
import { CustomChart } from 'echarts/charts';

import {
    LegendComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
} from "echarts/components";
import "echarts-liquidfill";
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, LineChart, PictorialBarChart, BarChart, PieChart, CustomChart]);
const emit = defineEmits(["clickBar"]);
const powerFactorRef = ref();
const props = defineProps({
    yData: {
        type: [] as any,
        required: true,
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
    myChart.on("click", function (params) {
      emit("clickBar", params);
    });
    angle = angle + 3
    myChart.setOption(setOption());
};
let timeId = ref()
watch(
    () => [...props.yData],
    (newVal) => {
        window.clearTimeout(timeId.value)
        draw();
    },
  {deep:true}
);
let angle = 100;//角度，用来做简单的动画效果的
const value = 30;
const setOption = () => {
    let option = {
        // animation: false,
        series: [
            {
                name: "ring5",
                type: 'custom',
                coordinateSystem: "none",
                animationDuration: 101,
                renderItem: function (params, api) {
                    return {
                        type: 'arc',
                        shape: {
                            cx: api.getWidth() / 2,
                            cy: api.getHeight() / 2,
                            r: Math.min(api.getWidth(), api.getHeight()) / 2 * 1,
                            startAngle: (0 + angle) * Math.PI / 180,
                            endAngle: (90 + angle) * Math.PI / 180
                        },
                        style: {
                            stroke: "rgba(255,255,255,0.5)",
                            fill: "transparent",
                            lineWidth: 1.5
                        },
                        silent: true
                    };
                },
                data: [0]
            }, {
                name: "ring5",
                type: 'custom',
                coordinateSystem: "none",
                animationDuration: 101,
                renderItem: function (params, api) {
                    return {
                        type: 'arc',
                        shape: {
                            cx: api.getWidth() / 2,
                            cy: api.getHeight() / 2,
                            r: Math.min(api.getWidth(), api.getHeight()) / 2 * 1,
                            startAngle: (180 + angle) * Math.PI / 180,
                            endAngle: (270 + angle) * Math.PI / 180
                        },
                        style: {
                            stroke: "rgba(255,255,255,0.5)",
                            fill: "transparent",
                            lineWidth: 1.5
                        },
                        silent: true
                    };
                },
                data: [0]
            }, {
                name: "ring5",
                type: 'custom',
                coordinateSystem: "none",
                animationDuration: 101,
                renderItem: function (params, api) {
                    return {
                        type: 'arc',
                        shape: {
                            cx: api.getWidth() / 2,
                            cy: api.getHeight() / 2,
                            r: Math.min(api.getWidth(), api.getHeight()) / 2 * 0.9,
                            startAngle: (270 + -angle) * Math.PI / 180,
                            endAngle: (40 + -angle) * Math.PI / 180
                        },
                        style: {
                            stroke: "rgba(255,255,255,0.5)",
                            fill: "transparent",
                            lineWidth: 1.5
                        },
                        silent: true
                    };
                },
                data: [0]
            }, {
                name: "ring5",
                type: 'custom',
                coordinateSystem: "none",
                animationDuration: 101,
                renderItem: function (params, api) {
                    return {
                        type: 'arc',
                        shape: {
                            cx: api.getWidth() / 2,
                            cy: api.getHeight() / 2,
                            r: Math.min(api.getWidth(), api.getHeight()) / 2 * 0.9,
                            startAngle: (90 + -angle) * Math.PI / 180,
                            endAngle: (220 + -angle) * Math.PI / 180
                        },
                        style: {
                            stroke: "rgba(255,255,255,0.5)",
                            fill: "transparent",
                            lineWidth: 1.5
                        },
                        silent: true
                    };
                },
                data: [0]
            }, {
                name: '',
                type: 'pie',
                radius: ['70%', '85%'],
                animationDuration: 101,
                silent: true,
                clockwise: true,
                startAngle: 90,
                z: 0,
                zlevel: 0,
                label: { 
                    color:"#fff",
                    normal: {
                        position: "center",

                    }
                },
                data: [{
                    value: value,
                    name: "",
                    itemStyle: {
                        normal: {
                            color: { // 完成的圆环的颜色
                                colorStops: [{
                                    offset: 0,
                                    color: '#3590FF' // 0% 处的颜色
                                }, {
                                    offset: 1,
                                    color: 'RGBA(70, 109, 152, 0.1)' // 100% 处的颜色
                                }]
                            },
                        }
                    }
                },
                {
                    value: 100 - value,
                    name: "",
                    label: {
                        color:"#fff",
                        normal: {
                            show: false
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: "rgba(255,255,255,0.1)"
                        }
                    }
                }
                ]
            },
            {
                type: 'pie',
                radius: ['70%', '85%'],
                animationDuration: 101,
                silent: true,
                clockwise: true,
                startAngle: 90,
                z: 0,
                zlevel: 0,
                label: {
                    color:"#fff",
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
            {
                name: 'Access From',
                type: 'pie',
                radius: ['50%', '65%'],
                animationDuration: 101,
                label: {
                    color:"#fff",
                    alignTo: 'edge',
                    formatter: '{name|{b}}\n{time|{d} %}',
                    minMargin: 5,
                    edgeDistance: 10,
                    lineHeight: 15,
                    rich: {
                        time: {
                            fontSize: 10,
                            color: '#999'
                        }
                    }
                },
                data: props.yData.map(item => {
                    return {
                        value: item.value,
                        name: item.name,
                        itemStyle: {
                            color: item.color
                        }
                    }
                })
                ,
            }

        ]
    };
    return option;
}
const draw = () => {
    //用setInterval做动画感觉有问题
    timeId.value = setInterval(function () {
        initChart(powerFactorRef.value);
        //window.requestAnimationFrame(draw);
    }, 100);
}

onMounted(() => {
    draw();
});
onBeforeUnmount(() => {
    clearInterval(timeId.value);
});
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
  