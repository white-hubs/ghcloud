<template>
  <div class="guide" ref="guide"></div>
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
      default: 1,
    },
    max: {
      type: Number,
      default: 100,
    },
    title: {
      type: String,
      default: '指标',
    },
    color: {
      type: String,
      default: '#2d99e2',
    },
  },
  setup(props) {
    const guide = ref(null);
    const setOptions = () => {
      let myChart = echarts.init(guide.value);
      myChart.clear();
      var normal=15,all=40;
      myChart.setOption({
        tooltip: {
          show: false,
          confine: true	,
          formatter: `${props.title}<br/>{b} : {c}${props.unit}`
        },
          grid: {
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
          },
          color: props.color,
          series: [
          {
            type: 'gauge',
            name: props.title,
            min: 0, //最小刻度
            max: props.max, //最大刻度

            // radius: '100%',
            // startAngle: 180,
            // endAngle: 0,

            radius: '100%',
            startAngle: 195,
            endAngle: -15,
            
            color: props.color,
            progress: {
              show: true,
              width: 8
            },
            axisLine: {
              lineStyle: {
                color: [
                    [props.data / props.max, new echarts.graphic.LinearGradient(
                        0, 0, 1, 0, [{
                                offset: 0,
                                color: props.color,
                            },
                            {
                                offset: 1,
                                color: props.color,
                            }
                        ]
                    )],
                    [1, "#EDF0F3"]
                ],
                width: 8
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            anchor: {
              show: true,
              showAbove: true,
              size: 10,
              itemStyle: {
                borderWidth: 4,
                borderColor: props.color,
              },
              offsetCenter: [1, 0]
            },
            title: {
              show: false
            },
            detail: {
              show: false,
              valueAnimation: true,
              fontSize: 80,
              offsetCenter: [0, '70%']
            },
            data: [
              {
                value: props.data,
              }
            ]
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
      guide,
    };
  },
});
</script>

<style lang="less" scoped>
.guide {
  width: 100%;
  height: 100%;
}
</style>