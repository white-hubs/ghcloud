<template>
  <div class="power-factor" ref="powerFactorRef"></div>
</template>

<script lang="ts" setup>
// 1. 引入
import { nextTick, watch, onMounted, ref, reactive, onBeforeUnmount } from "vue";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { BarChart } from "echarts/charts";
import { storeMarket } from "@/piniaStore/other";
import { PictorialBarChart } from "echarts/charts";
const piniaStoreMarket = storeMarket();
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from "echarts/components";
import "echarts-liquidfill";
import { calcFontSize } from "@/utils/common";
echarts.use([
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  GridComponent,
  LineChart,
  PictorialBarChart,
  BarChart,
]);
const powerFactorRef = ref();
interface yData {
  data: number[];
  name: string;
  color?: string[];
}
interface Props {
  xData: string[];
  yData: yData[];
  xFontSize?: number;
  title?: string;
  bottom?:string
}
const props = withDefaults(defineProps<Props>(), {
  xFontSize: calcFontSize(12),
  bottom:'10%'
});

nextTick(() => {
  // 2. 容器
  const container = powerFactorRef.value as HTMLElement;
  if (container) initChart(container);
});
const emit = defineEmits(["clickbar"]);
// 3. 初始化 echarts 实例, 将配置添加给 echarts 实例
let myChart: echarts.ECharts | null = null;
const initChart = (container?: HTMLElement) => {
  if (!myChart) myChart = echarts.init(container as HTMLElement);
  myChart.on("click", function (params) {
    emit("clickbar", params);
  });
  myChart.setOption(setOption());
};

watch(
  () => [...props.yData],
  () => {
    initChart(powerFactorRef.value);
  },
  { deep: true }
);
function setOption(data = [], xdata = []) {
  let list = data.length == 0 ? props.yData : data;
  let xlist = xdata.length == 0 ? props.xData : xdata;
  let series = list.map((x) => {
    let data = {
      name: x.name,
      data: x.data,
      type: "bar",
      barWidth: calcFontSize(12),
      itemStyle: {},
    };
    if (x.color) {
      data.itemStyle = {
        normal: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: x.color[0], // 0% 处的颜色
              },
              {
                offset: 1,
                color: x.color[1], // 100% 处的颜色
              },
            ],
            false
          ),
          shadowColor: "rgba(0,160,221,1)",
        },
      };
    }
    return data;
  });
  let option = {
    title: {
      text: props.title,
      textStyle: {
        lineHeight: calcFontSize(12),
        fontSize: calcFontSize(12),
        color: "#fff",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(3, 11, 27, 0.70)",
      borderColor: "rgba(3, 11, 27, 0.70)",
      textStyle: {
        color: "white",
      },
      formatter: function (params) {
        var result = "";
        const size_dot = calcFontSize(10);
        const size_text = calcFontSize(12);
        var dotHtml =
        `<span style="display:inline-block;margin-right:${size_dot/2}px;border-radius:${size_dot}px;width:${size_dot}px;height:${size_dot}px;background-color:rgba(41, 137, 255, 1)"></span>`; // 定义第一个数据前的圆点颜色
        result += dotHtml + 
         `<span style="font-size:${size_text}px">`+params[0].name + ":" + params[0].data; + "</span>"
        return result;
      },
    },
    grid: {
      left: "0%",
      // right: '10%',
      top: "5%",
      // bottom: '10%'
      right: "3%",
      bottom: props.bottom,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xlist,
      splitLine: {
        show: false, //隐藏
      },

      axisLabel: {
        showMaxLabel: true,
        show: true,
        color: "#ffffff",
        fontSize: calcFontSize(12),
        fontWeight: 300,
        // rotate:20
      },
    },
    yAxis: {
      minInterval: 1,
      type: "value",
      splitLine: {
        //分割线配置
        show: true,
        lineStyle: {
          type: "dashed", //虚线
          color: ["rgba(255,255,255,0.15)"],
          width: 1,
        },
      },
      axisLabel: {
        show: true,
        color: "#ffffff",
        fontSize: calcFontSize(12),
        fontWeight: 300,
      },
    },
    legend: {
      itemHeight: 5,
      itemWidth: 10,
      textStyle: {
        color: "#fff",
      },
    },
    series,
  };
  return option;
}
const resize = ()=>{
  setTimeout(() => {
    initChart(powerFactorRef.value);
  }, 1500);
}
onMounted(() => {
  initChart(powerFactorRef.value);
  window.addEventListener("resize", resize);
});
onBeforeUnmount(()=>{
  window.removeEventListener('resize',resize)
})
const getcurrentData = (list, target) => {
  let foundIndex = 0;
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < list[i].length; j++) {

      if (list[i][j]["marketName"] === target) {

        foundIndex = i; // 将索引添加到数组中
      }
    }
  }
  return foundIndex;
};
watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {
    if (myChart) {
      if (n == "") {
        myChart.dispatchAction({
          type: "hideTip",
          seriesIndex: 0,
        });
        myChart.on("click", function (params) {
          emit("clickbar", params);
        });
      } else {
        let Xlist = [];
        let Ylist = [];
        let xdata = props.yData[0].list;
        Xlist = xdata[getcurrentData(xdata, n)].map((item) => item.marketName);
        Ylist.data = xdata[getcurrentData(xdata, n)].map((item) => item.num);

        myChart.setOption(setOption(Ylist, Xlist));
        const index = xdata[getcurrentData(xdata, n)].findIndex(
          (item) => item.marketName == n
        );
        myChart.dispatchAction({
          type: "hideTip",
          seriesIndex: 0,
          dataIndex: index,
        });
        myChart.dispatchAction({
          type: "showTip",
          seriesIndex: 0,
          dataIndex: index,
        });
      }
    }
  }
);
</script>
<style lang="less" scoped>
#load-chart,
.power-factor {
  width: 100%;
  height: 100%;
}
</style>
