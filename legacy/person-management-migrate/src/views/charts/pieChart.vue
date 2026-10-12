<script setup lang="ts">
import { init } from "echarts";
import {  onMounted, ref, watch } from "vue";
let L = new URL("../../assets/education.png", import.meta.url).href;
const pieChart = ref<HTMLDivElement>();
interface Props {
  option: any;
}
const props = withDefaults(defineProps<Props>(), {
  option: {},
});
watch(
  () => props.option,
  (value) => {
    setOption(value);
  }
);
const setOption = (option: any) => {
  const chart = init(pieChart.value as HTMLDivElement);
  option && chart.setOption(option);
  window.addEventListener("resize", function () {
    chart.resize();
  });
};
onMounted(() => {
  // 获取dom，断言HTMLElement类型，否则会报错
  const seriesData = [
    { value: 40, name: "本科" },
    { value: 38, name: "硕士研究生" },
    { value: 32, name: "大专" },
    { value: 30, name: "高中" },
    { value: 40, name: "初中" },
    { value: 40, name: "小学" },
  ];
  const option: any = {
    legend: {
      orient: "vertical", //垂直显示
      left: "62%",
      top: "center",
      align: "left",
      formatter: (name: string) => {
        let total = 0;
        let tarValue: number = 0;
        let scale;
        for (let i = 0; i < seriesData.length; i++) {
          total += seriesData[i].value;
          if (seriesData[i].name == name) {
            tarValue = seriesData[i].value;
          }
        }
        scale = Math.floor((tarValue / total) * 100);
        return `${name}(${scale}%)   ${tarValue}`;
      },
      icon: "circle",
    },
    graphic: {
      elements: [
        {
          type: "image",
          style: {
            image: L,
            width: 30,
            height: 27,
          },
          left: "16%", //定位 可以用 px 和百分比
          top: "middle",
        },
      ],
    },
    series: [
      {
        name: "Nightingale Chart",
        type: "pie",
        radius: [60, 80],
        center: ["20%", "50%"],
        roseType: "area",
        itemStyle: {
          borderRadius: 0,
        },
        label: {
          normal: {
            show: false,
          },
        },
        data: seriesData,
      },
    ],
  };
  setOption(props.option)
});
</script>

<template>
  <div class="chart" ref="pieChart"></div>
</template>

<style>
.chart {
  width: 100%;
  height: 232px;
}
</style>
