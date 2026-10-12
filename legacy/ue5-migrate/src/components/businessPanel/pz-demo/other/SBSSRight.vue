<template>
  <SubPanelTemplate title="设备数据分析">
    <div class="chart1" ref="abc"> </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="设备保险与保养">
    <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import * as echarts from "echarts";

const abc = ref()
const columns = ref([
  {
    title: "类型",
    dataIndex: "type",
  },
  {
    title: "数量",
    dataIndex: "num",
  },
  {
    title: "统计时间",
    dataIndex: "time",
  },
]);
const data = ref<any>([
  {
    type: "风险覆盖",
    num: '73',
    time: '2024-11-01'
  },
  {
    type: "日常维护",
    num: '173',
    time: '2024-11-01'
  },
  {
    type: "定期保养",
    num: '26',
    time: '2024-11-01'
  },
  {
    type: "保养记录",
    num: '32',
    time: '2024-11-01'
  },
  {
    type: "保险合同",
    num: '21',
    time: '2024-11-01'
  },
  {
    type: "设备维保",
    num: '24',
    time: '2024-11-01'
  },
  {
    type: "设备财产",
    num: '22',
    time: '2024-11-01'
  },
  {
    type: "计划定制",
    num: '51',
    time: '2024-11-01'
  },
  {
    type: "保养记录",
    num: '13',
    time: '2024-11-01'
  },
]);
const initChart = () => {
 // 配置图表选项和数据
 var option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        },
        textStyle: {
              fontSize: 30 // 字体大小
            },
    },
    legend: {
        data: ['原始数据', '分析趋势'],
        textStyle:{
                fontSize: 32,//字体大小
                color: '#ffffff'//字体颜色
           }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLabel: {
              textStyle: {
                color:'#fff',
                fontSize: 30,
              },
            },
    },
    yAxis: [
        {
            type: 'value',
            name: '数值',
            min: 0,
            axisLabel: {
                    color:'#fff',
                    fontSize: 34 // 设置y轴标签的字体大小为14
                     },
            max: 100, // 根据你的数据调整
            interval: 10 // 根据你的数据调整
        }
    ],
    series: [
        {
            name: '原始数据',
            type: 'bar',
            axisLabel: {
                    color:'#fff',
                    fontSize: 34 // 设置y轴标签的字体大小为14
                     },
            data: [10, 52, 200, 334, 390, 330, 220] // 示例数据
        },
        {
            name: '分析趋势',
            type: 'line',
            data: [15, 55, 190, 320, 380, 325, 215], // 示例分析数据
            smooth: true, // 平滑曲线
            axisLabel: {
                    color:'#fff',
                    fontSize: 34 // 设置y轴标签的字体大小为14
                     },
            markArea: {
                silent: true,
                data: [
                    [
                        { xAxis: 1, yAxis: 55 },
                        { xAxis: 6, yAxis: 325 }
                    ]
                ],
                itemStyle: {
                    color: 'rgba(255, 0, 0, 0.3)'
                }
            }
        }
    ]
};
  const myChart = echarts.init(abc.value as HTMLElement);
 // 使用刚指定的配置项和数据显示图表。
 myChart.setOption(option);
}
onMounted(() => {
 initChart()
})
</script>
<style lang="less" scoped>
.chart1{
  height: 220px;
}
</style>