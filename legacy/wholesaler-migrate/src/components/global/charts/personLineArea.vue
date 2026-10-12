<template>
  <div ref="chart" class="chart-container" />
</template>

<script>
import {
  titleStyle,
  subTitleStyle,
  xAxisStyle,
  yAxisStyle,
  colors,
  lineAreaStyle,
  tooltipStyle,
} from './utils.js';
function createData(type = 'day') {
  const data = [];
  for (let i = 1; i <= 25; i++) {
    data[i - 1] = {
      date:
        type === 'day'
          ? `${i < 10 ? '0' + i : i}:00`
          : `2020-07-${i < 10 ? '0' + i : i}`,
      value: i + Math.round(Math.random() * 5) + 15,
      value2: i > 12 ? null : i + Math.round(Math.random() * 5) + 5,
    };
  }
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
  },
  data() {
    return {
      chart: null,
      data: createData(),
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
            text: this.name,
            ...titleStyle,
          },
          {
            text: `今日出入次数 {blue|90105}, 滞留人数 {red|51230}`,
            ...subTitleStyle,
          },
        ],
        color: this.colors,
        grid: {
          top: 80,
          bottom: 50,
          left: 12,
          right: 12,
        },
        tooltip: {
          // show: false,
          ...tooltipStyle,
          trigger: 'axis',
        },
        xAxis: {
          data: this.data.map((item) => item.date),
          ...xAxisStyle,
        },
        yAxis: {
          ...yAxisStyle,
        },
        series: [
          {
            name: '大楼人员',
            data: this.data.map((item, index) => item.value),
            type: 'line',
            ...lineAreaStyle(this.colors[0]),
          },
          {
            name: '访客人员',
            data: this.data.map((item, index) => item.value2),
            type: 'line',
            symbol: 'none',
            ...lineAreaStyle(this.colors[1]),
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
