<template>
  <div class="gaugeChart" ref="gaugeChart"></div>
</template>

<script lang="jsx">
import { defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import * as echarts from "echarts";
export default defineComponent({
  props: {
    data: {
      type: Object,
      default: 0,
    },
    bottomLabel: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    let myChart = null;
    const gaugeChart = ref(null);
    const setOptions = () => {

      const unitObj = {
        电流: 'A',
        电压: 'V',
        温度: "°C"
      }
      const maxObj = {
        电流: 320,
        电压: 500,
        温度: 100
      }
      myChart = echarts.init(gaugeChart.value);
      myChart.clear();
      myChart.setOption({
        backgroundColor: "#1b1b1b",
        title: [
          {
            x: "15%",
            y: "84%",
            //bottom: 100,
            text: `A相${props.bottomLabel}`,
            textStyle: {
              fontWeight: "normal",
              fontSize: 20,
              color: "#fff",
            },
          },
          {
            x: "46%",
            y: "84%",
            //bottom: 100,
            text: `B相${props.bottomLabel}`,
            textStyle: {
              fontWeight: "normal",
              fontSize: 20,
              color: "#fff",
            },
          },
          {
            x: "76%",
            y: "84%",
            //bottom: 100,
            text: `C相${props.bottomLabel}`,
            textStyle: {
              fontWeight: "normal",
              fontSize: 20,
              color: "#fff",
            },
          },
        ],
        tooltip: {
          formatter: `{c}${unitObj[props.bottomLabel || 'V']}`,
        },
        series: [
          {
            name: "",
            type: "gauge",
            center: ["20%", "50%"],
            min: 0,                 // 最小的数据值,默认 0 。映射到 minAngle。
            max: maxObj[props.bottomLabel],
            radius: "60%",
            detail: {
              valueAnimation: true,
              fontSize: 24,
              offsetCenter: [0, '70%']
            },
            pointer: {
              itemStyle: {
                color: 'auto'
              }
            },
            axisLabel: {
              color: '#B7C1CE',
              fontSize: 12
            },
            axisTick: {
              show: true,
              lineStyle: {
                color: "#B7C1CE",
                width: 1
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#B7C1CE'
              }
            },
            axisLine: {
              show: true,
              lineStyle: {
                width: 10,
                shadowBlur: 0,
                color: [
                  [0.3, "#75f94c"],
                  [0.7, "#37a2da"],
                  [1, "#fd666d"],
                ],
              },
            },
            data: [
              {
                value: props.data.A,
              },
            ],
          },
          {
            name: "",
            type: "gauge",
            center: ["50%", "50%"],
            radius: "60%",
            detail: {
              valueAnimation: true,
              fontSize: 24,
              offsetCenter: [0, '70%']
            },
            pointer: {
              itemStyle: {
                color: 'auto'
              }
            },
            min: 0,                 // 最小的数据值,默认 0 。映射到 minAngle。
            max: maxObj[props.bottomLabel] || 100,
            axisLabel: {
              color: '#B7C1CE',
              fontSize: 12
            },
            axisTick: {
              show: true,
              lineStyle: {
                color: "#B7C1CE",
                width: 1
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#B7C1CE'
              }
            },
            axisLine: {
              show: true,
              lineStyle: {
                width: 10,
                shadowBlur: 0,
                color: [
                  [0.3, "#75f94c"],
                  [0.7, "#37a2da"],
                  [1, "#fd666d"],
                ],
              },
            },
            data: [
              {
                value: props.data.B,
              },
            ],
          },
          {
            name: "names",
            type: "gauge",
            center: ["80%", "50%"],
            radius: "60%",
            detail: {
              valueAnimation: true,
              fontSize: 24,
              offsetCenter: [0, '70%']
            },
            min: 0,                 // 最小的数据值,默认 0 。映射到 minAngle。
            max: maxObj[props.bottomLabel] || 100,
            pointer: {
              itemStyle: {
                color: 'auto'
              }
            },
            axisLabel: {
              color: '#B7C1CE',
              fontSize: 12
            },
            axisTick: {
              show: true,
              lineStyle: {
                color: "#B7C1CE",
                width: 1
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#B7C1CE'
              }
            },
            axisLine: {
              show: true,
              lineStyle: {
                width: 10,
                shadowBlur: 0,
                color: [
                  [0.3, "#75f94c"],
                  [0.7, "#37a2da"],
                  [1, "#fd666d"],
                ],
              },
            },
            data: [
              {
                value: props.data.C,
              },
            ],
          },
        ],
      });
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
    watch(
      () => props.bottomLabel,
      (val) => {
        setOptions();
      }
    );
    return {
      gaugeChart,
    };
  },
});
</script>

<style lang="less" scoped>
.gaugeChart {
  width: 100%;
  height: 100%;
}
</style>
