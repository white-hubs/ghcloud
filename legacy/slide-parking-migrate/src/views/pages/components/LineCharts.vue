<template>
  <div ref="chartBox" class="chart-container" />
</template>

<script lang="jsx">
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  ref,
  nextTick,
  watch,
  onUnmounted,
  markRaw,
} from "vue";
import * as echarts from "echarts";
export default defineComponent({
  components: {},
  props: {
    totalNum: [String, Number],
    title: {
      type: String,
      default: () => "",
    },
    subTitle: {
      type: String,
      default: () => "",
    },
    name: String,
    xData: {
      type: Array,
      default: () => [],
    },
    seriesData: {
      type: Array,
      default: () => [],
    },
    center: {
      default: () => ["50%", "50%"],
      type: Array,
    },
    radius: {
      default: () => ["50%", "62%"],
      type: Array,
    },
    colors: {
      default: () => ["#0091ff"],
      type: Array,
    },
    unit: {
      type: String,
      default: () => "",
    },
  },
  setup(props) {
    let chartBox = ref(null);
    const state = reactive({
      chart: null,
    });
    onMounted(() => {
      nextTick(() => {
        initChart();
        renderChart();
        window.addEventListener("resize", resize);
      });
    });
    //
    onUnmounted(() => {
      window.removeEventListener("resize", resize);
    });
    const resize = () => {
      if (state.chart) {
        setTimeout(() => {
          state.chart.resize();
        }, 500); //因为用了lib-flexible 整体适配，所以需要一个延时定时器一定要大于300ms
      }
    };
    //监听props里面的data的数据变化
    watch(
      () => props.xData,
      () => {
        if (state.chart) {
          renderChart();
        }
      },
      { deep: true },
    );
    //图标初始化
    const initChart = () => {
      //markRaw 禁止为响应式数据
      state.chart = markRaw(echarts.init(chartBox.value));
      state.chart.resize(); // 刷新画布
    };
    //图标数据渲染
    const renderChart = () => {
      const option = {
        title: [
          {
            text: props.title,
            left: "3%",
          },
          {
            text: props.subTitle,
            right: "3%",
            textAlign: "center",
            textStyle: {
              color: "#999999",
              fontWeight: "normal",
              fontSize: 14,
            },
          },
        ],

        /* 颜色参数 */
        color: props.colors,
        /* 提示框内容设置 */
        tooltip: {
          trigger: "axis",
          formatter: parmas => {
            var relVal = parmas[0].name;
            for (var i = 0, len = parmas.length; i < len; i++) {
              relVal += `<span style='display:flex;justify-content: space-between;align-items: center;'>
                    <span>${parmas[i].marker}${parmas[i].seriesName}</span>
                    &emsp;&emsp;&emsp;
                    ${parmas[i]?.value || "--"} 
                    ${props.unit || "辆"} 
                  </span>`;
            }
            return relVal;
          },
        },
        // 充盈图表
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        legend: {
          show: props.seriesData.length > 1 ? true : false, //如果只有一类数据，就不显示类目图标
          right: "3%",
          left: "center",
          top: "3%",
          // textStyle: {
          //   align: "left",
          //   // color: "#",//字体颜色随着变
          //   verticalAlign: "middle",
          //   rich: {
          //     name: {
          //       width: 80,
          //       fontSize: 16,
          //     },
          //     value: {
          //       width: 20,
          //       align: "right",
          //       fontFamily: "Medium",
          //       fontSize: 16,
          //     },
          //     rate: { width: 10, align: "right", fontSize: 16 },
          //   },
          // },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: props.xData || [],
        },
        yAxis: {
          type: "value",
          data: props.yData || [],
        },
        series: props.seriesData,
      };

      state.chart.setOption(option);
    };

    return {
      ...toRefs(state),
      chartBox,
    };
  },
});
</script>

<style lang="less" scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
