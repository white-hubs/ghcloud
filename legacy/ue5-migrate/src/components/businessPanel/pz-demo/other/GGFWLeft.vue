<template>
  <SubPanelTemplate title="消费数据统计分析">
    <div class="chart">
      <barChart :title="'元'" :unit="'元'" :x-data="alarmType.xData"
        :data="[{ color: '#1890FF', name: '', data: alarmType.yData }]" class="columnBox" />
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="资源共享与预订">
    <div class="chart">
      <overviewChartBar :title="'次'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="项目孵化与导师支持">
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="pieData" class="chart-box">
          <div>{{ alarmTotal }}</div>
          <div>总量(万元)</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px;"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import overviewChartBar from "@/components/businessPanel/demo-panel/hospital/overview-chartBar.vue"
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"

const alarmType = reactive({
    xData: ['男', '女', '30岁','20岁', '微信'],
    yData: [3080, 800, 300,200, 540].reverse()
})
const barData = reactive({
    xData: ['1号实验室', '办公区', '行政区', '2号会议室'],
    yData: [
        {
            data: [10, 20, 30, 40, 50, 60, 70],
            name: '次',
            color: ['rgba(25, 248, 247, 0.80)', 'rgba(25, 248, 247, 0)']
        }
    ]
})

const pieData = ref([
  {
    name: '使用资金',
    value: 300,
    color: '#2AE8BD',
  },
  {
    name: '研发资金',
    value: 140,
    color: '#2989FF',
  },
  {
    name: '运营资金',
    value: 100,
    color: '#FFC700',
  },
  {
    name: '设备花费',
    value: 100,
    color: '#F14545',
  },
])
const alarmTotal = ref(100)
</script>
<style lang="less" scoped>
.chart {
  height: 220px;
  .chart-box {
    width: 160px;

    div {
      color: #fff;
      text-align: center;
      font-size: 16px;
    }
  }
}
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}
</style>