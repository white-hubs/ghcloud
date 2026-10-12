import * as echarts from "echarts";
import { defineComponent } from "vue";
import { onMounted, ref, watch } from "vue";

import styles from "./barChart.module.less";

export const BarChart = defineComponent({
  name: "BarChart",
  props: {
    title: { type: String, required: true, default: "" },
    colorLsit: { type: Array, required: true, default: () => ["rgba(41,137,255,0)", "#2989FF"] },
    data: { type: Array, required: true, default: () => [] },
    xData: { type: null, required: true, default: () => [] },
    unit: { type: String, required: false, default: "" },
    max: { type: Number, required: false, default: () => undefined },
    inverse: { type: Boolean, required: false, default: () => false },
  },
  emits: ["barClick"],
  setup(props, { emit }) {
    const powerFactorRef = ref();

    // 定义点击事件的类型
    interface BarClickEvent {
      name: string;
      value: number;
      dataIndex: number;
      metadata: Record<string, any>;
    }

    // 添加emit定义
    const render = (): void => {
      const series: any = props.data.map((x) => {
        if (x.data) {
          return {
            type: "bar",
            showBackground: x.showBackground,
            backgroundStyle: x.backgroundStyle ? x.backgroundStyle : {},
            data: x.data,
            color: x.color,
            name: x.name,
            barWidth: 10,
            itemStyle: {
              barBorderRadius: [0, 0, 0, 0],
              color: new echarts.graphic.LinearGradient(
                0,
                0,
                1,
                0,
                [
                  {
                    offset: 0,
                    color: props.colorLsit[0], // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: props.colorLsit[1], // 100% 处的颜色
                  },
                ],
                false,
              ),
              normal: {
                // 柱子lable
                label: {
                  show: x.labelFalge,
                  position: "right",
                  formatter: function (val) {
                    // let value =  (val.data.value / val.data.total) * 100
                    return `环比${val.data.pop || "0.00"}%`;
                  },
                },
              },
            },
          };
        } else {
          return "";
        }
      });
      const option: any = {
        title: {
          text: props.title,
          textStyle: {
            color: "#fff",
            fontSize: 14,
          },
        },
        tooltip: {
          trigger: "item",
          formatter: function (params) {
            return params.name + "：   " + params.value + props.unit;
          },
        },
        legend: {
          textStyle: {
            fontSize: 12, //字体大小
            color: "#ffffff", //字体颜色
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: 0,
          top: 20,
          containLabel: true,
        },
        xAxis: {
          type: "value",
          boundaryGap: [0, 0.01],
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed", //虚线
              color: ["rgba(255,255,255,0.3)"],
              width: 1,
            },
          },
          axisLabel: {
            textStyle: {
              color: "#fff", // y轴刻度文字颜色
            },
          },
        },
        yAxis: {
          type: "category",
          data: props.xData,
          axisLabel: {
            width: 75,
            overflow: "truncate",
            ellipsis: "...",
            textStyle: {
              color: "#fff", // y轴刻度文字颜色
            },
          },
          max: props.max,
          inverse: props.inverse,
        },
        series,
      };
      if (!powerFactorRef.value) return;
      const myChart = echarts.init(powerFactorRef.value);
      option && myChart.setOption(option);

      // 添加点击事件监听
      myChart.off("click"); // 先移除之前的监听器
      myChart.on("click", (params: any) => {
        if (params.componentType === "series") {
          const clickEvent: BarClickEvent = {
            name: params.name,
            value: params.value,
            dataIndex: params.dataIndex,
            metadata: params.data.metadata,
          };
          emit("barClick", clickEvent);
        }
      });
    };
    watch(
      () => [...props.xData],
      () => {
        render();
      },
    );
    watch(
      () => [...props.data],
      () => {
        render();
      },
    );

    onMounted(() => {
      render();
    });

    return (): JSX.Element => <div ref={powerFactorRef} class="power-factor" />;
  },
});

export default BarChart;
