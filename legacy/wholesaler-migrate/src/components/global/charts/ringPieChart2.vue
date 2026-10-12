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
  gray,
  // yellow
} from './utils.js';
function createData() {
  const data = [
    { value: 150, name: '状态一' },
    { value: 110, name: '状态二' },
    { value: 90, name: '状态三' },
    { value: 100, name: '状态四' },
  ];
  return data;
}
export default {
  props: {
    name: {
      default: 'title',
      type: String,
    },
    // subTitle: "",
    colors: {
      default: () => colors,
      type: Array,
    },
    data: {
      default: () => createData(),
      type: Array,
    },
    center: {
      default: () => ['50%', '40%'],
      type: Array,
    },
    bottom: {
      default: 36,
      type: Number,
    },
    coloredValue: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      chart: null,
      // center: ['50%', '50%'],
      startAngle: 90,
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
          text: this.name,
          left: 'center',
          top: 8,
          textStyle: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 500,
          },
        },
        color: this.colors,
        tooltip: {
          // show: false
          // formatter: '{circle|●} {b} {c}'
          backgroundColor: '#000000B0',
          borderColor: '#2989FF',
          borderWidth: 1,
          padding: [5, 15, 5, 15],
          formatter: (params) => {
            return `${params.seriesName} <br /> ${params.name}: ${params.percent}%`;
          },
        },
        legend: {
          orient: 'horizontal',
          width: 150,
          left: 'center',
          bottom: this.bottom,
          data: this.data.map((item) => item.name),
          formatter: (name) => {
            return `{gray|${name}}`;
          },
          itemGap: 10,
          textStyle: {
            color: gray,
            fontSize: 14,
            padding: [3, 0, 0, 0],
            rich: {
              gray: {
                color: gray,
                fontSize: 14,
              },
            },
          },
          itemWidth: 14,
          itemHeight: 14,
          icon: 'circle',
        },
        series: [
          {
            name: this.name,
            // silent: true,
            clockwise: this.clockwise,
            center: this.center,
            startAngle: this.startAngle,
            radius: [40, 60],
            data: this.data,
            type: 'pie',
            label: {
              show: false,
            },
            labelLine: {
              show: false,
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
