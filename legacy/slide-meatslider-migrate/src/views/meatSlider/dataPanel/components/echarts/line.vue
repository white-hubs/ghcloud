<template lang="pug">
div.line-chart(:id="'line'+id")
</template>

<script  lang="jsx">
import {
  defineComponent,
  inject,
  onMounted,
  reactive,
  nextTick,
  toRefs,
  watch,
} from "vue";
import { timeFormat } from "@/utils/common";
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
  },
  setup(props) {
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
          top: 10,
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
        },
        yAxis: {
          type: "value",
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
            type: "line",
            symbol: "circle",
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
          },
        ],
      },
    });
    watch(
      () => props.chartData,
      () => {
        panelData.options.xAxis.data = [];
        panelData.options.series[0].data = [];
        props.chartData.forEach((item) => {
          const day = timeFormat(item.day, false);
          panelData.options.xAxis.data.push(
            day.split("-")[1] + "-" + day.split("-")[2]
          );
          panelData.options.series[0].data.push(item.value);
        });
        myCharts1.setOption(panelData.options);
      }
    );
    onMounted(() => {
      nextTick(() => {
        myCharts1 = echarts.init(document.getElementById("line" + state.id));
        myCharts1.setOption(panelData.options);
      });
      window.addEventListener("resize", () => {
        myCharts1.resize();
      });
    });
    return {
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
