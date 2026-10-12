<template>
  <SubPanelTemplate title="区域资产分布情况" class="visiting-data">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="detectionData">
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :showRatio="true" :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import { ModelValueItf } from '../public/types'
import { getPropertyBySourcePie } from '@/api/property'

const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
const detectionData = ref([])
const total = ref(0)
const getTemplateData = async () => {
  const res = await getPropertyBySourcePie({period: trendTime.value.dateRange.join(",")})
  const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
  total.value = 0
  detectionData.value = res.map((e,i)=>{
    total.value +=e.value
    return {
      name: e.name,
      value: e.value,
      color: colors[i]
    }
 })
}
</script>
<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  align-items: center;

  .pie_list {
    width: 160px;
    height: auto;
    margin-left: 10px;
  }

  .chart {
    flex: 1;
    height: 220px;
  }
}
</style>