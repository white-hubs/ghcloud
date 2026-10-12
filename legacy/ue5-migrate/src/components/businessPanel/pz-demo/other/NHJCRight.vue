<template>
  <SubPanelTemplate title="异常报警与预警">
    <OperateDays :value="alarmNum" title="报警总数"> 
        <div class="ringRatio">
          <span>环比</span>
          <!-- uptriangle 向上三角根据Prop改变 -->
          <div :class="['downtriangle', chainRatio > 0 && 'uptriangle']"></div>
          <div :class="[chainRatio > 0 ? 'up' : 'down']">{{ chainRatio + "%" }}</div>
        </div>
      </OperateDays>
      <LineChart :x-data="xData.arr" :series="series" :title="'次'"></LineChart>
  </SubPanelTemplate>
  <SubPanelTemplate title="本年能耗分析">
    <div class="chart1" ref="abc"> </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="能耗指标统计分析">
    <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import * as echarts from "echarts";

const abc = ref()
const alarmNum = ref<number>(132);
const chainRatio = ref<number>(10);
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [10 ,21,18,7,11,17,8],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
const columns = ref([
  {
    title: "能耗类型",
    dataIndex: "type",
  },
  {
    title: "能耗量",
    dataIndex: "num",
  },
  {
    title: "同比率",
    dataIndex: "time",
  },
]);
const data = ref<any>([
  {
    type: "电力(办公区)",
    num: '100,000 kWh',
    time: '+5%'
  },
  {
    type: "天然气(办公区)",
    num: '5,000 m³',
    time: '-3%'
  },
  {
    type: "电力(生产区)",
    num: '95,000 kWh',
    time: '-3%'
  },
  {
    type: "天然气(生产区)",
    num: '20,000 m³',
    time: '+8%'
  },
  {
    type: "电力(办公区)",
    num: '100,000 kWh',
    time: '+5%'
  },
  {
    type: "天然气(办公区)",
    num: '5,000 m³',
    time: '-3%'
  },
  {
    type: "电力(生产区)",
    num: '95,000 kWh',
    time: '-3%'
  },
  {
    type: "天然气(生产区)",
    num: '20,000 m³',
    time: '+8%'
  },
]);
const initChart = () => {
 // 示例数据
 var data = [
            {time: '2023-01-01', energy: 120},
            {time: '2023-01-02', energy: 132},
            {time: '2023-01-03', energy: 101},
            {time: '2023-01-04', energy: 134},
            {time: '2023-01-05', energy: 90},
            {time: '2023-01-06', energy: 230},
            {time: '2023-01-07', energy: 210},
            // ... 可以继续添加更多数据点
        ];
 
        // 提取能耗数据
        var energyData = data.map(function (item) {
            return item.energy;
        });
 
        // 指定图表的配置项和数据
        var option = {
          
            xAxis: {
                type: 'time',
                boundaryGap: false,
                axisLabel: {
                    formatter: function (value) {
                        var date = new Date(value);
                        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                    },
                    textStyle: {
                    color:'#fff',
                    fontSize: 30,
                  },
                },
            },
            yAxis: {
                type: 'value',
                axisLabel: { formatter: '{value}h',
                    color:'#fff',
                    fontSize: 34 // 设置y轴标签的字体大小为14
                     }
            },
            series: [
                {
                    name: '能耗',
                    type: 'line',
                    data: energyData,
                    markArea: {
                        silent: true,
                        data: [
                            // 可以在这里添加标记区域，用于突出显示特定时间段内的能耗
                            // 例如： [{xAxis: '2023-01-03', yAxis: 100}, {xAxis: '2023-01-05', yAxis: 150}]
                        ]
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
.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}
.chart1{
  height: 220px;
}
</style>