<template>
  <div class="pieChart" style="height: 240px" ref="pieChart"></div>
</template>

<script lang="jsx">
import { defineComponent, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
export default defineComponent({
  props: {
    data: {
      type: Array,
      default: () => {
        return [];
      },
    },
    nameData: {
      type: Array,
      default: () => {
        return [];
      },
    },
    baseInfo: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props) {
    const pieChart = ref(null);
    onMounted(() => {
      setOptions();
    });
    watch(
      () => props.data,
      value => {
        setOptions();
      },
    );
    const setOptions = () => {
      let myChart = echarts.init(pieChart.value);
      myChart.setOption({
        color: props.colorList,
        tooltip: {
          show: true,
        },
        legend: {
          orient: "vertical",
          icon: "circle",
          itemWidth: 12,
          data: props.nameData,
          right: "0",
          top: "center",
          align: "left",
          textStyle: {
            color: "#fff",
            fontSize: 14,
            rich: {
              a: {
                color: "#262626",
                fontWeight: "bold",
                padding: [0, 16, 0, 16],
              },
              c: {
                color: "#262626",
                fontWeight: "bold",
              },
              b: {
                color: "#4E5969",
                width: 50,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            },
          },
          formatter: function (name) {
            if (props.data.length) {
              let target, ratio;
              for (var i = 0, l = props.baseInfo.length; i < l; i++) {
                if (props.data[i].name == name) {
                  target = props.data[i].value;
                  ratio = props.baseInfo[i].ratio;
                }
              }
              return `{b| ${name}}{a| ${target}} {c| ${ratio}}`;
            }
          },
        },
        toolbox: {
          show: false,
        },
        series: [
          {
            itemStyle: {
              normal: {
                color: function (params) {
                  return new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                    {
                      offset: 0,
                      color: props.baseInfo[params.dataIndex].color,
                    },
                    {
                      offset: 1,
                      color: props.baseInfo[params.dataIndex].color,
                    },
                  ]);
                },
              },
            },
            roseType: "radius",
            labelLine: {
              show: false,
            },
            label: {
              show: false,
            },
            hoverAnimation: true,
            type: "pie",
            radius: [60, 84],
            center: ["30%", "50%"],
            data: props.data,
            z: 10,
          },
        ],
      });
    };
    return {
      pieChart,
    };
  },
});
</script>

<style>
.pieChart {
  width: 100%;
  height: 100%;
}
</style>
