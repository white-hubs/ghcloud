<template>
  <div ref="chart" class="chart-container" />
</template>

<script>
import {
  colors,
  tooltipStyle,
  // gray,
  // yellow
} from './utils.js';
function createData() {
  const data = [
    {
      value: 20,
      name: '1',
      realValue: 123,
      realName: 'XX配件',
      code: 'D021014',
    },
    {
      value: 40,
      name: '2',
      realValue: 150,
      realName: 'XX配件',
      code: 'D021015',
    },
    {
      value: 60,
      name: '3',
      realValue: 154,
      realName: 'XX配件',
      code: 'D021016',
    },
    {
      value: 80,
      name: '4',
      realValue: 180,
      realName: 'XX配件',
      code: 'D021017',
    },
    {
      value: 100,
      name: '5',
      realValue: 200,
      realName: 'XX配件',
      code: 'D021018',
    },
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
          ...tooltipStyle,
          show: true,
          trigger: 'item',
          formatter: (params) => {
            const index = params.dataIndex;
            const item = this.data[index];
            return `编号-${item.code} <br />
            名称-${item.realName} <br />
            出库数量-${item.realValue}
            `;
          },
        },
        series: [
          {
            type: 'funnel',
            sort: 'ascending',
            name: this.name,
            data: this.data,
            top: 50,
            bottom: 60,
            left: 'center',
            width: '60%',
            gap: 2,
            label: {
              show: true,
              position: 'inside',
            },
            labelLine: {
              show: false,
            },
            itemStyle: {
              borderWidth: 0,
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
