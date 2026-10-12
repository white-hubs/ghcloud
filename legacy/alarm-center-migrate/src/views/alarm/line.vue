<template lang="pug">
div.line-chart(:id="'line'+id" ref="chartRef")
</template>

<script lang="jsx">
import {
  defineComponent,
  inject,
  onMounted,
  reactive,
  nextTick,
  toRefs,
  watch,
  ref,
  getCurrentInstance,
} from "vue";
import * as echarts from "echarts";

export default defineComponent({
  props: {
    lineStyleColor: {
      type: String,
      default: "rgba(0, 186, 139,1)",
    },
    areaStyleColor: {
      type: String,
      default: "rgba(0, 186, 139, 0.05)",
    },
    chartData: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: "line",
    },
    dayType: {
      type: String,
      default: "TODAY",
    },

    yName: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const chartRef = ref();
    let myCharts1 = null;
    const state = reactive({
      id: Math.random() * 100,
      myCharts1: null,
    });
    const panelData = reactive({
      options: {
        grid: {
          left: 50,
          right: 10,
          bottom: 50,
          top: 30,
          containLabel: false,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            label: {
              backgroundColor: "#6a7985",
            },
          },
        },
        xAxis: {
          type: "category",
          data: [],
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            formatter: function (value) {
              if (props.dayType == "TODAY") {
                return value + "时";
              } else {
                return value;
              }
            },
          },
        },
        yAxis: {
          type: "value",
          name: props.yName,
          minInterval: 1,
          axisLabel: {
            formatter: function (value) {
              return value + "个";
            },
          },
          splitLine: {
            lineStyle: {
              type: "dashed",
              color: "#F3F3F3",
            },
          },
        },
        series: [
          {
            data: [],
            type: props.type,
            symbol: "circle",
            barWidth: 10,
            itemStyle: {
              normal: {
                color: props.lineStyleColor,
              },
            },
            lineStyle: {
              color: props.lineStyleColor,
            },
            areaStyle: {
              color: props.areaStyleColor,
            },
            smooth: true,
          },
        ],
      },
    });

    watch(
      () => props.chartData,
      () => {
        panelData.options.xAxis.data = [];
        panelData.options.series[0].data = [];
        props.chartData.forEach(item => {
          panelData.options.xAxis.data.push(item.name);
          panelData.options.series[0].data.push(item.value);
        });
        myCharts1.setOption(panelData.options);
      },
    );

    onMounted(() => {
      if (props.chartData.length > 0) {
        panelData.options.xAxis.data = [];
        panelData.options.series[0].data = [];
        props.chartData.forEach(item => {
          panelData.options.xAxis.data.push(item.name);
          panelData.options.series[0].data.push(item.value);
        });
      }
      nextTick(() => {
        myCharts1 = echarts.init(document.getElementById("line" + state.id));
        myCharts1.setOption(panelData.options);
      });
      window.addEventListener("resize", () => {
        myCharts1.resize();
      });
    });
    return {
      chartRef,
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
.line-chart {
  width: 100%;
  height: 100%;
}
</style>
