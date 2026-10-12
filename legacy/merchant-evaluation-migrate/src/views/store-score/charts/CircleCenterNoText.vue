<template>
  <div ref="chart" class="chart-container" />
</template>

<script>
//诚信经营占比
import colorsMap, { colors } from '../colors/colors';
export default {
  props: {
    totalNum: [String, Number],
    name: String,
    data: {
      default: () => [],
      type: Array,
    },
    center: {
      default: () => ['50%', '50%'],
      type: Array,
    },
    radius: {
      default: () => ['50%', '62%'],
      type: Array,
    },
    clockwise: Boolean,
    startAngle: Number,
    hideTitle: Boolean,
    colors: {
      default: () => colors,
      type: Array,
    },
  },
  data() {
    return {
      chart: null,
      hilightIndex: 0,
    };
  },
  computed: {
    total() {
      let total = 0;
      this.data.forEach((item) => {
        total += item.value;
      });
      return total;
    },
  },
  watch: {
    data() {
      if (this.chart) {
        this.renderChart();
      }
    },
  },
  mounted() {
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
          show: true,
          text: '{a|}{b|}{c|评价次数}',
          top: '35%',
          left: '54%',
          textStyle: {
            rich: {
              a: {
                align: 'center',
                fontSize: 14,
                color: 'rgba(0,0,0,1)',
                width: 20,
                padding: [0, 0, 0, 60],
              },
              b: {
                align: 'center',
                fontSize: 14,
                color: 'rgba(0,0,0,1)',
                width: 5,
                padding: [0, 0, 0, 60],
              },
              c: {
                align: 'center',
                fontSize: 14,
                color: 'rgba(0,0,0,1)',
                width: 5,
                padding: [0, 0, 0, 45],
              },
            },
          },
        },
        // legend: { show: false },
        tooltip: {
          show: true,
          formatter: (params) => {
            let str = '';
            str += this.formatter(params);
            return `<div class="tooltips-echart">${str}</div>`;
          },
          backgroundColor: '#FFFFFF',
          borderColor: '#00000010',
          borderWidth: 1,
          padding: [5, 15, 5, 15],
        },
        legend: {
          orient: 'vertical',
          icon: 'rect',
          x: '55%',
          y: '40%',
          itemWidth: 15,
          itemHeight: 15,
          itemGap: 10,
          align: 'left',
          textStyle: {
            fontSize: '12',
            rich: {
              d: {
                fontSize: '15',
                color: '#ccc',
                width: 20,
                align: 'center',
                padding: [0, 0, 0, 20],
              },
              e1: {
                fontSize: '15',
                lineHeight: '30',
                color: 'rgba(0, 0, 0, 0.75)',
                width: 40,
                align: 'center',
                // padding: [0,0,0,20],
              },
              c1: {
                fontSize: '15',
                lineHeight: '30',
                align: 'center',
                width: 30,
                color: 'rgba(0, 0, 0, 0.75)',
                padding: [0, 0, 0, 40],
                // left:20
              },
            },
          },
          formatter: (name) => {
            let filter = this.data.filter((item) => item.name == name)[0];
            switch (filter.name) {
              case '1':
                filter.name = '一星';
                break;
              case '2':
                filter.name = '二星';
                break;
              case '3':
                filter.name = '三星';
                break;
              case '4':
                filter.name = '四星';
                break;
              case '5':
                filter.name = '五星';
                break;
            }
            return `{d|${filter.name}}{c1|${filter.ratio || '-'}%}{c1|${
              filter.value
            }}`;
            //  {e1|${filter.riskNum}};
            // return name;
          },
        },
        series: [
          {
            name: this.name,
            type: 'pie',
            clockwise: this.clockwise,
            animation: false, // 禁用动画
            center: this.center,
            radius: this.radius,
            startAngle: this.startAngle || 0,
            avoidLabelOverlap: false,
            // silent: true,
            // label: { show: false },
            label: {
              //扇形中心文字
              show: true,
              position: 'center',
              formatter: (item) => {
                return `{a|${this.name}}\n{b|${this.totalNum}}`;
              },
              fontSize: 12,
              rich: {
                a: {
                  fontSize: '15',
                  color: '#ccc',
                },
                b: {
                  fontSize: '15',
                  lineHeight: '30',
                  color: 'rgba(0, 0, 0, 0.75)',
                },
              },
            },
            labelLine: { show: false },
            itemStyle: { borderRadius: 10 },
            emphasis: {
              scale: true,
              scaleSize: 10,
              // focus: 'self',
              itemStyle: {
                borderWidth: 4,
                // borderColor: colorsMap.hui,
              },
            },
            data: this.data,
          },
        ],
      };
      this.chart.setOption(option); // 展示
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
          ${item.name}
        </div>
        <div class="tooltip-value" style="color: ${'#5F636F'}; ">
          ${((item.value / (this.total || 1)) * 10000).toFixed(0) / 100 + '%'}
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
}
</style>
