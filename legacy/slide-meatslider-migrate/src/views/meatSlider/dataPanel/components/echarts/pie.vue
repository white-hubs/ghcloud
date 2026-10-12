<template lang="pug">
div.pie-chart(:id="'pie'+id")
</template>

<script  lang="jsx">
import {
  defineComponent,
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
    porkReportFailedNum: {
      type: Number,
      default: 0,
    },
    porkReportPassedNum: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const state = reactive({
      id: Math.random() * 100,
      myCharts1: null,
    });
    const panelData = reactive({
      options: {
        title: [
          {
            text: "来货报备总数：" + props.total,
            left: "0",
            top: "12",
            textAlign: "left",
            textStyle: {
              fontSize: 14,
            },
          },
          {
            text: "总数",
            top: "50%",
            textAlign: "center",
            left: "49%",
            textStyle: {
              fontSize: 12,
            },
          },
          {
            text: props.total,
            top: "40%",
            textAlign: "center",
            left: "49%",
            textStyle: {
              fontSize: 14,
            },
          },
        ],
        color: ["#00BA8B", "#FA8C16"],
        legend: {
          bottom: 10,
          left: "center",
          icon: "circle",
          selectedMode: false,
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            hoverAnimation: false,
            name: "来货报备数量",
            type: "pie",
            radius: ["45%", "55%"],
            center: ["50%", "50%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            data: [
              {
                value: props.porkReportPassedNum,
                name: "通过",
              },
              {
                value: props.porkReportFailedNum,
                name: "不通过",
              },
            ],
          },
        ],
      },
    });

    watch(
      () => props.total,
      () => {
        panelData.options.title[0].text = "来货报备总数：" + props.total;
        panelData.options.title[2].text = props.total;
        panelData.options.series[0].data[0].value = props.porkReportPassedNum;
        panelData.options.series[0].data[1].value = props.porkReportFailedNum;
        state.myCharts1.setOption(panelData.options);
      }
    );
    onMounted(() => {
      nextTick(() => {
        state.myCharts1 = echarts.init(
          document.getElementById("pie" + state.id)
        );
        state.myCharts1.setOption(panelData.options);
      });
      window.addEventListener("resize", () => {
        state.myCharts1.resize();
      });
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
.pie-chart {
  width: 100%;
  height: 100%;
}
</style>
