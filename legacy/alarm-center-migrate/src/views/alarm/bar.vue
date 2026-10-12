<template lang="pug">
.line-chart(:id="'line' + id")
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

          formatter: function (params) {
            let relVal = "个数";
            relVal +=
              "<br/>" +
              params[0].marker +
              params[0].name +
              " : " +
              params[0].value.toLocaleString() +
              "个";
            return relVal;
          },

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
          axisLabel: {
            interval: 0,
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
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
            type: "bar",
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
          panelData.options.xAxis.data.push(item.name);
          panelData.options.series[0].data.push(item.alarmNum);
        });
        // myCharts1
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
