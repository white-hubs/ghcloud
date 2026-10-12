<template>
  <div ref="chart" class="chart-container" />
</template>

<script>
import { colors } from './utils.js';
function createData() {
  const data = [{ value: 50, name: '公司' }];
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
    radius: {
      default: () => [60, 80],
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
    num: Number,
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
        title: [
          {
            text: `{colored|${this.num}}`,
            left: 'center',
            top: 60,
            // bottom: 60,
            textStyle: {
              color: '#AABBCC',
              fontSize: 16,
              fontWeight: 600,
              rich: {
                colored: {
                  color: '#000000',
                  fontSize: 22,
                  fontWeight: 600,
                  lineHeight: 40,
                },
              },
            },
          },
          {
            text: `当前库存数`,
            left: 'center',
            // top: 55,
            bottom: 1,
            textStyle: {
              color: '#000000',
              fontSize: 22,
              fontWeight: 600,
            },
          },
        ],
        color: this.colors,
        tooltip: {
          show: false,
        },
        legend: {
          show: false,
        },
        series: [
          {
            name: this.name,
            silent: true,
            clockwise: this.clockwise,
            center: this.center,
            startAngle: this.startAngle,
            radius: this.radius,
            data: [100],
            type: 'pie',
            label: {
              show: false,
            },
            itemStyle: {
              // borderWidth: 2,
              // borderColor: '#192533a6',
              shadowColor: '#FFFFFF60',
              shadowBlur: 10,
            },
          },
          {
            name: this.name,
            silent: true,
            clockwise: this.clockwise,
            center: this.center,
            startAngle: this.startAngle,
            radius: [54, 55],
            data: [100],
            type: 'pie',
            label: {
              show: false,
            },
            itemStyle: {
              color: '#AABBCC40',
            },
            animation: false,
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
