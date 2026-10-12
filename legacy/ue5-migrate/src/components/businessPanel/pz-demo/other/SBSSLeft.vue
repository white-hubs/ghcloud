<template>
  <SubPanelTemplate title="设备设施总览">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime"></DateInlineForm>
    </template>
    <DeviceStatistics imgPath="business-icon/triage-queue/12.png" :statistic="deviceStatusData">
    </DeviceStatistics>
    <div class="chart">
      <elevator-analysis-pie class="abc" style="width: 50%;" :pieData="pieData" :radius="'75'">
        <div style="color: #fff; text-align: center;">
          {{ deviceStatusData.total }}
        </div>
        <div style="color: #fff; text-align: center;">设备总数</div>
      </elevator-analysis-pie>
      <elevatorAnalysisList :contentList="pieData" style="width: 50%;">
      </elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="运行数据统计分析">
    <div class="chart1" ref="abc"> </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "../../security-monitoring-safty/device-statistics.vue"
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import { ModelValueItf } from '../../public/types'
import * as echarts from "echarts";

const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
const pieData = ref([
  {
    name:'消防设备',
    value: 23,
    color:'#328BF7'
  },
  {
    name:'电气设备',
    value: 23,
    color:'#FFC700'
  },
  {
    name:'办公设备',
    value: 23,
    color:'#19F8F7'
  },
  {
    name:'应急设备',
    value: 23,
    color:'#EF424A'
  },
]);
const deviceStatusData=reactive({
  title: "设备数",
  total: 480,
  itemize: [
    {
      name: "离线",
      label: "在线",
      value: 230,
      offline: 150,
      key: "OFFLINE",
    },
  ],
})
const abc = ref()

const initChart = () => {
 // 配置图表选项和数据
 var option = {
            tooltip: {
                trigger: 'axis',
                textStyle: {
              fontSize: 30 // 字体大小
            },
            },
            legend: {
                data: ['故障率', '生产效率'],
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
                boundaryGap: false,
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                textStyle: {
                  color:'#fff',
                  fontSize: 30,
                },
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
                    name: '时间（小时）',
                    position: 'left',
                    axisLine: { lineStyle: { color: '#5470C6' } },
                    axisLabel: { formatter: '{value}h',
                    color:'#fff',
                    fontSize: 34 // 设置y轴标签的字体大小为14
                     }
                },
                {
                    type: 'value',
                    name: '百分比（%）',
                    position: 'right',
                    offset: 0,
                    axisLine: { lineStyle: { color: '#91CC75' } },
                    axisLabel: { formatter: '{value}%',
                    color:'#fff',
                    fontSize: 34 // 设置y轴标签的字体大小为14
                     }
                }
            ],
            series: [
                {
                    name: '故障率',
                    type: 'line',
                    label: {
                        show: true,
                        position: 'top'
                    },
                    data: [2, 1.5, 3, 2.5, 3.5, 2, 1]
                },
                {
                    name: '生产效率',
                    type: 'line',
                    yAxisIndex: 1,
                    label: {
                        show: true,
                        position: 'bottom'
                    },
                    areaStyle: {},
                    data: [80, 85, 82, 88, 86, 83, 87]
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
.chart {
  height: 220px;
  display: flex;
  align-items: center;
  .abc{
    font-size: 22px;
  }
}
.chart1{
  height: 320px;
}
</style>