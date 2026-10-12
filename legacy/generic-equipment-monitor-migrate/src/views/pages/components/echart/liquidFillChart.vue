<template>
  <div class="gaugeChart" ref="gaugeChart"></div>
</template>

<script lang="jsx">
import { defineComponent, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import 'echarts-liquidfill'

export default defineComponent({
  props: {
    data: {
      type: Number,
      default: 65,
    },
    title: {
      type: String,
      default: '',
    },
    max:{
      type: String,
      default: '',
    },
  },
  setup(props) {
    const gaugeChart = ref(null);
    const setOptions = () => {
      let myChart = echarts.init(gaugeChart.value);
      myChart.clear();
      myChart.setOption({
        tooltip: {
            trigger: 'item',
            formatter: function(res) {
                return props.title + ': ' + (res.value * 100 / 1).toFixed(2) + '㎡';
                // return '<span class="ii" style="background:' + res.color + ' "></span>' + res.name + ':<br/> ' + res.value;
            }
        },
        series: [{
          type: 'liquidFill', 
          name: 'Liquid Fill1', 
          radius: '80%',
          center: ['50%', '50%'],
          itemStyle: { 
            opacity: 0.7, 
            shadowBlur: 0 
          },
          data: [
            { 
              name: 'score', 
              direction: 'right',
              value: (props.data / props.max).toFixed(2), 
              itemStyle: { 
                opacity: 1, 
                normal: { 
                  color: '#10B9FF', 
                }
              },
            },
            { 
              name: 'score', 
              direction: 'right',
              value: (props.data / props.max).toFixed(2), 
              itemStyle: { 
                opacity: 1, 
                normal: { 
                  color: '#10B9FF', 
                }
              },
            }
        ],
          backgroundStyle: {   
            color: "#f3fbff",
          },
          label: {  
            color: "#fff", 
            normal: { 
              textStyle: { 
                fontSize: 30, 
                color: '#333'
              },
              formatter: function (param) { 
                return props.data + '㎡'; 
              }
            }
          },
          //外部细圆
          outline: { 
            show: true,
            borderDistance: 6, // 外部圆线距离水球的距离
            itemStyle: { 
              borderWidth: 3,
              borderColor: '#10B9FF', 
            }
          },
        }]
      })
    }
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