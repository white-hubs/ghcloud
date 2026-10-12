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
  // blue,
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
    unit: {
      default: '',
      type: String,
    },
  },
  data() {
    return {
      chart: null,
      data: createData(),
      center: ['50%', '35%'],
      startAngle: 270,
      endAngle: -89.999,
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
            text: this.name + '总数-' + this.data.total,
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
            text: `${this.subTitle[0]} -{colored|${this.data.value}}${this.unit}`,
            left: 'center',
            top: 'auto',
            bottom: 36,
            textStyle: {
              color: gray,
              fontSize: 14,
              fontWeight: 500,
              rich: {
                colored: {
                  color: this.colors[0],
                  fontSize: 14,
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
          radius: 49,
        },
        angleAxis: {
          type: 'value',
          startAngle: this.startAngle,
          max: this.data.total,
          show: false,
          boundaryGap: false,
        },
        radiusAxis: {
          type: 'category',
          min: 0,
          boundaryGap: false,
          show: false,
        },
        series: [
          {
            coordinateSystem: 'polar', // 模拟指针
            name: 'line',
            type: 'line',
            showSymbol: false,
            data: [0, this.data.value],
            lineStyle: {},
          },
          {
            coordinateSystem: 'polar', // 模拟指针
            name: '仪表内环渐变',
            type: 'pie',
            center: this.center,
            startAngle: this.startAngle,
            radius: 50,
            silent: true,
            label: { show: false },
            data: [
              {
                value: this.data.value,
                itemStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      { offset: 0, color: `${this.colors[0]}80` },
                      { offset: 0.4, color: `${this.colors[0]}40` },
                      { offset: 1, color: `${this.colors[0]}00` },
                    ],
                    global: false, // 缺省为 false
                  },
                },
              },
              {
                value: this.data.total - this.data.value,
                itemStyle: {
                  color: `${this.colors[0]}00`,
                },
              },
            ],
          },
          {
            name: '仪表内环',
            type: 'gauge',
            radius: 54,
            min: 0,
            max: this.data.total,
            center: this.center,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            data: [this.data.value],
            ...meterStyle,
            axisLine: {
              lineStyle: {
                color: [[1, this.colors[0]]],
                width: 1,
              },
            },
          },
          {
            name: '仪表中环',
            type: 'pie',
            silent: true,
            radius: [57, 70],
            center: this.center,
            startAngle: this.startAngle,
            label: { show: false },
            data: [
              {
                value: this.data.value,
                itemStyle: {
                  color: `${this.colors[0]}`,

                  shadowBlur: 10,
                  shadowColor: `${this.colors[0]}80`,
                },
              },
              {
                value: this.data.total - this.data.value,
                itemStyle: {
                  color: `${this.colors[0]}00`,
                },
              },
            ],
          },
          {
            name: '仪表外环',
            type: 'gauge',
            radius: 78,
            min: 0,
            max: this.data.total,
            center: this.center,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            data: [this.data.value],
            ...meterStyle,
            axisTick: {
              // show: false,
              length: 4,
              splitNumber: 3,
              lineStyle: {
                color: this.colors[0],
                width: 2,
                shadowBlur: 10,
                shadowColor: `${this.colors[0]}80`,
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
