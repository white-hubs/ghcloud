<template lang="pug">
div.funnel-chart(:id="'funnel'+id")
</template>

<script  lang="jsx">
import {
  defineComponent,
  inject,
  onMounted,
  reactive,
  nextTick,
  toRefs,
  watch,
} from "vue";
import * as echarts from "echarts";

export default defineComponent({
  props: {
    total: {
      type: Number,
      default: 0,
    },
    highRiskLevelNum: {
      type: Number,
      default: 0,
    },
    lowRiskLevelNum: {
      type: Number,
      default: 0,
    },
    mediumRiskLevelNum: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const state = reactive({
      id: Math.random() * 100,
      myCharts1: null,
      data1: [
        { value: 60, num: 0, name: "低风险" },
        { value: 40, num: 0, name: "中风险" },
        { value: 20, num: 0, name: "高风险" },
      ],
      data2: [
        {
          num: 0,
          value: 60,
          name: "低风险",
          itemStyle: {
            normal: {
              color: {
                x: 1,
                y: 0,
                x2: 0,
                y2: 0,
                type: "linear",
                global: false,
                colorStops: [
                  { offset: 0, color: "rgba(0, 186, 139, 0)" },
                  { offset: 1, color: "rgba(0, 186, 139, 0.5)" },
                ],
              },
              borderWidth: 0,
              opacity: 1,
            },
          },
        },
        {
          num: 0,
          value: 40,
          name: "中风险",
          itemStyle: {
            normal: {
              color: {
                x: 1,
                y: 0,
                x2: 0,
                y2: 0,
                type: "linear",
                global: false,
                colorStops: [
                  { offset: 0, color: "rgba(250, 139, 21, 0)" },
                  { offset: 1, color: "rgba(250, 140, 22, 0.5)" },
                ],
              },
              borderWidth: 0,
              opacity: 1,
            },
          },
        },
        {
          num: 0,
          value: 20,
          name: "高风险",
          itemStyle: {
            normal: {
              color: {
                x: 1,
                y: 0,
                x2: 0,
                y2: 0,
                type: "linear",
                global: false,
                colorStops: [
                  { offset: 0, color: "rgba(245, 34, 45, 0)" },
                  { offset: 1, color: "rgba(245, 34, 45, 0.5)" },
                ],
              },
              borderWidth: 0,
              opacity: 1,
            },
          },
        },
      ],
    });
    const colors = ["#66D6B9", "#FCBA73", "#F97A81"];
    const panelData = reactive({
      options: {
        title: {
          text: "报备商家风险总数:" + props.total,
          left: "0",
          top: "12",
          textAlign: "left",
          textStyle: {
            fontSize: 14,
          },
        },
        backgroundColor: "#ffffff",
        color: colors,
        // tooltip: {
        //     trigger: "item",
        //     formatter: "{b} : {c}%"
        // },
        grid: {
          top: "center",
          left: "2%",
          right: 20,
          bottom: "0",
        },
        xAxis: {
          show: false,
        },
        yAxis: [
          {
            show: false,
            boundaryGap: false,
            type: "category",
            data: [],
          },
        ],
        series: [
          {
            top: "center",
            type: "funnel",
            height: "150",
            gap: 20,
            minSize: 150,
            // left: "15%",
            left: "center",
            width: "60%",
            label: {
              show: true,
              position: "inside",
              color: "white",
              fontSize: "14",
              formatter: function (d) {
                var ins = d.name;
                return ins;
              },
            },
            sort: "ascending",
            data: state.data1,
            z: 3,
          },
          // 百分比
          {
            top: "center",
            type: "funnel",
            height: "150",
            gap: 20,
            minSize: 150,
            left: "35%",
            width: "60%",
            z: 2,
            label: {
              normal: {
                color: "#333",
                position: "insideRight",
                padding: [11, 25],
                formatter: function (d) {
                  var ins = "{aa|" + d.data.num + "}";
                  return ins;
                },
                rich: {
                  aa: {
                    align: "center",
                    color: "#000000",
                    fontSize: "12",
                  },
                },
              },
            },
            tooltip: {
              show: false,
            },
            sort: "ascending",
            data: state.data2,
          },
        ],
      },
    });

    onMounted(() => {
      nextTick(() => {
        state.myCharts1 = echarts.init(
          document.getElementById("funnel" + state.id)
        );
        state.data1[0].num = props.lowRiskLevelNum;
        state.data1[1].num = props.mediumRiskLevelNum;
        state.data1[2].num = props.highRiskLevelNum;
        state.data2[0].num = props.lowRiskLevelNum;
        state.data2[1].num = props.mediumRiskLevelNum;
        state.data2[2].num = props.highRiskLevelNum;
        panelData.options.title.text = "报备商家风险总数:" + props.total;
        state.myCharts1.setOption(panelData.options);
      });
      window.addEventListener("resize", () => {
        state.myCharts1.resize();
      });
    });

    watch(
      () => props.total,
      (n) => {
        state.data1[0].num = props.lowRiskLevelNum;
        state.data1[1].num = props.mediumRiskLevelNum;
        state.data1[2].num = props.highRiskLevelNum;
        state.data2[0].num = props.lowRiskLevelNum;
        state.data2[1].num = props.mediumRiskLevelNum;
        state.data2[2].num = props.highRiskLevelNum;
        panelData.options.title.text = "报备商家风险总数:" + props.total;
        state.myCharts1.setOption(panelData.options);
      }
    );

    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
.funnel-chart {
  width: 100%;
  height: 100%;
}
</style>
