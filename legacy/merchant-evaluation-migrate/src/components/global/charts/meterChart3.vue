<template>
  <div ref="chart" class="chart-container" />
</template>

<script>
import { meterStyle, blue, ching, gray } from './utils.js';
function createData() {
  return {
    total: 100,
    value: parseFloat((Math.random() * 75 + 20).toFixed(1)),
  };
}
export default {
  props: {
    name: {
      default: 'title',
      type: String,
    },
    unit: {
      default: '%',
      type: String,
    },
    colors: {
      default: () => [blue, ching],
      type: Array,
    },
    labels: {
      default: () => [0, 50, 100],
      type: Array,
    },
  },
  data() {
    return {
      chart: null,
      data: createData(),
      center: ['50%', '55%'],
      startAngle: 180,
      endAngle: 0,
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
        title: {
          text: `${this.name} ${this.data.value}${this.unit}`,
          left: 'center',
          top: 'auto',
          bottom: 90,
          textStyle: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 600,
          },
        },
        color: this.colors,
        tooltip: {
          // show: false,
          // ...tooltipStyle,
          // trigger: 'none',
          // axisPointer: { type: 'shadow' },
        },

        polar: {
          center: this.center,
          radius: 180,
        },
        angleAxis: {
          type: 'value',
          startAngle: this.startAngle,
          min: 0,
          max: 200,
          show: false,
          boundaryGap: false,
        },
        radiusAxis: {
          boundaryGap: false,
          show: false,
          data: ['radius'],
        },
        series: [
          {
            name: '仪表中环',
            type: 'gauge',
            radius: 70,
            min: 0,
            max: this.data.total,
            center: this.center,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            data: [this.data.value],
            ...meterStyle,
            axisLine: {
              lineStyle: {
                color: [
                  [
                    1,
                    {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 1,
                      y2: 0,
                      colorStops: [
                        { offset: 0, color: `${this.colors[0]}` },
                        { offset: 0.2, color: `${this.colors[0]}` },
                        { offset: 1, color: `${this.colors[1]}` },
                      ],
                      global: false, // 缺省为 false
                    },
                  ],
                ],
                width: 10,
              },
            },
          },
          {
            name: this.name,
            type: 'gauge',
            radius: 80,
            min: 0,
            max: 100,
            center: this.center,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            data: [this.data.value],
            ...meterStyle,
            pointer: {
              length: 40,
              width: 4,
            },
            itemStyle: {
              color: blue,
            },
            axisLine: {
              lineStyle: {
                color: [
                  [
                    1,
                    {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 1,
                      y2: 0,
                      colorStops: [
                        { offset: 0, color: `${this.colors[0]}D0` },
                        { offset: 0.3, color: `${this.colors[0]}D0` },
                        { offset: 1, color: `${this.colors[1]}D0` },
                      ],
                      global: false, // 缺省为 false
                    },
                  ],
                ],
                width: 11,
              },
            },
          },
          {
            name: '最外层的线',
            type: 'gauge',
            radius: 90,
            min: 0,
            max: this.data.total,
            center: this.center,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            data: [this.data.value],
            ...meterStyle,
            axisLine: {
              lineStyle: {
                color: [[1, gray]],
                width: 1,
              },
            },
            splitNumber: this.labels.length - 1,
            axisLabel: {
              fontSize: 12,
              fontWeight: 600,
              distance: -38 - 2 * this.labels.length,
              formatter: (value) => {
                const index = Math.round(
                  (value * (this.labels.length - 1)) / 100,
                );
                return this.labels[index];
              },
            },
          },
          {
            name: '线上的指针标记点',
            type: 'scatter',
            silent: true,
            coordinateSystem: 'polar',
            data: [this.data.value],
            itemStyle: {
              color: '#FFFFFF',
              opacity: 1,
              borderWidth: 1,
              borderColor: `${blue}50`,
              shadowBlur: 10,
              shadowColor: blue,
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
