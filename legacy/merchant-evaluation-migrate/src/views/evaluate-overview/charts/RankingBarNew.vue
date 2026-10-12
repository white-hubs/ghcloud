<template>
  <div>
    <div ref="chart" class="chart-container" />
  </div>
</template>

<script>
import colorsMap, { colors, colorsArr } from '../colors/colors';
function createData() {
  const data = [];
  for (let i = 0; i < 20; i++) {
    data[i] = { name: `A${i + 1}交易大厅`, value: 50 - i * 2.5, unit: '%' };
  }
  return data;
}
export default {
  props: {
    name: {
      default: '标题',
      type: String,
    },
    data: {
      type: [Array, Object],
      default: () => [],
    },
    hideTitle: Boolean,
    colors: {
      default: () => colors,
      type: Array,
    },
    showLegend: Boolean,
  },
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    data() {
      if (this.chart) {
        this.renderChart();
      }
    },
  },
  mounted() {
    // this.init();
    this.$nextTick(() => {
      this.initChart();
      this.renderChart();
      window.addEventListener('resize', this.resize);
    });
  },
  destroyed() {
    window.removeEventListener('resize', this.resize);
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
      const option = {
        tooltip: { show: false },
        grid: {
          left: 5,
          top: 10,
          bottom: 20,
          right: 10,
          containLabel: true,
        },
        xAxis: {
          type: 'value',
          boundaryGap: false,
          max: this.data.max || 100, // Math.ceil(max / 4) * 5 || 10
          axisLine: { show: true, lineStyle: { color: '#ccc' } },
          axisTick: { show: false },
          axisLabel: { color: '#999' },
          splitLine: {
            lineStyle: {
              color: ['#CEEDFF'],
              type: [5, 8],
              dashOffset: 3,
            },
          },
        },
        yAxis: {
          type: 'category',
          data: this.data.xAxis,
          axisLine: { show: true, lineStyle: { color: '#ccc' } },
          axisTick: { length: 3 },
          axisLabel: {
            fontSize: 14,
            color: '#666',
            margin: 16,
            padding: 0,
          },
          inverse: true,
        },
        series: [
          {
            name: '数量',
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(82, 168, 255, 0.1)',
              borderRadius: [0, 8, 8, 0],
            },
            itemStyle: {
              color: '#52A8FF',
              normal: {
                // borderRadius: [0, 8, 8, 0],
                color: function (params) {
                  // 定义一个颜色集合
                  let colorList = [
                    '#52A8FF',
                    '#00B389',
                    '#FFA940',
                    '#FF5A57',
                    '#29EFC4',
                    '#F8AEA4',
                    '#FFC53D',
                    '#009982',
                    '#C099FC',
                    '#F5855F',
                  ];
                  // 对每个bar显示一种颜色
                  // return colorList[params.dataIndex];
                  return colorsArr[params.dataIndex];
                },
              },
            },
            barMaxWidth: 16,
            label: {
              show: true,
              position: 'insideRight',
              offset: [-5, 2],
              color: '#fff',
            },
            data: this.data.yAxis || [],
          },
        ],
      };
      this.chart.resize({
        height:
          // (this.showLegend ? 40 : 40) +40 * (this.data?.xAxis?.length || 0),
          (this.showLegend ? 40 : 40) + 40 * 10,
      });
      this.chart.setOption(option, true); // 展示
    },
    formatter(item) {
      // const gradient = `linear-gradient(180deg, rgba(41, 137, 255) 0%,  rgba(41, 137, 255, 0) 100%);`
      // 渐变暂时不加
      return `
      <div class="tooltips-item" style="display: flex; min-width: 100px;
        align-items: center;
        justify-content: space-between;
        line-height: 24px;">
        <div class="tooltip-icon"
        style="width: 10px; height: 10px;
          background: ${item.color};
          border-radius: 50%;
          margin-right: 4px;"></div>
        <div class="tooltip-label" style="color: ${'#5F636F'}; flex: 1; margin-right: 4px;">
          ${this.data.length <= 1 ? item.name : item.seriesName}
        </div>
        <div class="tooltip-value" style="color: ${'#5F636F'}; ">
          ${
            item.value != null
              ? item.value + (item.data.unit || '')
              : '暂无数据'
          }
        </div>
      </div>
      `;
    },
  },
};
</script>

<style lang="less" scoped>
.chart-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  overflow: overlay;
}
</style>
