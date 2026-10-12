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
  blue,
  // yellow
} from './utils.js';
function createData() {
  const data = [
    { value: 50, name: '公司' },
    { value: 110, name: '个人' },
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
      default: () => ['50%', '35%'],
      type: Array,
    },
    radius: {
      default: () => [40, 80],
      type: Array,
    },
    clockwise: {
      default: false,
      type: Boolean,
    },
    startAngle: {
      default: 90,
      type: Number,
    },
    legendIcon: {
      default: 'rect',
      type: String,
    },
    hideTitle: {
      default: false,
      type: Boolean,
    },
    totalTitle: {
      default: false,
      type: Boolean,
    },
    coloredValue: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      chart: null,
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
          show: !this.hideTitle,
          text: this.totalTitle
            ? `${this.name}-{colored|${
                this.data[0].value + this.data[1].value
              }}`
            : this.name,
          left: 'center',
          top: 'auto',
          bottom: 60,
          textStyle: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 500,
            rich: {
              colored: {
                color: this.coloredValue ? blue : '#FFFFF',
                fontSize: 16,
                fontWeight: 500,
              },
            },
          },
        },
        color: this.colors,
        tooltip: {
          show: false,
        },
        legend: {
          orient: 'horizontal',
          bottom: this.hideTitle ? 50 : 36,
          data: this.data.map((item) => item.name),
          formatter: (name) => {
            const item = this.data.find((item) => item.name === name);
            const index = this.data.indexOf(item);
            return `{gray|${name}}-{colored${index}|${item.value}}`;
          },
          itemGap: 20,
          textStyle: {
            color: gray,
            fontSize: 14,
            padding: [3, 0, 0, 0],
            rich: {
              gray: {
                color: gray,
                fontSize: 14,
              },
              colored0: {
                color: this.coloredValue ? this.colors[0] : gray,
                fontSize: 14,
              },
              colored1: {
                color: this.coloredValue ? this.colors[1] : gray,
                fontSize: 14,
              },
            },
          },
          itemWidth: 14,
          itemHeight: 14,
          icon: this.legendIcon,
        },
        series: [
          {
            name: this.name,
            silent: true,
            clockwise: this.clockwise,
            center: this.center,
            startAngle: this.startAngle,
            radius: this.radius,
            data: this.data,
            type: 'pie',
            label: {
              show: true,
              padding: [0, -50, 20, -50],
              fontWeight: 600,
              formatter: (params) => {
                const total = this.data.reduce((a, b) => a.value + b.value);
                return ((params.value / total) * 100).toFixed(2) + '%';
              },
            },
            labelLine: {
              length2: 50,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#192533a6',
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
