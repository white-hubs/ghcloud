<template>
  <div class="lineChart" ref="lineChart"></div>
</template>

<script lang="jsx">
import { defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import * as echarts from "echarts";
export default defineComponent({
  props: {
    data: {
      type: Object,
      default: {
        xData: [],
        seriesDataA: [],
        seriesDataB: [],
        seriesDataC: [],
      },
    },
    label:{
      type:String,
      default:"电压"
    }
  },
  setup(props) {
    let myChart = null;
    const lineChart = ref(null);
    const setOptions = () => {
      myChart = echarts.init(lineChart.value);
      myChart.clear();
      const options = {
        backgroundColor: "#344b58",
        title: {
          top: "0",
          left: "center",
          text: "历史用量曲线",
          textStyle: {
            align: "center",
            color: "#FFFFFF",
            fontSize: 22,
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
        },
        legend: {
          x: "center",
          y: "40px",
          textStyle: {
            color: "#f2f2f2",
            fontSize: 13,
          },
          icon: "circle",
          data: [`A相${props.label}`, `B相${props.label}`, `C相${props.label}`],
        },
        dataZoom: [
          {
            type: "slider",
            show: true,
            height: 20,
            left: "10%",
            right: "10%",
            bottom: "2%",
            start: 50,
            end: 100,
            textStyle: {
              color: "#d4ffff",
              fontSize: 11,
            },
          },
          {
            type: "inside",
          },
        ],
        grid: {
          right: "5%",
          bottom: "10%",
          left: "2%",
          top: "80px",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: props.data.xData,
            name: "时间",
            nameTextStyle: {
              color: "#d4ffff",
            },
            axisLine: {
              lineStyle: {
                color: "#0B4CA9",
              },
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: "#FFF",
                fontSize: 12,
              },
              //interval:0,
              //rotate:30
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            name: "次数",
            nameTextStyle: {
              color: "#d4ffff",
            },
            position: "left",
            axisLine: {
              lineStyle: {
                color: "#0B4CA9",
              },
            },
            splitLine: {
              lineStyle: {
                color: "#0B4CA9",
              },
            },
            axisLabel: {
              color: "#d4ffff",
              fontSize: 12,
            },
          },
        ],
        series: [
          {
            name: `A相${props.label}`,
            type: "line",
            yAxisIndex: 0,
            symbolSize: 12,
            itemStyle: {
              normal: {
                color: "#FC30EE",
              },
            },
            data: props.data.seriesDataA,
          },
          {
            name: `B相${props.label}`,
            type: "line",
            yAxisIndex: 0,
            symbolSize: 12,
            itemStyle: {
              normal: {
                color: "#0EF100",
              },
            },
            data: props.data.seriesDataB,
          },
          {
            name:`C相${props.label}`,
            type: "line",
            yAxisIndex: 0,
            symbolSize: 12,
            itemStyle: {
              normal: {
                color: "#0696f9",
              },
            },
            data: props.data.seriesDataC,
          },
        ],
      };
      myChart.setOption(options);
      window.addEventListener("resize", addResize);
    };
    const addResize = () => {
      myChart.resize();
    };
    onMounted(() => {
      setOptions();
    });
    onUnmounted(() => {
      window.removeEventListener("resize", addResize);
    });
    watch(
      () => props.data,
      (val) => {
        setOptions();
      }
    );
    return {
      lineChart,
    };
  },
});
</script>

<style lang="less" scoped>
.lineChart {
  width: 100%;
  height: 100%;
}
</style>
