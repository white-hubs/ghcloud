<template>
  <div ref="chart" class="chart-container" />
</template>
<script>
import 'echarts-gl';
import $ from 'jquery';
export default {
  props: {
    data: {
      type: String,
      default: null,
    },
    mapData: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      chart: null,
      // list: [
      //   {
      //     name: '光明区',
      //     value: [113.92179560111188, 22.729605438264016],
      //   },
      // ],
    };
  },
  watch: {
    data() {
      if (this.chart) {
        this.chart.resize();
        this.renderChart();
      }
    },
    mapData() {
      if (this.chart) {
        this.chart.resize();
        this.renderChart();
      }
    },
  },
  mounted() {
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
      var echarts = this.$echarts;
      var chart = this.chart;
      var mapData = this.mapData;

      $.getJSON('/fileresource/' + this.data, function (geoJson) {
        echarts.registerMap('深圳', geoJson);
        const option = {
          geo: {
            show: false,
            map: '深圳',
            roam: true, //是否允许缩放
          },
          series: [
            {
              type: 'map3D', // 系列类型
              name: 'map3D', // 系列名称
              map: '深圳', // 地图类型
              // boxDepth: 50,
              // top: '-10%',
              label: {
                // 标签的相关设置
                show: true, // (地图上的城市名称)是否显示标签 [ default: false ]
                textStyle: {
                  // 标签的字体样式
                  color: '#E9F2FF', // 地图初始化区域字体颜色
                  fontSize: 12, // 字体大小
                  backgroundColor: 'rgba(29, 73, 113, 0.5)', // 字体背景色
                },
              },
              itemStyle: {
                color: 'rgba(95,158,160,0.5)', // 地图板块的颜色
                opacity: 1, // 图形的不透明度 [ default: 1 ]
                borderWidth: 0.5,
                borderColor: '#000', // 图形描边的颜色。[ default: #333 ]
              },
              emphasis: {
                areaColor: '#66ffff',
                borderWidth: 0.1,
              },
              groundPlane: {
                show: false, // 是否显示地面。[ default: false ]
              },
              regions: [
                {
                  // 可对单个地图区域进行设置
                  name: '南山区', // 所对应的地图区域的名称
                  itemStyle: {
                    // 单个区域的样式设置
                    color: '#6cb5f0',
                    // opacity: 1,
                    borderWidth: 0.4,
                    borderColor: '#5F9EA0',
                  },
                },
                {
                  name: '福田区',
                  itemStyle: {
                    color: 'rgba(255, 84, 0, .5)',
                    // opacity: 1,
                    borderWidth: 0.4,
                    borderColor: '#5F9EA0',
                  },
                },
              ],

              light: {
                main: {
                  color: '#fff', //主光源的颜色。[ default: #fff ]
                  intensity: 1.2, //主光源的强度。[ default: 1 ]
                  shadow: false, //主光源是否投射阴影。默认关闭。
                  alpha: 55, // 主光源绕 x 轴，即上下旋转的角度。
                  beta: 10, // 主光源绕 y 轴，即左右旋转的角度。
                },
                ambient: {
                  // 全局的环境光设置。
                  color: '#fff', // 环境光的颜色。[ default: #fff ]
                  intensity: 0.5, // 环境光的强度。[ default: 0.2 ]
                },
              },
              viewControl: {
                // 用于鼠标的旋转，缩放等视角控制。
                distance: 100,
                alpha: 40, // 视角绕 x 轴，即上下旋转的角度。配合 beta 可以控制视角的方向。[ default: 40 ]
                beta: 15, // 视角绕 y 轴，即左右旋转的角度。[ default: 0 ]
                center: [0, 0, 0], // 视角中心点，旋转也会围绕这个中心点旋转，默认为[0,0,0]。
              },
              data: [
                {
                  // 可对单个地图区域进行设置
                  name: '南山区', // 所对应的地图区域的名称
                  itemStyle: {
                    // 单个区域的样式设置
                    color: '#6cb5f0',
                    borderWidth: 0.4,
                    borderColor: '#5F9EA0',
                  },
                },
                {
                  name: '福田区',
                  itemStyle: {
                    color: 'rgba(255, 84, 0, .5)',
                    borderWidth: 0.4,
                    borderColor: '#5F9EA0',
                  },
                },
              ],
            },
            {
              type: 'scatter',
              coordinateSystem: 'geo',
              data: mapData,
              symbol: 'pin',
              symbolSize: [50, 50],
              itemStyle: {
                normal: {
                  color: 'red',
                },
              },
              showEffectOn: 'render',
              rippleEffect: {
                brushType: 'stroke',
              },
              hoverAnimation: true,
              zlevel: 1,
            },
          ],
        };
        chart.setOption(option);
      });
      chart.on('click', (params) => {
        var line = chart.convertFromPixel('geo', [
          params.event.offsetX,
          params.event.offsetY,
        ]);
        this.$emit('click', params, line);
      });
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
