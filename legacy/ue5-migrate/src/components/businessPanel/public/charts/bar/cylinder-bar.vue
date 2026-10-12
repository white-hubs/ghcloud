<template>
    <div ref="powerFactorRef" class="power-factor" />
</template>
  
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts'
const powerFactorRef = ref();

const props = withDefaults(defineProps<{
    title: string;
    yData: number[];
    xData: string[] | undefined;
}>(), {
    title: '',
    data: () => [],
    xData: () => []
});
const render = () => {
    const option: any = {
        title: {
            text: props.title,
            textStyle: {
                color: '#fff',
                fontWeight: 'normal',
                fontSize: 14
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {
                var result = ''
                var dotHtml = '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:rgba(41, 137, 255, 1)"></span>'    // 定义第一个数据前的圆点颜色
                result += params[0].axisValue + "</br>" + dotHtml + params[0].seriesName +':' + params[1].data
                return result
            }
        },
        legend: {
            textStyle: {
                color: '#fff'  // 图例文字颜色
            },
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: 0,
            top: 40,
            containLabel: true,
        },
        xAxis: {
            type: 'category', // category(坐标轴类型)
            data: props.xData,
            axisTick: { // 坐标轴刻度相关配置
                show: true // 是否显示坐标轴刻度
            },
            axisLine: { // 坐标轴轴线相关配置
                lineStyle: { // 坐标轴轴线样式
                    color: '#fff' // 坐标轴轴线颜色
                }
            },
            axisLabel: { // 坐标轴刻度标签相关配置
                color: '#fff',
                fontSize: 14,
                margin: 20
            }
        },
        yAxis: [{
            splitLine: {
                show: false,
                lineStyle: {
                    color: '#fff',
                    type: 'solid'
                }
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#fff'
                },
            }
        }],
        series: [{
            name: '平均运行次数',
            type: 'pictorialBar',
            symbolSize: [15, 8],
            symbolOffset: [0, -5],
            z: 12,
            "itemStyle": {
                color: '#7CB7FF'
            },
            data: props.yData.map(item=>{
                return {
                    value:item,
                    symbolPosition: 'end'
                }
            })
        }, {
            name: '平均运行次数',
            type: 'pictorialBar',
            symbolSize: [15, 8],
            symbolOffset: [0, 0],
            itemStyle: {
                color: '#0D55AD'
            },
            z: 12,
            data:props.yData
        }, {
            name: '平均运行次数',
            type: 'bar',
            silent: true,
            barWidth: 15,
            barGap: '-100%', // Make series be overlap
            itemStyle: {
                "normal": {
                    "color": {
                        "x": 0,
                        "y": 0,
                        "x2": 0,
                        "y2": 1,
                        "type": "linear",
                        "global": false,
                        "colorStops": [{//第一节下面
                            "offset": 0,
                            "color": "rgba(41, 137, 255, 1)"
                        }, {
                            "offset": 1,
                            "color": "rgba(41, 137, 255, 0.35)"
                        }]
                    }
                }
            },
            data:props.yData
        }]
    };
    const myChart = echarts.init(powerFactorRef.value)
    option && myChart.setOption(option)
};
watch(
    () =>[...props.yData],
    () => {
        render();
    }
);

onMounted(() => {
    render()
});
</script>
<style lang="less" scoped>
#load-chart,
.power-factor {
    width: 100%;
    height: 100%;
}
</style>
  