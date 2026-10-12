<template>
  <div class="power-factor" ref="powerFactorRef"></div>
</template>

<script lang="ts" setup>
// 1. 引入
import { nextTick, watch, onMounted, ref,onUnmounted } from 'vue';
import * as echarts from 'echarts/core'
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import 'echarts-liquidfill';
import { calcFontSize } from '@/utils/common';
echarts.use([
    LegendComponent,
    TooltipComponent,
    TitleComponent
])
const powerFactorRef = ref()
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    // 水球图背景颜色
    bgColor: {
        type: String,
        default: 'rgba(32, 165, 255, 0.3)',
    },
    // 波纹的颜色
    color: {
        type: String,
        default: '#20a5ff',
    },
    // 单位
    unit: {
        type: String,
        default: '',
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
    myChart.setOption(option());
};

watch(
    () => props.value,
    newVal => {
        initChart(powerFactorRef.value);
    },
);
onMounted(() => {
    initChart(powerFactorRef.value);
    window.addEventListener('resize', () => {
      myChart?.resize();
      myChart.clear()
      setTimeout(() => {
        myChart.setOption(option());
      }, 1000);
    })
})
onUnmounted(() => {
    window.removeEventListener('resize', () => {
      myChart?.resize();
      myChart.clear()
      setTimeout(() => {
        myChart.setOption(option());
      }, 1000);
    })
})
// 4.配置项
const option = () => {
    let option = {
        title: {
            text: props.title,
            x: '40%',
            y: '88%',
            textStyle: {
                fontSize: calcFontSize(14),
                fontWeight: '100',
                color: '#fff',
                lineHeight: 16,
                textAlign: 'center',
            },
        },

        series: [
            {
                type: 'liquidFill',
                radius: '100%',
                center: ['50%', '50%'],
                color: [
                    {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: props.color,
                            },
                            {
                                offset: 1,
                                color: props.color,
                            },
                        ],
                        globalCoord: false,
                    },
                ],
                data: [props.value, 0.5, 0.5], // data个数代表波浪数
                backgroundStyle: {
                    borderWidth: 1,
                    color: props.bgColor,
                },
                label: {
                    fontSize: calcFontSize(27),
                    color: '#fff',
                    formatter: '{c}' + props.unit,
                },
                outline: {
                    show: false,
                    borderDistance: 0,
                    itemStyle: {
                        borderWidth: 2,
                        borderColor: '#fff',
                    },
                },
            },
        ],
    };
    return option
}
</script>
<style lang="less" scoped>
#load-chart,
.power-factor {
  width: 154px;
  height: 154px;
  max-height: 100%;
}
</style>