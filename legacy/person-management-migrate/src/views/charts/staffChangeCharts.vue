<script setup lang="ts">
import { init } from "echarts";
import {  nextTick, onMounted, ref, watch } from "vue";
let L = new URL("../../assets/education.png", import.meta.url).href;
const staffChangeCharts = ref<HTMLDivElement>();
interface Props {
  data: any;
}
const props = withDefaults(defineProps<Props>(), {
  data: [],
});
watch(
  () => props.data,
  (value) => {
    nextTick(() => {
      if (props.data.length) {
        setOption(value);
      }else{
        const chart = init(staffChangeCharts.value as HTMLDivElement);
        chart.clear() 
      }
    })
  }
);
const setOption = (option: any) => {
  const xAxisData = option.map((item: { timeFlag: any }) => item.timeFlag);
  const inductionData = option.map(
    (item: { inductionNum: any }) => item.inductionNum
  );
  const quitData = option.map((item: { quitNum: any }) => item.quitNum);
  const regularWorkerData = option.map(
    (item: { regularWorkerNum: any }) => item.regularWorkerNum
  );
  const options = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#999",
        },
      },
    },
    legend: {
      data: ["入职", "离职", "转正"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: xAxisData,
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [
      {
        name: "入职",
        type: "bar",
        barWidth: 16,
        itemStyle: {
          color: "#3662EC",
        },
        data: inductionData,
      },
      {
        name: "离职",
        type: "bar",
        barWidth: 16,
        itemStyle: {
          color: "#1890FF",
        },
        data: quitData,
      },
      {
        name: "转正",
        type: "bar",
        barWidth: 16,
        // smooth: true,
        // itemStyle: {
        //   normal: {
        //     color: "#4EC478", //改变折线点的颜色
        //     lineStyle: {
        //       color: "#4EC478", //改变折线颜色
        //     },
        //   },
        // },
        data: regularWorkerData,
      },
    ],
  };
  const chart = init(staffChangeCharts.value as HTMLDivElement);

  options && chart.setOption(options);
  window.addEventListener("resize", function () {
    chart.resize();
  });
};
onMounted(() => {
  if (props.data && props.data.length) {
    setOption(props.data);
  }
  // 获取dom，断言HTMLElement类型，否则会报错
});
</script>

<template>
  <div class="box">
    <div class="staffChangeCharts" ref="staffChangeCharts"></div>
    <a-empty v-show="props.data.length === 0" class="empty"></a-empty>
  </div>
</template>

<style scoped lang="less">
.box {
  width: 100%;
  position: relative;

  .staffChangeCharts {
    width: 100%;
    height: 300px;
  }

  .empty {
    width: 99%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    height: 200px;
    background: white;
  }
}
</style>
