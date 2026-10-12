<template>
  <div class="gaugeChart" ref="gaugeChart"></div>
</template>

<script lang="jsx">
import { defineComponent, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
export default defineComponent({
  props: {

    unit: {
      type: String,
      default: '',
    },
    data: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    title: {
      type: String,
      default: '',
    },
    detailShow: {
      type: Boolean,
      default: true
    },
    splitLineShow: {
      type: Boolean,
      default: true
    },
    axisTickShow: {
      type: Boolean,
      default: true
    },
    axisLabelShow: {
      type: Boolean,
      default: true
    },
    anchorShow: {
      type: Boolean,
      default: false
    },
    progressShow: {
      type: Boolean,
      default: false
    },
    axisLineColor: {
      type: Array,
      default: () => {
        return [
          [0.35, '#64D040'],
          [0.65, '#FDAD30'],
          [1, '#FF625D']
        ]
      }
    },
    pointerStyle: {
      type: Object,
      default: () => {
        return {
          color: '#F2A226'
        }
      }
    },
    anchorStyle: {
      type: Object,
      default: () => {
        return {
          borderWidth: 6,
          borderColor: "#F2A226"
        }
      }
    },
    anchorSize:{
      type:Number,
      default:12
    }
  },
  setup(props) {
    const gaugeChart = ref(null);
    const setOptions = () => {
      let myChart = echarts.init(gaugeChart.value);
      myChart.clear();
      myChart.setOption({
        tooltip: {
          confine: true,
          formatter: `${props.title}<br/>{b} : {c}${props.unit}`
        },
        series: [
          {
            type: 'gauge',
            max: props.max,
            pointer: {
              itemStyle: props.pointerStyle,
              icon:props.anchorShow?'triangle':''
            },
            axisLabel: {
              show: props.axisLabelShow,
              color: '#B7C1CE',
              fontSize: 8,
            },
            axisTick: {
              show: props.axisTickShow,
              distance: 2,
              lineStyle: {
                color: "#B7C1CE",
                width: 1
              },

            },
            splitLine: {
              show: props.splitLineShow,
              distance: 2,
              lineStyle: {
                color: '#B7C1CE'
              }
            },
            detail: {
              valueAnimation: true,
              formatter: `{value}${props.unit}`,
              fontSize: 20,
              offsetCenter: [0, '70%'],
              show: props.detailShow
            },
            axisLine: {
              show: true,
              lineStyle: {
                width: 10,
                shadowBlur: 0,
                color: props.axisLineColor
              }
            },
            data: [
              {
                value: props.data,

              }
            ],
            anchor: {
              show: props.anchorShow,
              showAbove: true,
              size:props.anchorSize ,
              itemStyle: props.anchorStyle
            },
            progress: {
              show: props.progressShow,
              itemStyle:{
                color:'#1578FF'
              }
            }
          }
        ]
      });
    };
    onMounted(() => {
      setOptions();
    });
    watch(
      () => props.data,
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