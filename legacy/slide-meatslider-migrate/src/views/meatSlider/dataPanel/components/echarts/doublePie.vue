<template lang="pug">
div.pie-chart(:id="'pie'+id")
</template>

<script lang="jsx">
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
    porkArrangeAuditPassedNum: {
      //理货合格数
      type: Number,
      default: 0,
    },
    porkArrangeAuditFailed: {
      //理货合格数
      type: String,
      default: "0",
    },
    porkArrangeAuditFailedNum: {
      //理货不合格数
      type: Number,
      default: 0,
    },
    porkArrangeAuditPassed: {
      //理货不合格数
      type: String,
      default: "0",
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
            text: "理货数据审核总数:" + props.total,
            left: "0",
            top: "12",
            textAlign: "left",
            textStyle: {
              fontSize: 14,
            },
          },
          {
            subtext: "商品合格",
            left: "23%",
            top: "85%",
            textAlign: "center",
          },
          {
            subtext: "商品不合格",
            left: "73%",
            top: "85%",
            textAlign: "center",
          },
        ],
        series: [
          {
            name: "Access From",
            type: "pie",
            hoverAnimation: false,
            radius: ["45%", "55%"],
            center: ["25%", "50%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              // label: {
              //   show: false,
              //   fontSize: "14",
              //   fontWeight: "bold",
              // },
            },
            labelLine: {
              show: false,
            },
            itemStyle: {
              normal: {
                color: "#00BA8B",
              },
            },
            data: [
              {
                value: props.porkArrangeAuditPassedNum,
                name: "合格数",
                label: {
                  normal: {
                    formatter: function (params) {
                      return props.porkArrangeAuditPassed + "%";
                    },
                    position: "center",
                    show: true,
                    textStyle: {
                      fontSize: "24",
                      fontWeight: "400",
                      color: "#000000",
                    },
                  }
                },
              },
              {
                value:
                  props.total === 0
                    ? 100
                    : props.total - props.porkArrangeAuditPassedNum,
                name: "合格数",
                itemStyle: {
                  normal: {
                    color: "#EEEEEE",
                  },
                  emphasis: {
                    color: "#EEEEEE",
                  },
                },
              },
            ],
          },
          {
            name: "不合格数",
            type: "pie",
            hoverAnimation: false,
            radius: ["45%", "55%"],
            center: ["75%", "50%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                // show: false,
                // fontSize: "14",
                // fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            itemStyle: {
              normal: {
                color: "#FA8C16",
              },
            },
            data: [
              {
                value: props.porkArrangeAuditFailedNum,
                name: "不合格数",
                label: {
                  normal: {
                    formatter: function (params) {
                      return props.porkArrangeAuditFailed + "%";
                    },
                    position: "center",
                    show: true,
                    textStyle: {
                      fontSize: "24",
                      fontWeight: "400",
                      color: "#000000",
                    },
                  },
                },
              },
              {
                value:
                  props.total === 0
                    ? 100
                    : props.total - props.porkArrangeAuditFailedNum,
                name: "不合格数",
                itemStyle: {
                  normal: {
                    color: "#EEEEEE",
                  },
                  emphasis: {
                    color: "#EEEEEE",
                  },
                },
              },
            ],
          },
        ],
      },
    });

    watch(
      () => props.total,
      () => {
        panelData.options.title[0].text = "理货数据审核总数:" + props.total;
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
