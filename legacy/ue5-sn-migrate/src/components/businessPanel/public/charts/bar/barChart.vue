<template>
  <div ref="powerFactorRef" class="power-factor" />
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts'
const powerFactorRef = ref();

const props = withDefaults(defineProps<{
  title: string;
  colorLsit: string[];
  data: {
    color?: string;
    data: any[];
    name: string;
    showBackground?:boolean;
    backgroundStyle?:boolean;
    labelFalge?:boolean;
  }[];
  xData: string[] | undefined;
  unit?: string;
  max?:number;
  inverse?:boolean
}>(), {
  title: '',
  data: () => [],
  xData: () => [],
  inverse:() => false,
  max:()=>undefined,
  colorLsit: () => ["rgba(41,137,255,0)", "#2989FF"],
  unit: ''
});
const render = () => {
  const series: any = props.data.map(x => {
    if (x.data) {
      return {
        type: 'bar',
        showBackground: x.showBackground,
        backgroundStyle: x.backgroundStyle?x.backgroundStyle:{},
        data: x.data,
        color: x.color,
        name: x.name,
        barWidth: 10,
        itemStyle: {
          barBorderRadius: [0, 0, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
            offset: 0,
            color: props.colorLsit[0] // 0% 处的颜色
          }, {
            offset: 1,
            color: props.colorLsit[1] // 100% 处的颜色
          }], false),
          normal:{
            // 柱子lable
          label:{
            show:x.labelFalge,
            position: 'right', 
              formatter: function (val) {
              // let value =  (val.data.value / val.data.total) * 100 
              return `环比${val.data.pop||'0.00'}%`
          },
         }
       }
        },
      }
    } else {
      return ''
    }
  })
  const option: any = {
    title: {
      text: props.title,
      textStyle: {
        color: '#fff',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return params.name + "：   " + params.value + props.unit
      }
    },
    legend: {
      textStyle:{
                fontSize: 12,//字体大小
                color: '#ffffff'//字体颜色
           }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: 0,
      top: 20,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",//虚线
          color: ["rgba(255,255,255,0.3)"],
          width: 1,
        },
      },
      axisLabel: {
        textStyle: {
          color: '#fff' // y轴刻度文字颜色
        }
      }
    },
    yAxis: {
      type: 'category',
      data: props.xData,
      axisLabel: {
        width: 75,
        overflow: 'truncate',
        ellipsis: '...', 
        textStyle: {
          color: '#fff' // y轴刻度文字颜色
        }
      },
      max: props.max,
      inverse:props.inverse
    },
    series
  };
  const myChart = echarts.init(powerFactorRef.value)
  option && myChart.setOption(option)
};
watch(
  () => [...props.xData],
  () => {
    render();
  }
);
watch(
  () => [...props.data],
  () => {
    render();
  }
);

onMounted(() => {
  render()
});
</script>
<style lang="less" scoped>
#load-chart,
.power-factor {
  width: 100%;
  height: 100%;
}
</style>
