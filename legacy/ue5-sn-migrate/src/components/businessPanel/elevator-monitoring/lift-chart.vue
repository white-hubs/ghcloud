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
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, LineChart, PictorialBarChart, BarChart]);
const powerFactorRef = ref();
interface Props {
    customerUse: number[];
    freightUse: number[];
    specialPurpose: number[];
    xData: string[];
}
const props = withDefaults(defineProps<Props>(), {
    customerUse: () => [null, 31, 28, 10, 26, 24, null],
    freightUse: () => [null, null, null, null, null, null, 4],
    specialPurpose: () => [8],
    xData: () => ['1号梯', '2号梯', '3号梯', '4号梯', '5号梯', '6号梯', '7号梯'],
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
    () => [...props.customerUse],
    (newVal) => {
        initChart(powerFactorRef.value);
    }, { deep: true }
);
function setOption() {
    let option = {
        grid: {
            top: '7%',
            left: "0%",
            right: "0%",
            containLabel: true,
        },
        tooltip: {
            trigger: 'axis',
            // formatter: "{b} : {c}",
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter: (params) => {
                let title = ''
                params.forEach(item => {
                    if (item.data) {
                        title = item.axisValue + ':' + item.data + '楼'
                    }
                })
                return title
            }
        },
        xAxis: {
            data: props.xData,
            //坐标轴
            axisLine: {
                lineStyle: {
                    color: '#ccc'
                }
            },
            //坐标值标注
            axisLabel: {
                show: true,
                textStyle: {
                    color: '#ccc',
                }
            }
        },
        yAxis: {
            type: 'value',
            show: false,
            axisLabel: {
                width: 20 // 设置Y轴标签的长度为50个像素
            }
        },
        legend: {
            textStyle: {
                color: '#fff'
            }
        },
        series: [{
            name: '客用电梯',
            // tooltip: {
            //     show: false
            // },
            backgroundStyle: {
                color: '#fff'
            },
            type: 'pictorialBar',
            itemStyle: {
                borderWidth: 1,
                borderColor: '#0571D5',
                color: '#1779E0'
            },
            label: {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: [5, 5, 5, 5],
                padding: 3,
                position: 'top',
                show: true,
                textStyle: {
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 'bold'
                }
            },
            symbol: 'path://M 0,0 L 80,0 L 80,20 L 0,20 L 0,0 Z',
            symbolSize: [10, 20],
            symbolOffset: ['0', '-10'],
            // symbolRotate: 10,
            symbolPosition: 'end',
            data: props.customerUse,
        }, {
            name: '货用电梯',
            // tooltip: {
            //     show: false
            // },
            showBackground: true,
            backgroundStyle: {
                color: '#fff'
            },
            type: 'pictorialBar',
            itemStyle: {
                borderWidth: 1,
                borderColor: '#2AE8BD',
                color: '#2AE8BD'
            },
            label: {
                show: true,
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: [5, 5, 5, 5],
                padding: 3,
                position: 'top',
                textStyle: {
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 'bold'
                }
            },
            symbol: 'path://M 0,0 L 80,0 L 80,20 L 0,20 L 0,0 Z',
            symbolSize: [10, 20],
            symbolOffset: ['0', '-10'],
            // symbolRotate: 10,
            symbolPosition: 'end',
            data: props.freightUse,
        }, {
            name: '专用电梯',
            // tooltip: {
            //     show: false
            // }, 
            showBackground: true,
            backgroundStyle: {
                color: '#fff'
            },
            type: 'pictorialBar',
            itemStyle: {
                borderWidth: 1,
                borderColor: '#FFC700 ',
                color: '#FFC700 '
            },
            label: {
                show: true,
                position: 'top',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: [5, 5, 5, 5],
                padding: 3,
                textStyle: {
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 'bold'
                }
            },
            symbol: 'path://M 0,0 L 80,0 L 80,20 L 0,20 L 0,0 Z',
            symbolSize: [10, 20],
            symbolOffset: ['0', '-10'],
            // symbolRotate: 10,
            symbolPosition: 'end',
            data: props.specialPurpose,
        },
        {
            data: [null, null, null, null, null, null, null],
            tooltip: {
                show: false
            },
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
                color: 'rgba(180, 180, 180, 0.2)'
            }
        }
        ]
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
  