<template>
  <div class="pieChart" ref="pieChart"></div>
</template>

<script lang="ts" setup>
import {  onMounted, ref, watch } from "vue";
import { TitleComponentOption } from 'echarts/components'
import * as echarts from "echarts";
type EChartsOption = echarts.EChartsOption;
type PieOption = echarts.ComposeOption<TitleComponentOption>
interface Props {
  data: number;
  xData: any
}
const props = withDefaults(defineProps<Props>(), {
  data: () => 50,
  xData: () => [
    {
      value: 302,
      name: "未处理",
    },
    {
      value: 217,
      name: "已处理",
    },
  ]
});
const pieChart = ref(null);
watch(
	() => props.data,
	newVal => {
    draw();
	},
);
var dataStyle = {
  normal: {
    label: {
      show: false,
    },
    labelLine: {
      show: false,
    },
    shadowBlur: 10,
    shadowColor: "rgba(30, 30, 30,0.2)",
  },
};
const setOptions = () => {
  let myChart = echarts.init(pieChart.value);
  myChart.clear();
  let option: PieOption = {
    color: ["#F14545", "#FFAB10","#00F27B"],
    title: {
      text: "{a|" + props.data + "}\n{c|报警数}",
      x: "center",
      y: "center",
      textStyle: {
        rich: {
          a: {
            fontSize: 18,
            color: "#fff",
          },

          c: {
            fontSize: 12,
            color: "#8996A5;",
            // padding: [5,0]
          },
        },
      },
    },
    series: [
      {
        name: "主题配色下载占比",
        type: "pie",
        radius: ["56%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: dataStyle,
        label: {
          normal: {
            show: false,
            position: "center",
          },
          emphasis: {
            show: false,
            formatter: function (param) {
              return param.name + "\n" + param.percent.toFixed(0) + "%";
            },
            textStyle: {
              fontSize: "40",
              fontWeight: "bold",
            },
          },
        },
        labelLine: {
          normal: {
            show: true,
          },
        },
        data: props.xData,
      },
    ],
  };
  myChart.setOption(option);
};

const draw = () => {
  setOptions();
};
onMounted(() => {
  draw();
});
</script>

<style lang="less" scoped>
.pieChart {
  width: 100%;
  height: 100%;
}
</style>
