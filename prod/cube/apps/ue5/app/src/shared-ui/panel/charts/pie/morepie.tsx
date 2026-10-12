import { defineComponent } from "vue";

import styles from "./morepie.module.less";

export const Morepie = defineComponent({
  name: "Morepie",
  props: {
    data: { type: null, required: true, default: [] },
    total: { type: [String, Number], required: true, default: 0 },
    title: { type: String, required: true, default: "" },
    center: { type: Array, required: true, default: ["50%", "52%"] },
  },
  setup(props, { expose }) {
    const morepie = ref();
    const render = () => {
      function getData(data) {
        var res = {
          series: [],
          yAxis: [],
        };
        for (let i = 0; i < data.length; i++) {
          res.series.push({
            type: "pie",
            clockWise: true, //顺时加载
            hoverAnimation: false, //鼠标移入变大
            radius: [41 + (i + 1) * 10 + "%", 39 + (i + 1) * 10 + "%"],
            center: props.center,
            label: {
              show: false,
            },
            itemStyle: {
              label: {
                show: false,
              },
              labelLine: {
                show: false,
              },
              borderWidth: 5,
            },
            data: [
              {
                value: data[i].value,
                name: data[i].name,
              },
              {
                value: 100 - data[i].value,
                name: "",
                itemStyle: {
                  color: "rgba(0,0,0,0)",
                  borderWidth: 0,
                },
                tooltip: {
                  show: false,
                },
                hoverAnimation: false,
              },
            ],
          });

          // res.yAxis.push((data[i].value / sumValue * 100).toFixed(2) + "%");
        }
        return res;
      }

      const option = {
        title: {
          text: props.title,
          subtext: props.total == "" ? "" : props.total + "%",
          textStyle: {
            color: "#f2f2f2",
            fontSize: 12,
            width: 1, // 设置标题文字的宽度为图表的宽度
            overflow: "hidden", // 设置文字超出宽度的处理方式为隐藏
            whiteSpace: "nowrap",
            // align: 'center'
          },

          x: "center",
          y: "center",
        },
        tooltip: {
          show: true,
          backgroundColor: "rgba(3, 11, 27, 0.70)",
          borderColor: "rgba(3, 11, 27, 0.70)",
          textStyle: {
            color: "white",
          },
          trigger: "item",
          formatter: "{b}:{c}%",
          position: function (point, params, dom, rect, size) {
            return [point[0] + 10, point[1]]; // 10 是一个可以根据需要调整的间隔值
          },
        },
        color: ["#326bd3", "#3C85FC", "#7297D4", "#7094d5", "#94BAF9"],

        xAxis: [
          {
            show: false,
          },
        ],
        series: getData(props.data).series,
      };
      const myChart = echarts.init(morepie.value);
      option && myChart.setOption(option);
    };
    const piedata = ref([]);
    watch(
      () => props.data,
      (n) => {
        // piedata.value=props.data
        render();
      },
      { deep: true },
    );
    watch(
      () => props.title,
      (n) => {
        // piedata.value=props.data
        render();
      },
      { deep: true },
    );

    onMounted(() => {
      render();
    });

    expose({
      render,
    });

    return (): JSX.Element => (
      <div class={["pie-box"]}>
        {" "}
        <div id="morepie" ref={morepie} style="width: 100%; height: 100%" />
      </div>
    );
  },
});

export default Morepie;
