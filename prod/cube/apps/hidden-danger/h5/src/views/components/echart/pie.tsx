import * as echarts from "echarts";
import { defineComponent, onMounted, ref, watch } from "vue";

export const Pie = defineComponent({
  props: {
    data: {
      type: Array,
      default: [],
    },
    legend: {
      type: Object,
      default: () => ({
        type: "plain",
      }),
    },
    name: {
      type: String,
      default: "",
    },
    center: {
      type: Array,
      default: ["50%", "50%"],
    },
    radius: {
      type: Array,
      default: ["35%", "50%"],
    },
    label: {
      type: Object,
      default: () => ({}),
    },
    labelLine: {
      type: Object,
      default: () => ({}),
    },
  },
  setup: (props, context) => {
    const myChart = ref();
    const pie = ref();
    const render = (): void => {
      const option = {
        legend: props.legend,
        graphic: {
          type: "text",
          left: "center",
          top: "center",
          silent: true,
          style: {
            text: props.name,
            fill: "#666",
            fontSize: 12,
            width: 64,
            overflow: "truncate",
            align: "center",
            verticalAlign: "middle",
          },
        },
        series: [
          {
            type: "pie",
            radius: props.radius,
            center: props.center,
            label: {
              overflow: "truncate",
              position: "outer",
              alignTo: "edge",
              margin: 0,
              ...(props.label as object),
            },
            labelLine: {
              show: true,
              length: 2,
              length2: 2,
              ...(props.labelLine as object),
            },
            data: props.data,
          },
        ],
      };

      myChart.value = echarts.init(pie.value);
      option && myChart.value.setOption(option);
    };
    onMounted(() => {
      render();
    });
    watch(
      () => props.data,
      () => {
        render();
      },
    );
    context.expose({
      render,
    });
    return (): JSX.Element => (
      <>
        <div id="pie" ref={pie} style="width:100%;height:100%" />
      </>
    );
  },
});
