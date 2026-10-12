<template>
  <div ref="chart" class="chart-container" />
</template>

<script>
import {
  titleStyle,
  // subTitleStyle,
  xAxisStyle,
  yAxisStyle,
  colors,
  // lineAreaStyle,
  tooltipStyle,
  // yellow
} from './utils.js';
function createData() {
  const data = [];
  for (let i = 1; i <= 5; i++) {
    data[i - 1] = {
      date: `${i + 1}F`,
      value: Math.round(Math.random() * 100) + 500 - i * 100,
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
        title: {
          text: this.name,
          ...titleStyle,
        },
        color: this.colors,
        grid: {
          top: 40,
          bottom: 50,
          left: 12,
          right: 12,
        },
        tooltip: {
          // show: false,
          ...tooltipStyle,
          axisPointer: { type: 'shadow' },
        },
        xAxis: {
          data: this.data.map((item) => item.date),
          ...xAxisStyle,
        },
        yAxis: {
          ...yAxisStyle,
          // show: true,
          max: function (value) {
            return Math.floor(value.max / 100) * 100 + 250;
          },
        },
        series: [
          {
            name: '人流量',
            data: this.data.map((item, index) => {
              return {
                value: item.value,
                label: {
                  color: this.colors[index],
                },
                itemStyle: {
                  color: this.colors[index],
                },
              };
            }),
            type: 'bar',
            barCategoryGap: '50%',
            barMaxWidth: 20,
            label: {
              show: true,
              position: 'top',
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
