<template>
  <div ref="chart" class="chart-container" />
</template>

<script>
import {
  // titleStyle,
  // subTitleStyle,
  // xAxisStyle,
  // yAxisStyle,
  colors,
  // lineAreaStyle,
  // tooltipStyle,
  meterStyle,
  gray,
} from './utils.js';
function createData() {
  return {
    total: 2500 + Math.round(Math.random() * 1000),
    value: Math.round(Math.random() * 2000) + 500,
  };
}
export default {
  props: {
    name: {
      default: 'title',
      type: String,
    },
    subTitle: {
      default: () => ['已租', '出租率'],
      type: Array,
    },
    colors: {
      default: () => colors,
      type: Array,
    },
  },
  data() {
    return {
      chart: null,
      data: createData(),
      center: ['50%', '35%'],
      startAngle: 225,
      endAngle: -45,
    };
  },
  mounted() {
    // this.init();
    this.$nextTick(() => {
      this.initChart();
      this.renderChart();
      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  },
  methods: {
    initChart() {
      this.chart = this.$echarts.init(this.$refs.chart);
      this.chart.resize(); // 刷新画布
    },
    resize() {
      if (this.chart) {
        this.chart.resize();
      }
    },
    renderChart() {
      if (!this.data) {
        return;
      }
      const option = {
        title: [
          {
            text: `${this.name}-${this.data.total}${this.data.totalUnit || ''}`,
            left: 'center',
            top: 'auto',
            bottom: 60,
            textStyle: {
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 500,
            },
          },
          {
            text: `${this.subTitle[0]}-${this.data.value}${
              this.data.unit || ''
            }`,
            left: 12,
            top: 'auto',
            bottom: 36,
            textStyle: {
              color: gray,
              fontSize: 14,
              fontWeight: 500,
            },
          },
          {
            text: `${this.subTitle[1]}-{colored|${(
              (this.data.value * 100) /
              this.data.total
            ).toFixed(2)}%}`,
            right: 12,
            top: 'auto',
            bottom: 36,
            textStyle: {
              color: gray,
              fontSize: 14,
              fontWeight: 500,
              rich: {
                colored: {
                  color: this.colors[0],
                  fontWeight: 600,
                },
              },
            },
          },
        ],
        color: this.colors,
        grid: {
          top: 40,
          bottom: 50,
          left: 12,
          right: 12,
        },
        tooltip: {
          // show: false,
          // ...tooltipStyle,
          // trigger: 'none',
          // axisPointer: { type: 'shadow' },
        },

        polar: {
          center: this.center,
          radius: 42,
        },
        angleAxis: {
          type: 'value',
          startAngle: this.startAngle,
          max: this.data.total,
          show: false,
          boundaryGap: false,
        },
        radiusAxis: [
          {
            type: 'category',
            min: 0,
            boundaryGap: false,
            show: false,
          },
          {
            type: 'category',
            min: 0,
            boundaryGap: false,
            show: false,
          },
        ],
        series: [
          {
            name: '仪表中环刻度',
            type: 'gauge',
            radius: 58,
            min: 0,
            max: this.data.total,
            center: this.center,
            startAngle: 270, // this.startAngle,
            endAngle: -89.99, // this.endAngle,
            data: [this.data.value],
            ...meterStyle,
            axisTick: {
              length: 10,
              splitNumber: 3,
              lineStyle: {
                color: this.colors[0],
                width: 2,
                shadowBlur: 10,
                shadowColor: `${this.colors[0]}80`,
              },
            },
          },
          {
            name: this.name,
            type: 'gauge',
            radius: 78,
            min: 0,
            max: this.data.total,
            center: this.center,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            data: [this.data.value],
            ...meterStyle,
            pointer: {
              length: 40,
              width: 2,
            },
            itemStyle: {
              shadowBlur: 10,
              shadowColor: this.colors[0],
            },
            axisLine: {
              lineStyle: {
                color: [
                  [this.data.value / this.data.total, this.colors[0]],
                  [1, '#FFFFFF10'],
                ],
                width: 12,
              },
            },
          },
          {
            name: '指针中心的样式',
            type: 'gauge',
            radius: 8,
            min: 0,
            max: this.data.total,
            center: this.center,
            startAngle: 270,
            endAngle: -89.99,
            ...meterStyle,
            axisLine: {
              lineStyle: {
                color: [[1, this.colors[0]]],
                width: 1,
              },
            },
          },
          {
            name: '指针中心的样式',
            type: 'gauge',
            radius: 4,
            min: 0,
            max: this.data.total,
            center: this.center,
            startAngle: 270,
            endAngle: -89.99,
            ...meterStyle,
            axisLine: {
              lineStyle: {
                color: [[1, this.colors[0]]],
                width: 4,
              },
            },
          },
        ],
      };
      this.chart.setOption(option); // 展示
    },
  },
};
</script>

<style lang="less" scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
