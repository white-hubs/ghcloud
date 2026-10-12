<template>
  <div class="chart-container">
    <div ref="chart" class="chart-container" />
    <div class="chart-tools">
      <div
        class="btn-item"
        :class="{ active: displayType === 'day' }"
        @click="changeDisplayType('day')"
      >
        日
      </div>
      <div
        class="btn-item"
        :class="{ active: displayType === 'month' }"
        @click="changeDisplayType('month')"
      >
        月
      </div>
    </div>
  </div>
</template>

<script>
import {
  titleStyle,
  // subTitleStyle,
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
      displayType: 'day',
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
            name: this.displayType === 'day' ? '昨日' : '上月',
            data: this.data.map((item, index) => {
              return {
                value: item.value,
                unit: this.unit,
              };
            }),
            type: 'line',
            ...lineAreaStyle(this.colors[0]),
          },
          {
            name: this.displayType === 'day' ? '今日' : '本月',
            data: this.data.map((item, index) => {
              return {
                value: item.value2,
                unit: this.unit,
              };
            }),
            type: 'line',
            symbol: 'none',
            // ...lineAreaStyle(this.colors[1])
          },
        ],
      };
      this.chart.setOption(option); // 展示
    },
    changeDisplayType(type) {
      this.displayType = type;
      this.data = createData(type);
      this.renderChart();
    },
  },
};
</script>

<style lang="less" scoped>
.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
  .chart-tools {
    position: absolute;
    z-index: 1;
    top: 1px;
    right: 12px;
    display: flex;
    .btn-item {
      padding: 4px 6px;
      font-size: 14px;
      color: #abbacc;
      border: 1px solid #abbacc;
      border-radius: 4px;
      margin-left: 12px;
      cursor: pointer;
      &.active {
        color: #ffffff;
        background-color: #2989ff;
        border-color: #2989ff;
      }
    }
  }
}
</style>
