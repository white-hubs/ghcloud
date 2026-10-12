<template>
  <SubPanelTemplate title="资产状态占比" class="visiting-data">
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
import { ModelValueItf } from '../public/types'
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import { getPropertyByStatus } from '@/api/property'

const assetStatus: { label: string; value: string; }[] = [
  { label: '闲置', value: 'LEAVE_UNUSED' },
  { label: '在用', value: 'MAKE_USE_OF' },
  { label: '报废', value: 'WEED_OUT' },
  { label: '报修', value: 'REPAIR_REPORT' }
]
const trendTime = ref<ModelValueItf>({ timeType: 'TODAY', dateRange: [] });
const detectionData = ref([])
const total = ref(0)
const getTemplateData = async () => {
  const res = await getPropertyByStatus({period: trendTime.value.dateRange.join(",")})
  const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
  total.value = 0
  detectionData.value = res.map((e,i)=>{
    total.value += e.value
    return {
      value: e.value,
      color:colors[i],
      name: assetStatus.find(item=>item.value === e.name)?.label?? e.name
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