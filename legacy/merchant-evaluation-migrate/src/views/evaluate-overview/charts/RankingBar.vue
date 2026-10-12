<template>
  <div ref="chart" class="chart-container" />
</template>

<script>
import colorsMap, { colors } from '../colors/colors';
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
      default: () => createData(),
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
        color: this.colors,
        title: {
          show: false,
        },
        legend: {
          show: !!this.showLegend,
          selectedMode: false,
          textStyle: {
            color: colorsMap.hei,
          },
        },
        grid: {
          top: this.showLegend ? 10 : 10,
          right: 50,
          bottom: 10,
          left: 140,
        },
        // tooltip: {
        //   // show: true,
        //   trigger: 'axis',
        //   formatter: (params) => {
        //     let str = '';
        //     params.forEach((item) => {
        //       str += this.formatter(item);
        //     });
        //     return `<div class="tooltips-echart">${str}</div>`;
        //   },
        //   backgroundColor: '#FFFFFF',
        //   borderColor: '#00000010',
        //   borderWidth: 1,
        //   padding: [5, 15, 5, 15],
        //   axisPointer: {
        //     lineStyle: {
        //       color: '#00000010',
        //     },
        //     label: {
        //       show: true,
        //       shadowBlur: 0,
        //     },
        //   },
        // },
        xAxis: {
          type: 'value',
          // max: 100,
          position: 'top',
          boundaryGap: ['0%', '5%'],
          axisTick: { show: false },
          axisLabel: { show: false },
          axisLine: { show: false },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'category',
          inverse: true,
          boundaryGap: false,
          data: this.data?.xAxis || [],
          axisLabel: {
            textStyle: {
              color: colorsMap.hei,
            },
          },
          axisTick: { show: false },
          axisLine: { show: false },
          splitLine: { show: false },
        },
        series:
          this.data?.series?.map((item, index) => {
            return {
              name: 'bar1',
              type: 'bar',
              stack: 'rank',
              label: {
                show: this.data?.series?.length === index + 1,
                position: 'right',
                color: colorsMap.hei,
                formatter(params) {
                  return (
                    (params.data.stack || params.value) +
                    (params.data.unit || '')
                  );
                },
              },
              barMinHeight: 2,
              barWidth: 10,
              barMaxWidth: 10,
              barCategoryGap: 5,
              ...item,
              data: item.data.map((item, idx) => {
                return {
                  ...item,
                  // itemStyle: { color: colors[(idx + index + 3) % 7] },
                };
              }),
            };
          }) || [],
      };
      this.chart.resize({
        height:
          (this.showLegend ? 40 : 40) + 25 * (this.data?.xAxis?.length || 0),
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
