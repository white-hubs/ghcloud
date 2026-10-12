<template lang="pug">
div.line-chart(:id="'line'+id")
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
    });
    const panelData = reactive({
      options: {
        legend: {
          top: 0,
          left: "center",
        },
        grid: {
          left: 40,
          right: 10,
          bottom: 50,
          top: 50,
          containLabel: false,
        },
        color: ["#13C2C2", "#00BA8B", "#1890FF", "#E6A13B"],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          textStyle: { align: "left" },
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
            name: "交易重量",
            data: [],
            type: "bar",
            barWidth: "6",
          },
          {
            name: "交易片数",
            data: [],
            type: "bar",
            barWidth: "6",
          },
          {
            name: "交易金额",
            data: [],
            type: "bar",
            barWidth: "6",
          },
          {
            name: "交易佣金",
            data: [],
            type: "bar",
            barWidth: "6",
          },
        ],
      },
    });
    watch(
      () => props.chartData,
      () => {
        panelData.options.xAxis.data = [];
        panelData.options.series[0].data = [];
        panelData.options.series[1].data = [];
        panelData.options.series[2].data = [];
        panelData.options.series[3].data = [];
        props.chartData.forEach((item) => {
          panelData.options.xAxis.data.push(
            item.supplyName ? item.supplyName : item.abattoirName
          );
          panelData.options.series[0].data.push(item.tradeWeight?item.tradeWeight:0);
          panelData.options.series[1].data.push(item.tradeSlices?item.tradeSlices:0);
          panelData.options.series[2].data.push(item.tradeAmount?item.tradeAmount:0);
          panelData.options.series[3].data.push(item.tradeCommission?item.tradeCommission:0);
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
