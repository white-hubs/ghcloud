<template>
  <SubPanelTemplate title="学生风险等级占比">
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="pieData">
          <div style="color: #fff;text-align: center;font-size: 14px;">{{ getDataTotal() }}</div>
          <div style="color: #fff;text-align: center;font-size: 14px;">风险总数</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="pieData"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import { criminalStatisticsGroup } from '@/api/lingchuanhik'
  
const colors = ['#306CCA', '#3590FF', '#19F8F7', '#2AE8BD', '#FFC700', '#FF6E23']
const pieData = ref([])
  const getDataTotal = ()=>{
    return pieData.value.reduce((sum, item) => sum + item.value, 0)
  }
  const getCriminalStatisticsGroup = async ()=>{
    const res = await criminalStatisticsGroup()
    pieData.value = res.map((item,index)=>{
      return {
        name: item.riskLevel || '其他',
        value: item.total,
        color:colors[index]
      }
    })
  }
  onMounted(()=>{
    getCriminalStatisticsGroup()
  })
</script>
<style lang="less" scoped>
.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
}

.chart {
    width: 280px;
    height: 220px;
}
</style>