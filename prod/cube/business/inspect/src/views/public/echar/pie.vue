<template>
  <div class="charBox">
    <div ref="pieChart" class="pieChart" />
    <!-- <div class="text">{{ Number(props.data?.slice(0, props.data?.length - 1)) }}%</div> -->
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts'

const props = withDefaults(defineProps<{
  color:string;
  data: string |undefined;
}>(), {
  color: '#1AD598',
  data: '0'
});
const pieChart = ref();

const setOptions = () => {
  const myChart = echarts.init(pieChart.value);
  myChart.clear();
  const option: any = {
    backgroundColor: '#fff',
    color: [props.color, props.color, '#F1F4F9'],
    grid:{ // 让图表占满容器
        top:"0",
        left:"0",
        right:"0",
        bottom:"0"
      },
    series: [{
      type: 'pie',
      center: ['60%', '50%'],
      radius: ['80%', '40%'],
      hoverAnimation: false,
      data: [{
               name: '',
               value: Number(props.data?.slice(0, props.data?.length - 1)),
               label: {
                 show: true,
                 position: 'center',
                 color: '#000000',
                 fontSize: 16,
                 fontWeight: 'bold',
                 formatter: function () {
                   return props.data
                 }
               }
             },
             { // 画中间的图标
               name: '',
               value: 0,
               label: {
                 position: 'inside',
                 width: 30,
                 height: 30,
                 borderRadius: 30,
                 padding: 30
               }
             }, { // 画剩余的刻度圆环
               name: '',
               value: 100 - Number(props.data?.slice(0, props.data?.length - 1)),
               label: {
                 show: false
               }
             }
      ]
    }]
  };
  myChart.setOption(option);
};

watch(
  () => props.data,
  () => {
    setOptions();
  }
);
onMounted(() => {
  setOptions();
});
</script>

<style lang="less" scoped>
.charBox {
  position: relative;

  .pieChart {
    width: 100%;
    height: 100%;
  }

  .text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 25px;
    color: #000;
    text-align: center;
  }
}
</style>
