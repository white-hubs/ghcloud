<template>
  <SubPanelTemplate title="实验数据采集与管理">
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="pieData" class="chart-box">
          <div>{{ alarmTotal }}</div>
          <div>总量</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px;"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="实验室使用率统计分析">
    <div class="equipmentInfo">
      <waterPolo title="" :value="faultRate" unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
      <deviceModule :data-list="dataList"></deviceModule>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="实验室运营统计分析">
    <div class="chart">
      <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import waterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import deviceModule from "@/components/businessPanel/public/deviceModule.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"

const pieData = ref([
  {
    name: '原始数据',
    value: 300,
    color: '#2AE8BD',
  },
  {
    name: '处理数据',
    value: 14,
    color: '#2989FF',
  },
  {
    name: '统计数据',
    value: 10,
    color: '#FFC700',
  },
  {
    name: '结果数据',
    value: 10,
    color: '#F14545',
  },
])
const faultRate = ref<number>(90);
const dataList = reactive([
  {
    title: "使用率",
    value: 100,
    ringRatio: true,
    label: 90,
    unit: "%",
  },
]);
const barData = reactive({
    xData: ['化学实验室', '物理实验室', '生物实验室'],
    yData: [
        {
            data: [10, 20, 30, 40],
            name: '使用',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        },
        {
            data: [18, 25, 48, 52],
            name: '利用',
            color: ['rgba(42, 232, 189, 0.80)', 'rgba(42, 232, 189, 0)']
        },
    ]
})
let alarmTotal = ref<number>(2334)
</script>
<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}

.chart {
  height: 220px;

  .chart-box {
    width: 160px;

    div {
      color: #fff;
      text-align: center;
      font-size: 22px;
    }
  }
}

.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
}
</style>