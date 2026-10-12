<!-- 物业收入总览 -->
<template>
  <SubPanelTemplate>
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmAnalysisTime" @search="changeHandleAlarmAnalysisTime">
      </DateInlineForm>
    </template>
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="pieData">
          <div style="color: #fff;text-align: center;font-size: 14px;">{{ getDataTotal() }}</div>
          <div style="color: #fff;text-align: center;font-size: 14px;">收入总数(元)</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px;"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
  import { ref, reactive,onMounted} from 'vue'
  import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
  import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
  import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
  import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
  import { ModelValueItf } from "../public/types";

  const pieData = ref([
    {
        name: '收入总额',
        value: 30,
        color: '#306CCA',
        ratio: '0%'
    },
    {
        name: '指出总额',
        value: 70,
        color: '#19F8F7',
        ratio: '0%'
    },
  ])
  const getDataTotal = ()=>{
    return pieData.value.reduce((sum, item) => sum + item.value, 0)
  }
  const alarmAnalysisTime = ref<ModelValueItf>();
  const changeHandleAlarmAnalysisTime = ()=>{

  }
 </script>
<style lang="less" scoped>
.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
}

.chart {
    width: 340px;
    height: 220px;
}
</style>