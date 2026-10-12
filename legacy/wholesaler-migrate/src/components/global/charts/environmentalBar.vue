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
  // lineAreaStyle,
  tooltipStyle,
  yellow,
} from './utils.js';
function createData() {
  const data = [];
  for (let i = 1; i <= 5; i++) {
    data[i - 1] = {
      date: `B${i}F`,
      value: i + Math.round(Math.random() * 5) + 4,
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
            text: `室内平均温度 {blue|26℃}`,
            left: 12,
            right: 'auto',
            top: 1,
            bottom: 'auto',
            textStyle: {
              color: '#FFFFFF',
              fontSize: 18,
              rich: {
                blue: {
                  color: subTitleStyle.textStyle.rich.blue.color,
                  fontSize: 18,
                  fontWeight: 'blod',
                },
              },
            },
          },
          {
            text: `室内平均湿度 {blue|30%}`,
            left: 'auto',
            right: 12,
            top: 1,
            bottom: 'auto',
            textStyle: {
              color: '#FFFFFF',
              fontSize: 18,
              rich: {
                blue: {
                  color: subTitleStyle.textStyle.rich.blue.color,
                  fontSize: 18,
                  fontWeight: 'blod',
                },
              },
            },
          },
          {
            text: this.name,
            ...titleStyle,
            top: 45,
            left: 'center',
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
          show: false,
          ...tooltipStyle,
          axisPointer: { type: 'shadow' },
        },
        xAxis: {
          data: this.data.map((item) => item.date),
          ...xAxisStyle,
        },
        yAxis: {
          ...yAxisStyle,
          // max(value){
          //   return value + 5
          // }
        },
        series: [
          {
            name: 'CO浓度',
            data: this.data.map((item, index) => {
              if (item.value > 10) {
                return {
                  value: item.value,
                  label: {
                    color: yellow,
                  },
                  itemStyle: {
                    color: yellow,
                  },
                };
              }
              return item.value;
            }),
            type: 'bar',
            barCategoryGap: '50%',
            barMaxWidth: 20,
            label: {
              show: true,
              position: 'top',
              formatter(params) {
                return params.value / 1000 + '%';
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
