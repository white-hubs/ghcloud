import { LineChart } from "echarts/charts";
import { BarChart } from "echarts/charts";
import { PictorialBarChart } from "echarts/charts";
import { LegendComponent, TitleComponent, TooltipComponent, GridComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { defineComponent } from "vue";
import { nextTick, watch, onMounted, ref, reactive } from "vue";

import styles from "./stereo-bar.module.less";
import "echarts-liquidfill";

echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, LineChart, PictorialBarChart, BarChart]);

export const StereoBar = defineComponent({
  name: "StereoBar",
  props: {
    title: {
      type: String,
      required: true,
    },
    xData: {
      type: [] as any,
      required: true,
    },
    yData: {
      type: [] as any,
      required: true,
    },
    color: {
      type: Array,
    },
  },
  setup(props, ctx) {
    const powerFactorRef = ref<HTMLElement | null>(null);

    nextTick(() => {
      // 2. 容器
      const container = powerFactorRef.value as HTMLElement;
      if (container) initChart(container);
    });
    // 3. 初始化 echarts 实例, 将配置添加给 echarts 实例
    let myChart: echarts.ECharts | null = null;
    const initChart = (container?: HTMLElement) => {
      if (!myChart) myChart = echarts.init(container as HTMLElement);
      myChart.setOption(setOption());
    };

    watch(
      () => [...props.xData],
      (newVal) => {
        initChart(powerFactorRef.value);
      },
    );
    function setOption() {
      let option = {
        title: {
          text: props.title,
          textStyle: {
            color: "#fff",
            fontSize: 14,
          },
        },
        tooltip: {
          trigger: "axis",
          formatter: "{b} : {c}",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: 0,
          top: 40,
          containLabel: true,
        },
        xAxis: {
          data: props.xData,
          //坐标轴
          axisLine: {
            lineStyle: {
              color: "#3eb2e8",
            },
          },
          //坐标值标注
          axisLabel: {
            show: true,
            textStyle: {
              color: "#fff",
            },
          },
        },
        yAxis: {
          //坐标轴
          axisLine: {
            show: false,
          },
          //坐标值标注
          axisLabel: {
            show: true,
            textStyle: {
              color: "#fff",
            },
          },
          //分格线
          splitLine: {
            lineStyle: {
              color: "#4784e8",
            },
          },
        },
        series: [
          {
            name: "a",
            tooltip: {
              show: false,
            },
            type: "bar",
            barWidth: 15,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  1,
                  0,
                  0,
                  [
                    {
                      offset: 0,
                      color: "#0B4EC3", // 0% 处的颜色
                    },
                    {
                      offset: 0.6,
                      color: "#138CEB", // 60% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "#17AAFE", // 100% 处的颜色
                    },
                  ],
                  false,
                ),
              },
            },
            data: props.yData,
            barGap: 0,
          },
          {
            type: "bar",
            barWidth: 4,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  1,
                  0,
                  0,
                  [
                    {
                      offset: 0,
                      color: "#09337C", // 0% 处的颜色
                    },
                    {
                      offset: 0.6,
                      color: "#0761C0", // 60% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "#0575DE", // 100% 处的颜色
                    },
                  ],
                  false,
                ),
              },
            },
            barGap: 0,
            data: props.yData.map((item) => item + 4),
          },
          {
            name: "b",
            tooltip: {
              show: false,
            },
            type: "pictorialBar",
            itemStyle: {
              borderWidth: 1,
              borderColor: "#0571D5",
              color: "#1779E0",
            },
            symbol: "path://M 0,0 l 120,0 l -30,60 l -120,0 z",
            symbolSize: ["20", "12"],
            symbolOffset: ["0", "-11"],
            //symbolRotate: -5,
            symbolPosition: "end",
            data: props.yData,
            z: 3,
          },
        ],
      };
      return option;
    }
    onMounted(() => {
      initChart(powerFactorRef.value);
    });

    return (): JSX.Element => <div class="power-factor" ref={powerFactorRef}></div>;
  },
});

export default StereoBar;
